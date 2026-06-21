import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as echarts from 'echarts'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from './waterData.generated.json'
import worldGeo from './assets/world.geo.json'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

const nameZh = {
  World: '全球',
  'High income': '高收入地区',
  'Upper middle income': '中高收入地区',
  'Lower middle income': '中低收入地区',
  'Low income': '低收入地区',
  'Low & middle income': '中低收入经济体',
  'IDA total': 'IDA 国家/地区',
  'Sub-Saharan Africa': '撒哈拉以南非洲',
  'Middle East & North Africa': '中东北非',
  'South Asia': '南亚',
  'East Asia & Pacific': '东亚太平洋',
  'Latin America & Caribbean': '拉美和加勒比',
  'Europe & Central Asia': '欧洲中亚',
  'Fragile and conflict affected situations': '脆弱和冲突影响地区',
  'Least developed countries: UN classification': '最不发达国家',
  'Heavily indebted poor countries (HIPC)': '重债穷国'
}

function labelOf(name) {
  return nameZh[name] || name
}

function fmtMillion(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}十亿`
  return `${value.toFixed(1)}百万`
}

function fmtPeople(value) {
  return `${(value / 1e8).toFixed(1)}亿`
}

const sections = [
  { id: 'top', label: '封面' },
  { id: 'opening', label: '开场' },
  { id: 'map', label: '地图' },
  { id: 'coverage', label: '覆盖' },
  { id: 'people', label: '人口' },
  { id: 'stress', label: '压力' },
  { id: 'relation', label: '结构' },
  { id: 'trend', label: '趋势' },
  { id: 'concept', label: '图 2' }
]

function AnimatedNumber({ value, decimals = 0, suffix = '', prefix = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return undefined
    const target = { current: 0 }
    const tween = gsap.to(target, {
      current: value,
      duration: 1.35,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 86%',
        once: true
      },
      onUpdate: () => {
        ref.current.textContent = target.current.toFixed(decimals)
      }
    })
    return () => tween.kill()
  }, [value, decimals, suffix, prefix])

  return <>{prefix}<span ref={ref}>{Number(0).toFixed(decimals)}</span>{suffix}</>
}

function useEChart(ref, optionFactory, deps = []) {
  useEffect(() => {
    if (!ref.current) return undefined
    const chart = echarts.init(ref.current)
    chart.setOption(optionFactory())
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function Kpi({ value, label, note, decimals = 0, suffix = '', prefix = '' }) {
  return (
    <div className="kpi reveal">
      <strong>
        {typeof value === 'number' ? (
          <AnimatedNumber value={value} decimals={decimals} suffix={suffix} prefix={prefix} />
        ) : value}
      </strong>
      <span>{label}</span>
      {note && <em>{note}</em>}
    </div>
  )
}

function CoverageChart({ mode = 'coverage' }) {
  const ref = useRef(null)
  const rows = useMemo(() => {
    if (mode === 'gap') {
      return [...data.unserved].filter((d) => d.name !== 'World').sort((a, b) => a.unserved - b.unserved)
    }
    return [...data.coverage].sort((a, b) => a.coverage - b.coverage)
  }, [mode])
  useEChart(ref, () => ({
    backgroundColor: 'transparent',
    grid: { top: 18, left: 118, right: 38, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(4, 12, 24, .94)',
      borderColor: 'rgba(96, 226, 255, .36)',
      textStyle: { color: '#ecfbff' },
      formatter(params) {
        const item = rows[params[0].dataIndex]
        if (mode === 'gap') {
          return `${labelOf(item.name)}<br/>未获基本饮水服务人口：${fmtMillion(item.unserved)}<br/>覆盖率：${item.coverage}%`
        }
        return `${labelOf(item.name)}<br/>基本饮水：${item.coverage}%<br/>基本卫生：${item.sanitation ?? '-'}%`
      }
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: mode === 'gap' ? undefined : 100,
      axisLabel: { color: '#9bb7c7', formatter: mode === 'gap' ? '{value}M' : '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((d) => labelOf(d.name)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#dff8ff', fontSize: 12 }
    },
    series: [{
      name: mode === 'gap' ? '未获基本饮水服务人口' : '基本饮水覆盖率',
      type: 'bar',
      data: rows.map((d) => mode === 'gap' ? d.unserved : d.coverage),
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 14, 14, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: mode === 'gap' ? '#5f2cff' : '#1e63ff' },
          { offset: 0.55, color: mode === 'gap' ? '#ff9f43' : '#16c8ff' },
          { offset: 1, color: mode === 'gap' ? '#ffe082' : '#81f6d7' }
        ])
      },
      label: { show: true, position: 'right', color: '#ffffff', formatter: ({ value }) => mode === 'gap' ? `${value}M` : `${value}%` }
    }],
    animationDuration: 1200,
    animationEasing: 'cubicOut'
  }), [rows, mode])
  return <div className="chart chart-tall" ref={ref} />
}

function CoverageSwitcher() {
  const [mode, setMode] = useState('coverage')
  const sectionRef = useRef(null)

  useEffect(() => {
    if (!sectionRef.current) return undefined
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setMode('coverage'),
      onEnterBack: () => setMode('coverage'),
      onLeave: () => setMode('gap')
    })
    return () => trigger.kill()
  }, [])

  return (
    <div className="switch-chart" ref={sectionRef}>
      <div className="mode-toggle" aria-label="切换图表口径">
        <button className={mode === 'coverage' ? 'active' : ''} onClick={() => setMode('coverage')}>覆盖率</button>
        <button className={mode === 'gap' ? 'active' : ''} onClick={() => setMode('gap')}>缺口人口</button>
      </div>
      <CoverageChart mode={mode} />
    </div>
  )
}

function UnservedChart() {
  const ref = useRef(null)
  const rows = useMemo(() => data.unserved.filter((d) => d.name !== 'World').sort((a, b) => b.unserved - a.unserved), [])
  useEChart(ref, () => ({
    backgroundColor: 'transparent',
    grid: { top: 24, left: 118, right: 42, bottom: 34 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(4, 12, 24, .94)',
      borderColor: 'rgba(255, 209, 102, .4)',
      textStyle: { color: '#fff7dc' },
      formatter(params) {
        const item = rows[params[0].dataIndex]
        return `${labelOf(item.name)}<br/>未获基本饮水服务人口：${fmtMillion(item.unserved)}<br/>覆盖率：${item.coverage}%`
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: { color: '#aab8c6', formatter: '{value}M' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((d) => labelOf(d.name)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#fff2cf', fontSize: 12 }
    },
    series: [{
      type: 'bar',
      data: rows.map((d) => d.unserved),
      barWidth: 14,
      itemStyle: {
        borderRadius: [0, 14, 14, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#5f2cff' },
          { offset: 0.6, color: '#ff9f43' },
          { offset: 1, color: '#ffe082' }
        ])
      },
      label: { show: true, position: 'right', color: '#ffeab2', formatter: ({ value }) => `${value}M` }
    }]
  }), [rows])
  return <div className="chart" ref={ref} />
}

const pressurePoints = [
  { code: 'EGY', lon: 30.8, lat: 26.8 },
  { code: 'BHR', lon: 50.55, lat: 26.07 },
  { code: 'TKM', lon: 59.56, lat: 38.97 },
  { code: 'ARE', lon: 54.37, lat: 23.42 },
  { code: 'SAU', lon: 45.08, lat: 23.89 },
  { code: 'LBY', lon: 17.23, lat: 26.34 },
  { code: 'SDN', lon: 30.22, lat: 12.86 },
  { code: 'QAT', lon: 51.18, lat: 25.35 },
  { code: 'MRT', lon: -10.94, lat: 21.01 },
  { code: 'PAK', lon: 69.35, lat: 30.38 },
  { code: 'UZB', lon: 64.59, lat: 41.38 },
  { code: 'SYR', lon: 38.99, lat: 34.8 },
  { code: 'YEM', lon: 48.5, lat: 15.55 },
  { code: 'AZE', lon: 47.58, lat: 40.14 }
].map((point) => ({
  ...point,
  ...data.stressTop.find((item) => item.code === point.code)
})).filter((point) => point.value)

function WorldPressureMap() {
  const ref = useRef(null)
  const [selected, setSelected] = useState(pressurePoints.find((d) => d.code === 'PAK') || pressurePoints[0])

  useEffect(() => {
    if (!ref.current) return undefined
    const root = ref.current

    const draw = () => {
      const width = root.clientWidth || 760
      const height = Math.max(420, Math.min(560, width * 0.58))
      d3.select(root).selectAll('*').remove()

      const svg = d3.select(root).append('svg').attr('viewBox', `0 0 ${width} ${height}`)
      const projection = d3.geoNaturalEarth1().fitExtent([[22, 34], [width - 22, height - 34]], worldGeo)
      const path = d3.geoPath(projection)
      const graticule = d3.geoGraticule10()
      const radius = d3.scaleSqrt().domain(d3.extent(pressurePoints, (d) => d.value)).range([6, 28])
      const color = d3.scaleSequentialLog(d3.interpolateYlOrRd).domain(d3.extent(pressurePoints, (d) => d.value))

      svg.append('path')
        .datum(graticule)
        .attr('class', 'map-graticule')
        .attr('d', path)

      svg.append('g')
        .selectAll('path')
        .data(worldGeo.features)
        .join('path')
        .attr('class', 'map-country')
        .attr('d', path)

      const tip = d3.select(root).append('div').attr('class', 'd3-tip')

      const points = svg.append('g')
        .selectAll('g')
        .data(pressurePoints)
        .join('g')
        .attr('class', 'map-point')
        .attr('transform', (d) => {
          const [x, y] = projection([d.lon, d.lat])
          return `translate(${x},${y})`
        })
        .on('mousemove', (event, d) => {
          tip
            .style('opacity', 1)
            .style('left', `${event.offsetX + 12}px`)
            .style('top', `${event.offsetY - 12}px`)
            .html(`<b>${d.name}</b><br/>水资源压力指数：${d.value}%`)
        })
        .on('mouseleave', () => tip.style('opacity', 0))
        .on('click', (_, d) => setSelected(d))

      points.append('circle')
        .attr('class', 'map-point-halo')
        .attr('r', 0)
        .attr('fill', (d) => color(d.value))
        .transition()
        .duration(900)
        .delay((_, i) => i * 70)
        .attr('r', (d) => radius(d.value) * 1.8)

      points.append('circle')
        .attr('class', 'map-point-core')
        .attr('r', 0)
        .attr('fill', (d) => color(d.value))
        .transition()
        .duration(900)
        .delay((_, i) => i * 70)
        .attr('r', (d) => radius(d.value))

      const labels = new Set(['EGY', 'SAU', 'PAK', 'TKM'])
      points.filter((d) => labels.has(d.code))
        .append('text')
        .attr('class', 'map-point-label')
        .attr('x', (d) => radius(d.value) + 5)
        .attr('y', 4)
        .text((d) => d.name.replace(', Arab Rep.', ''))
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <div className="world-map-wrap">
      <div className="world-map" ref={ref} />
      <div className="map-lock-card">
        <span>当前锁定国家</span>
        <strong>{selected.name}</strong>
        <p>水资源压力指数 <b>{selected.value}%</b></p>
        <small>点击地图上的点位可以切换国家</small>
      </div>
    </div>
  )
}

function StressRanking() {
  const ref = useRef(null)
  const rows = useMemo(() => [...data.stressTop].reverse(), [])
  useEChart(ref, () => ({
    backgroundColor: 'transparent',
    grid: { top: 20, left: 132, right: 50, bottom: 28 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(4, 12, 24, .94)',
      borderColor: 'rgba(255, 112, 112, .4)',
      textStyle: { color: '#fff' },
      formatter(params) {
        const item = rows[params[0].dataIndex]
        return `${item.name}<br/>淡水提取占可再生总量：${item.value}%`
      }
    },
    xAxis: {
      type: 'log',
      logBase: 10,
      axisLabel: { color: '#aab8c6', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#ffd8d8', fontSize: 11 }
    },
    series: [{
      type: 'bar',
      data: rows.map((d) => d.value),
      barWidth: 13,
      itemStyle: {
        borderRadius: [0, 14, 14, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#3816a8' },
          { offset: 0.5, color: '#ff5f7e' },
          { offset: 1, color: '#ffd166' }
        ])
      },
      label: { show: true, position: 'right', color: '#fff1bd', formatter: ({ value }) => `${value}%` }
    }]
  }), [rows])
  return <div className="chart chart-tall" ref={ref} />
}

function RegionTrendChart() {
  const ref = useRef(null)
  const years = data.regionTrend[0].values.map((d) => d.year)
  const colors = ['#ffce5c', '#ff6d8d', '#43d7ff', '#8bb4ff', '#7af0c9', '#b993ff', '#f0f6ff']
  useEChart(ref, () => ({
    backgroundColor: 'transparent',
    color: colors,
    grid: { top: 48, left: 54, right: 24, bottom: 38 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(4,12,24,.94)', borderColor: 'rgba(96,226,255,.36)', textStyle: { color: '#ecfbff' } },
    legend: { top: 0, right: 0, textStyle: { color: '#b9d7e6', fontSize: 11 }, itemWidth: 14, itemHeight: 8 },
    xAxis: { type: 'category', boundaryGap: false, data: years, axisLabel: { color: '#9bb7c7' }, axisLine: { lineStyle: { color: 'rgba(255,255,255,.14)' } } },
    yAxis: { type: 'value', axisLabel: { color: '#9bb7c7', formatter: '{value}%' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } } },
    series: data.regionTrend.map((region, index) => ({
      name: region.name,
      type: 'line',
      smooth: true,
      symbolSize: region.name === '中东北非' ? 8 : 4,
      lineStyle: { width: region.name === '中东北非' ? 4 : 2, color: colors[index] },
      data: region.values.map((d) => d.value)
    }))
  }), [])
  return <div className="chart" ref={ref} />
}

function StressScatter() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return undefined
    const root = ref.current
    const draw = () => {
      const width = root.clientWidth || 720
      const height = 430
      d3.select(root).selectAll('*').remove()
      const margin = { top: 24, right: 28, bottom: 54, left: 64 }
      const innerW = width - margin.left - margin.right
      const innerH = height - margin.top - margin.bottom
      const svg = d3.select(root).append('svg').attr('viewBox', `0 0 ${width} ${height}`)
      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      const x = d3.scaleLog().domain([1, d3.max(data.stressScatter, (d) => d.freshwaterPerCapita) * 1.2]).range([0, innerW])
      const y = d3.scaleLog().domain([20, d3.max(data.stressScatter, (d) => d.stress) * 1.2]).range([innerH, 0])
      const r = d3.scaleSqrt().domain([0, d3.max(data.stressScatter, (d) => d.population)]).range([5, 34])
      const color = d3.scaleSequentialLog(d3.interpolateTurbo).domain([20, d3.max(data.stressScatter, (d) => d.stress)])

      g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(x).ticks(5, '~s')).call((axis) => axis.selectAll('text').attr('fill', '#a9c3d3')).call((axis) => axis.selectAll('path,line').attr('stroke', 'rgba(255,255,255,.18)'))
      g.append('g').call(d3.axisLeft(y).ticks(5, '~s')).call((axis) => axis.selectAll('text').attr('fill', '#a9c3d3')).call((axis) => axis.selectAll('path,line').attr('stroke', 'rgba(255,255,255,.18)'))

      g.append('text').attr('x', innerW / 2).attr('y', innerH + 44).attr('text-anchor', 'middle').attr('fill', '#8faabc').attr('font-size', 12).text('人均内陆淡水资源 m³/人/年（log）')
      g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -45).attr('text-anchor', 'middle').attr('fill', '#8faabc').attr('font-size', 12).text('水资源压力指数 %（log）')

      const tip = d3.select(root).append('div').attr('class', 'd3-tip')
      g.selectAll('circle').data(data.stressScatter).join('circle')
        .attr('cx', (d) => x(d.freshwaterPerCapita))
        .attr('cy', (d) => y(d.stress))
        .attr('r', 0)
        .attr('fill', (d) => color(d.stress))
        .attr('fill-opacity', 0.68)
        .attr('stroke', 'rgba(255,255,255,.72)')
        .attr('stroke-width', 1)
        .on('mousemove', (event, d) => {
          tip.style('opacity', 1).style('left', `${event.offsetX + 12}px`).style('top', `${event.offsetY - 12}px`).html(`<b>${d.name}</b><br/>压力：${d.stress}%<br/>人均淡水：${d.freshwaterPerCapita} m³<br/>人口：${d.population}M`)
        })
        .on('mouseleave', () => tip.style('opacity', 0))
        .transition().duration(900).delay((_, i) => i * 18).attr('r', (d) => r(d.population))

      const labels = ['Egypt, Arab Rep.', 'Pakistan', 'India', 'Saudi Arabia']
      g.selectAll('.point-label').data(data.stressScatter.filter((d) => labels.includes(d.name))).join('text')
        .attr('x', (d) => x(d.freshwaterPerCapita) + r(d.population) + 4)
        .attr('y', (d) => y(d.stress) + 4)
        .attr('fill', '#ecfbff')
        .attr('font-size', 11)
        .text((d) => d.name.replace(', Arab Rep.', ''))
    }
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return <div className="d3-scatter" ref={ref} />
}

function PolicyFlow() {
  const [year, setYear] = useState(2024)
  const [active, setActive] = useState('中央统筹')
  const nodes = [
    { name: '中央统筹', desc: '作为政策与资金的调度中心，向重点区域和重点领域形成资源流动。' },
    { name: '黄河流域', desc: '强调流域协同、生态保护和高质量发展之间的平衡。' },
    { name: '西北山区', desc: '适合表现供水稳定性、防冻和工程管护压力。' },
    { name: '西南山区', desc: '地形复杂，供水工程更依赖区域适配和长期运营。' },
    { name: '重点县域', desc: '承接政策倾斜的末端场景，可对应贫困县、山区县等对象。' },
    { name: '农村供水', desc: '从“有水喝”转向“喝好水、稳定供水”的民生工程。' },
    { name: '水污染治理', desc: '与地表水水质改善、水环境监管和地方执行能力相关。' }
  ]
  const activeNode = nodes.find((node) => node.name === active) || nodes[0]

  return (
    <div className="policy-wrap">
      <div className="policy-years" aria-label="概念年份轴">
        {[2016, 2019, 2022, 2024].map((item) => (
          <button key={item} className={year === item ? 'active' : ''} onClick={() => setYear(item)}>{item}</button>
        ))}
      </div>
      <div className={`policy-flow y${year}`}>
        {nodes.map((node, index) => (
          <button key={node.name} className={`flow-node n${index} ${active === node.name ? 'active' : ''}`} onClick={() => setActive(node.name)}>
            {node.name}
          </button>
        ))}
        <div className="flow-line l1" />
        <div className="flow-line l2" />
        <div className="flow-line l3" />
        <div className="flow-line l4" />
        <div className="pulse-dot d1" />
        <div className="pulse-dot d2" />
        <div className="pulse-dot d3" />
      </div>
      <div className="policy-note">
        <span>{year} / 概念演示</span>
        <strong>{activeNode.name}</strong>
        <p>{activeNode.desc}</p>
      </div>
    </div>
  )
}

function SectionText({ kicker, title, children }) {
  return (
    <div className="section-text reveal">
      <span className="eyebrow">{kicker}</span>
      <h2>{title}</h2>
      <p>{children}</p>
    </div>
  )
}

function useActiveSection() {
  const [active, setActive] = useState('top')

  useEffect(() => {
    const observed = sections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean)
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target?.id) setActive(visible.target.id)
    }, { rootMargin: '-35% 0px -45% 0px', threshold: [0.05, 0.25, 0.5] })
    observed.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return active
}

function ChapterNav({ active }) {
  return (
    <aside className="chapter-nav" aria-label="章节导航">
      {sections.map((section, index) => (
        <button
          key={section.id}
          className={active === section.id ? 'active' : ''}
          onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <span>{String(index + 1).padStart(2, '0')}</span>
          {section.label}
        </button>
      ))}
    </aside>
  )
}

export default function App() {
  const activeSection = useActiveSection()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.progress-bar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } })
      gsap.from('.hero-title span', { yPercent: 115, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power4.out' })
      gsap.from('.hero-copy', { y: 28, opacity: 0, delay: 0.3, duration: 0.8, ease: 'power3.out' })
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 54, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 78%' } })
      })
      gsap.utils.toArray('.chapter').forEach((section) => {
        gsap.to(section.querySelector('.chapter-bg'), { yPercent: -18, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      gsap.to('.pulse-dot', { offsetDistance: '100%', duration: 4, repeat: -1, ease: 'none', stagger: 0.7 })
      gsap.to('.flow-node', { boxShadow: '0 0 34px rgba(104,226,255,.42)', duration: 1.6, yoyo: true, repeat: -1, stagger: 0.2, ease: 'sine.inOut' })
      gsap.to('.map-card .world-map svg', {
        scale: 1.45,
        xPercent: -16,
        yPercent: 2,
        transformOrigin: '60% 42%',
        ease: 'power2.inOut',
        scrollTrigger: {
          trigger: '#map',
          start: 'top 34%',
          end: 'bottom 55%',
          scrub: 0.6
        }
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <main>
      <div className="progress"><div className="progress-bar" /></div>
      <ChapterNav active={activeSection} />

      <section className="hero" id="top">
        <div className="hero-water" />
        <nav className="topline"><span>DATA NEWS / FRONT HALF</span><span>World water resources</span></nav>
        <div className="hero-content">
          <p className="eyebrow">流淌的危机</p>
          <h1 className="hero-title"><span>全球水困局</span><span>与破局之路</span></h1>
          <p className="hero-copy">先把有数据支撑的前半部分做完整：全球基础饮水覆盖、水资源压力、区域趋势，以及“中国治理”开头的政策资源概念动效。后半部分等客户补齐投资、海外项目和巴基斯坦案例数据后再接上。</p>
          <div className="hero-kpis">
            <Kpi value={data.hero.worldCoverage2024} decimals={2} suffix="%" label="2024 年全球基本饮水服务覆盖率" note="World Bank 指标整理" />
            <Kpi value={data.hero.worldUnservedMillion2024} decimals={1} suffix="百万" label="估算仍未获得基本饮水服务人口" note="由覆盖率 × 总人口计算" />
            <Kpi value={167.14} decimals={2} suffix="%" label="2021 年中东北非区域水资源压力指数" note="区域压力最高" />
          </div>
        </div>
      </section>

      <section className="chapter chapter-intro" id="opening">
        <div className="chapter-bg" />
        <SectionText kicker="00 / OPENING" title="这部分不是单纯摆图表，而是把数据变成一段能往下读的叙事。">
          当前数据已经能说明三个问题：全球基本饮水服务仍有缺口；水资源压力在少数国家和区域高度集中；不同区域的压力曲线差异很大。页面会按这个顺序展开。
        </SectionText>
      </section>

      <section className="chapter two-col reverse map-chapter" id="map">
        <div className="chapter-bg" />
        <div className="glass-card reveal map-card"><div className="card-head"><span>全球极高水资源压力点位</span><b>2022</b></div><WorldPressureMap /></div>
        <SectionText kicker="01 / MAP" title="先给读者一张世界图，问题集中在哪里会更清楚。">
          这里用现有的水资源压力指数做点位地图。点的大小和颜色代表压力强度，重点突出中东北非、南亚和中亚一带，为后面的排行、散点图和区域趋势做铺垫。
        </SectionText>
      </section>

      <section className="chapter two-col" id="coverage">
        <div className="chapter-bg" />
        <SectionText kicker="02 / DRINKING WATER" title="基础饮水覆盖率接近全球普及，但差距集中在脆弱地区。">
          2024 年全球基本饮水服务覆盖率约 91.45%。这个数字看起来很高，但撒哈拉以南非洲、最不发达国家、脆弱和冲突影响地区仍明显落后。
        </SectionText>
        <div className="glass-card reveal"><div className="card-head"><span>基本饮水服务覆盖率 / 缺口人口</span><b>2024</b></div><CoverageSwitcher /></div>
      </section>

      <section className="chapter two-col reverse" id="people">
        <div className="chapter-bg" />
        <div className="glass-card reveal"><div className="card-head"><span>未获基本饮水服务人口估算</span><b>Million people</b></div><UnservedChart /></div>
        <SectionText kicker="03 / PEOPLE" title="从比例换成人数后，问题会更直观。">
          低覆盖率和大人口规模叠加后，缺口会被放大。全球约 6.96 亿人仍未获得基本饮水服务，中低收入经济体承担了其中大部分压力。
        </SectionText>
      </section>

      <section className="chapter two-col" id="stress">
        <div className="chapter-bg" />
        <SectionText kicker="04 / WATER STRESS" title="水资源压力不是平均分布，而是在少数国家被推到极端。">
          这里用淡水提取占可再生总量的比例衡量压力。由于埃及、巴林等国家数值远高于其他国家，图表使用对数轴，避免极端值把其他国家压扁。
        </SectionText>
        <div className="glass-card reveal"><div className="card-head"><span>国家水资源压力排行</span><b>2022</b></div><StressRanking /></div>
      </section>

      <section className="chapter two-col reverse" id="relation">
        <div className="chapter-bg" />
        <div className="glass-card reveal"><div className="card-head"><span>压力 × 人均淡水 × 人口</span><b>Selected countries</b></div><StressScatter /></div>
        <SectionText kicker="05 / RELATION" title="同样是高压力，背后的结构不一样。">
          气泡大小代表人口，横轴是人均淡水资源，纵轴是水资源压力。巴基斯坦、印度这类人口大国，和海湾小国的压力结构并不相同。
        </SectionText>
      </section>

      <section className="chapter two-col" id="trend">
        <div className="chapter-bg" />
        <SectionText kicker="06 / REGION TREND" title="区域趋势里，中东北非是一条明显抬高的曲线。">
          task3 的区域数据最完整，覆盖 2014-2021 年。中东北非在 2021 年达到 167.14%，与其他区域拉开明显差距，适合作为前半部分的视觉高潮。
        </SectionText>
        <div className="glass-card reveal"><div className="card-head"><span>全球主要区域水压力趋势</span><b>2014-2021</b></div><RegionTrendChart /></div>
      </section>

      <section className="chapter concept" id="concept">
        <div className="chapter-bg" />
        <SectionText kicker="07 / CONCEPT MOTION" title="图 2 按客户确认，先做政策资源流动的概念动效。">
          这一段不标成严格数据图。它负责承接“中国探索”章节：用中央节点、重点区域、供水和治污节点之间的光点流动，表现“政策资源并非平均撒布，而是围绕重点区域动态调整”。
        </SectionText>
        <div className="glass-card reveal concept-card"><PolicyFlow /></div>
      </section>

      <section className="finale">
        <div className="finale-inner reveal">
          <span className="eyebrow">NEXT DATA NEEDED</span>
          <h2>前半部分已可成型，后半部分等六类数据补齐后继续接。 </h2>
          <p>后续再补：中国投资额、农村自来水/规模化供水、地表水水质、南水北调、海外项目明细、巴基斯坦合作成效。当前页面数据来源：{data.sources.join('、')}。</p>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>回到顶部</button>
        </div>
      </section>
    </main>
  )
}
