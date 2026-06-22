import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import data from './waterData.generated.json'
import { chinaData, overseasProjects, pakistanData, sourceLinks } from './chinaData'
import worldGeo from './assets/world.geo.json'
import droughtChild from './assets/drought-child.webp'
import droughtGround from './assets/drought-ground.webp'
import earthWater from './assets/earth-water.webp'
import waterInfra from './assets/water-infra.webp'
import clearRiver from './assets/clear-river.webp'
import forestWaterfall from './assets/forest-waterfall.webp'
import './App.css'

gsap.registerPlugin(ScrollTrigger)
echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

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
  { id: 'concept', label: '流向' },
  { id: 'china', label: '中国' },
  { id: 'overseas', label: '海外' },
  { id: 'pakistan', label: '案例' },
  { id: 'method', label: '来源' }
]

const isMobile = () => window.innerWidth <= 640

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
      },
      onComplete: () => {
        if (ref.current) ref.current.textContent = value.toFixed(decimals)
      }
    })
    return () => tween.kill()
  }, [value, decimals, suffix, prefix])

  return (
    <>
      {prefix}
      <span className="kpi-number" ref={ref}>{Number(0).toFixed(decimals)}</span>
      {suffix && <span className={`kpi-unit ${suffix.length > 1 ? 'word' : ''}`}>{suffix}</span>}
    </>
  )
}

function useEChart(ref, optionFactory, deps = []) {
  useEffect(() => {
    if (!ref.current) return undefined
    const chart = echarts.init(ref.current)
    chart.setOption(optionFactory())
    const onResize = () => {
      chart.resize()
      chart.setOption(optionFactory(), true)
    }
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

function ImagePanel({ image, eyebrow, title, caption, tone = 'blue' }) {
  return (
    <figure className={`image-panel ${tone} reveal`}>
      <img src={image} alt={title} loading="lazy" decoding="async" />
      <figcaption>
        <span>{eyebrow}</span>
        <strong>{title}</strong>
        <p>{caption}</p>
      </figcaption>
    </figure>
  )
}

function InsightChip({ children }) {
  return <div className="insight-chip">{children}</div>
}

function SourceNote({ children, links = [] }) {
  return (
    <div className="source-note">
      <span>{children}</span>
      {links.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label}</a>
      ))}
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
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
    backgroundColor: 'transparent',
    grid: { top: 18, left: mobile ? 96 : 118, right: mobile ? 34 : 38, bottom: mobile ? 38 : 28 },
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
      axisLabel: { color: '#9bb7c7', fontSize: mobile ? 9 : 12, formatter: mode === 'gap' ? '{value}M' : '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((d) => labelOf(d.name)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#dff8ff', fontSize: mobile ? 10 : 12, width: mobile ? 86 : 112, overflow: 'truncate' }
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
      label: { show: true, position: 'right', color: '#ffffff', fontSize: mobile ? 9 : 12, formatter: ({ value }) => mode === 'gap' ? `${value}M` : `${value}%` }
    }],
    animationDuration: 1200,
    animationEasing: 'cubicOut'
    })
  }, [rows, mode])
  return <div className="chart chart-tall" ref={ref} role="img" aria-label={mode === 'gap' ? '各地区未获基本饮水服务人口条形图' : '各地区基本饮水服务覆盖率条形图'} />
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
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
    backgroundColor: 'transparent',
    grid: { top: 24, left: mobile ? 118 : 118, right: mobile ? 58 : 42, bottom: mobile ? 18 : 34 },
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
      axisLabel: { show: !mobile, color: '#aab8c6', formatter: '{value}M' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((d) => labelOf(d.name)),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#fff2cf', fontSize: mobile ? 10 : 12, width: mobile ? 108 : 116, overflow: 'truncate' }
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
      label: { show: true, position: 'right', color: '#ffeab2', fontSize: mobile ? 10 : 12, formatter: ({ value }) => `${value}M` }
    }]
    })
  }, [rows])
  return <div className="chart" ref={ref} role="img" aria-label="各地区未获基本饮水服务人口估算条形图" />
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
      <div className="world-map" ref={ref} role="img" aria-label="全球高水资源压力国家点位地图" />
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
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
    backgroundColor: 'transparent',
    grid: { top: 20, left: mobile ? 110 : 132, right: mobile ? 52 : 50, bottom: mobile ? 18 : 28 },
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
      axisLabel: { show: !mobile, color: '#aab8c6', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: rows.map((d) => d.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#ffd8d8', fontSize: mobile ? 9 : 11, width: mobile ? 100 : 128, overflow: 'truncate' }
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
      label: { show: true, position: 'right', color: '#fff1bd', fontSize: mobile ? 9 : 12, formatter: ({ value }) => `${value}%` }
    }]
    })
  }, [rows])
  return <div className="chart chart-tall" ref={ref} role="img" aria-label="国家水资源压力排行条形图" />
}

function RegionTrendChart() {
  const ref = useRef(null)
  const years = data.regionTrend[0].values.map((d) => d.year)
  const colors = ['#ffce5c', '#ff6d8d', '#43d7ff', '#8bb4ff', '#7af0c9', '#b993ff', '#f0f6ff']
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
    backgroundColor: 'transparent',
    color: colors,
    grid: { top: mobile ? 64 : 48, left: mobile ? 42 : 54, right: mobile ? 12 : 24, bottom: 38 },
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(4,12,24,.94)', borderColor: 'rgba(96,226,255,.36)', textStyle: { color: '#ecfbff' } },
    legend: { type: mobile ? 'scroll' : 'plain', top: 0, right: 0, width: mobile ? '94%' : undefined, textStyle: { color: '#b9d7e6', fontSize: mobile ? 9 : 11 }, itemWidth: 14, itemHeight: 8 },
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
    })
  }, [])
  return <div className="chart" ref={ref} role="img" aria-label="全球主要区域水资源压力趋势折线图" />
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

  return <div className="d3-scatter" ref={ref} role="img" aria-label="国家水资源压力、人均淡水资源与人口关系散点图" />
}

function ChinaQualityChart() {
  const ref = useRef(null)
  const rows = chinaData.surfaceWater
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
      backgroundColor: 'transparent',
      color: ['#71f0c8', '#ff9a70'],
      grid: { top: 58, left: mobile ? 38 : 48, right: mobile ? 12 : 20, bottom: 34 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(4,12,24,.94)',
        borderColor: 'rgba(113,240,200,.35)',
        textStyle: { color: '#ecfbff' },
        formatter(params) {
          return `${params[0].axisValue} 年<br/>Ⅰ—Ⅲ类：${params[0].value}%<br/>劣Ⅴ类：${params[1].value}%`
        }
      },
      legend: { top: 4, right: 0, textStyle: { color: '#b9d7e6', fontSize: mobile ? 10 : 11 } },
      xAxis: {
        type: 'category',
        data: rows.map((item) => item.year),
        axisLabel: { color: '#a9c4d2' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,.15)' } }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
      },
      series: [
        {
          name: 'Ⅰ—Ⅲ类',
          type: 'line',
          smooth: true,
          symbolSize: 9,
          lineStyle: { width: 4 },
          areaStyle: { color: 'rgba(113,240,200,.13)' },
          data: rows.map((item) => item.good)
        },
        {
          name: '劣Ⅴ类',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3 },
          data: rows.map((item) => item.poor)
        }
      ]
    })
  }, [])
  return <div className="chart china-quality-chart" ref={ref} role="img" aria-label="2016 至 2023 年全国地表水水质趋势图" />
}

function InvestmentBarChart() {
  const ref = useRef(null)
  const rows = chinaData.investments.filter((item) => item.type === 'annual')
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
      backgroundColor: 'transparent',
      grid: { top: 18, left: mobile ? 58 : 70, right: 24, bottom: 36 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(4,12,24,.94)',
        borderColor: 'rgba(113,240,200,.35)',
        textStyle: { color: '#ecfbff' },
        formatter(params) {
          const item = rows[params[0].dataIndex]
          return `${item.year} 年<br/>${item.label}：${item.value} ${item.unit}`
        }
      },
      xAxis: {
        type: 'category',
        data: rows.map((item) => item.year),
        axisLabel: { color: '#a9c4d2' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,.15)' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#a9c4d2', formatter: '{value}亿' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
      },
      series: [{
        type: 'bar',
        data: rows.map((item) => item.value),
        barWidth: mobile ? 34 : 44,
        itemStyle: {
          borderRadius: [14, 14, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
            { offset: 0, color: '#1e63ff' },
            { offset: 0.55, color: '#2bd7ff' },
            { offset: 1, color: '#8af0d0' }
          ])
        },
        label: { show: true, position: 'top', color: '#ecfbff', formatter: ({ value }) => `${value}亿` }
      }]
    })
  }, [rows])
  return <div className="chart investment-chart" ref={ref} role="img" aria-label="2021 与 2022 年农村供水完成投资对比" />
}

function ChinaActionDashboard() {
  return (
    <div className="china-dashboard">
      <div className="china-metric-grid">
        <div className="china-metric">
          <span>2025 农村自来水普及率</span>
          <strong><AnimatedNumber value={chinaData.ruralWater.tapWater2025} suffix="%" /></strong>
          <small>离 2030 年 98% 的目标还有 2 个百分点</small>
        </div>
        <div className="china-metric">
          <span>规模化供水覆盖农村人口</span>
          <strong><AnimatedNumber value={chinaData.ruralWater.scaledSupply2025} suffix="%" /></strong>
          <small>覆盖率提高之后，稳定运行成为下一道题</small>
        </div>
        <div className="china-metric target">
          <span>2030 年目标</span>
          <strong><AnimatedNumber value={chinaData.ruralWater.target2030} suffix="%" /></strong>
          <small>全国农村自来水普及率</small>
        </div>
      </div>
      <div className="china-quality-panel">
        <div className="card-head"><span>全国地表水总体水质</span><b>2016—2023</b></div>
        <InsightChip>Ⅰ—Ⅲ类断面占比从 67.8% 升至 89.4%，劣Ⅴ类下降到 0.7%。</InsightChip>
        <ChinaQualityChart />
      </div>
      <div className="china-split">
        <div className="investment-panel">
          <div className="card-head"><span>农村供水投入</span><b>2021—2022</b></div>
          <InsightChip>年度投资只有 2021、2022 两个可比点，其他为累计或不同口径。</InsightChip>
          <InvestmentBarChart />
          <div className="investment-stats">
            {chinaData.investments.filter((item) => item.type === 'cumulative').map((item) => (
              <article key={item.label}>
                <span>{item.year}</span>
                <strong>{item.value}<em>{item.unit}</em></strong>
                <p>{item.label}</p>
              </article>
            ))}
          </div>
        </div>
        <ImagePanel
          image={forestWaterfall}
          eyebrow="CHINA WATER ACTION"
          title="从供水普及转向稳定运行。"
          caption="农村供水进入高覆盖阶段后，水质、工程管护和跨区域调度共同决定服务质量。"
          tone="green"
        />
      </div>
      <div className="diversion-panel">
        <div className="diversion-copy">
          <span>南水北调 · 年度供水</span>
          <strong>{chinaData.diversion.supply}<em>{chinaData.diversion.unit}</em></strong>
          <p>{chinaData.diversion.waterYear} 调水年度，工程累计向{chinaData.diversion.destination}供水。</p>
        </div>
        <div className="diversion-route" aria-hidden="true">
          <span className="route-south">南</span>
          <i className="route-line" />
          <i className="route-drop d1" />
          <i className="route-drop d2" />
          <i className="route-drop d3" />
          <span className="route-north">北</span>
        </div>
      </div>
      <SourceNote links={[
        { label: chinaData.ruralWater.sourceLabel, url: chinaData.ruralWater.source },
        { label: '生态环境部公报', url: chinaData.waterQualitySources[3].url },
        { label: chinaData.diversion.sourceLabel, url: chinaData.diversion.source }
      ]}>
        方法说明：水质采用全国地表水总体断面数据；南水北调采用 2025—2026 调水年度公开报道数据。
      </SourceNote>
    </div>
  )
}

const projectTypeSummary = overseasProjects.reduce((acc, item) => {
  acc[item.type] = (acc[item.type] || 0) + 1
  return acc
}, {})

function OverseasProjectMap() {
  const ref = useRef(null)
  const [selected, setSelected] = useState(overseasProjects[0])

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
      const radius = d3.scaleSqrt().domain([1, 18]).range([7, 24])
      const color = d3.scaleOrdinal()
        .domain(['水电站', '供水', '水坝', '河道治理', '橡胶坝/灌溉', '水利信息化'])
        .range(['#43d7ff', '#7af0c9', '#ffd166', '#ff9a70', '#b993ff', '#8bb4ff'])
      const tip = d3.select(root).append('div').attr('class', 'd3-tip')

      svg.append('g')
        .selectAll('path')
        .data(worldGeo.features)
        .join('path')
        .attr('class', 'map-country overseas-country')
        .attr('d', path)

      const points = svg.append('g')
        .selectAll('g')
        .data(overseasProjects)
        .join('g')
        .attr('class', 'project-point')
        .attr('transform', (d) => {
          const [x, y] = projection([d.lon, d.lat])
          return `translate(${x},${y})`
        })
        .on('mousemove', (event, d) => {
          tip
            .style('opacity', 1)
            .style('left', `${event.offsetX + 12}px`)
            .style('top', `${event.offsetY - 12}px`)
            .html(`<b>${d.country} · ${d.project}</b><br/>${d.type} / ${d.year}${d.investment ? `<br/>已知投资：${d.investment}${d.unit}` : '<br/>投资额：数据缺失'}`)
        })
        .on('mouseleave', () => tip.style('opacity', 0))
        .on('click', (_, d) => setSelected(d))

      points.append('circle')
        .attr('class', 'project-halo')
        .attr('fill', (d) => color(d.type))
        .attr('r', 0)
        .transition()
        .duration(900)
        .delay((_, i) => i * 80)
        .attr('r', (d) => radius(d.investment || 3) * 1.9)

      points.append('circle')
        .attr('class', 'project-core')
        .attr('fill', (d) => color(d.type))
        .attr('r', 0)
        .transition()
        .duration(900)
        .delay((_, i) => i * 80)
        .attr('r', (d) => radius(d.investment || 3))
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <div className="project-map-wrap">
      <div className="world-map project-map" ref={ref} role="img" aria-label="中国海外水利项目点位地图" />
      <div className="project-lock-card">
        <span>{selected.country} · {selected.year}</span>
        <strong>{selected.project}</strong>
        <p>{selected.type}{selected.investment ? ` / ${selected.investment}${selected.unit}` : ' / 投资额缺失'}</p>
      </div>
    </div>
  )
}

function OverseasPortfolio() {
  const knownInvestment = overseasProjects.filter((item) => item.investment).reduce((sum, item) => sum + item.investment, 0)
  return (
    <div className="overseas-dashboard">
      <div className="portfolio-kpis">
        <article>
          <span>项目数量</span>
          <strong>{overseasProjects.length}</strong>
          <p>覆盖 9 个国家，类型包括水电站、供水、水坝、河道治理等。</p>
        </article>
        <article>
          <span>已知投资额</span>
          <strong>{knownInvestment}<em>亿美元</em></strong>
          <p>金额字段仅覆盖部分项目，因此本节以空间分布和项目类型为主。</p>
        </article>
        <article>
          <span>项目类型</span>
          <strong>{Object.keys(projectTypeSummary).length}</strong>
          <p>从工程建设扩展到水资源信息化和流域治理。</p>
        </article>
      </div>
      <OverseasProjectMap />
      <div className="project-type-list">
        {Object.entries(projectTypeSummary).map(([type, count]) => (
          <article key={type}>
            <span>{type}</span>
            <strong>{count}</strong>
          </article>
        ))}
      </div>
      <SourceNote links={[{ label: 'CIDCA', url: sourceLinks.cidca }, { label: '水利部国际合作', url: sourceLinks.mwrInternational }]}>
        方法说明：海外项目按国家点位和项目类型展示；投资额只用于已披露金额的项目，不外推总规模。
      </SourceNote>
    </div>
  )
}

function PakistanTrendChart({ metric }) {
  const ref = useRef(null)
  const current = pakistanData.trends[metric]
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
      backgroundColor: 'transparent',
      grid: { top: 22, left: mobile ? 48 : 62, right: mobile ? 18 : 28, bottom: 38 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(4,12,24,.94)',
        borderColor: 'rgba(113,240,200,.35)',
        textStyle: { color: '#ecfbff' },
        formatter(params) {
          const value = Number(params[0].value).toFixed(metric === 'yield' ? 0 : 1)
          return `${params[0].axisValue} 年<br/>${current.label}：${value} ${current.unit}`
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: current.values.map((item) => item.year),
        axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,.15)' } }
      },
      yAxis: {
        type: 'value',
        scale: true,
        axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11 },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
      },
      series: [{
        name: current.label,
        type: 'line',
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 4, color: metric === 'stress' ? '#ffd166' : '#7af0c9' },
        itemStyle: { color: metric === 'stress' ? '#ffd166' : '#7af0c9' },
        areaStyle: { color: metric === 'stress' ? 'rgba(255,209,102,.14)' : 'rgba(122,240,201,.13)' },
        data: current.values.map((item) => item.value)
      }]
    })
  }, [metric])
  return <div className="chart pakistan-chart" ref={ref} role="img" aria-label={`巴基斯坦${current.label}趋势图`} />
}

function PakistanCaseDashboard() {
  const [metric, setMetric] = useState('stress')
  const current = pakistanData.trends[metric]
  return (
    <div className="pakistan-dashboard">
      <div className="pakistan-tabs" aria-label="切换巴基斯坦指标">
        {Object.entries(pakistanData.trends).map(([key, item]) => (
          <button key={key} className={metric === key ? 'active' : ''} onClick={() => setMetric(key)}>{item.label}</button>
        ))}
      </div>
      <div className="pakistan-grid">
        <div className="pakistan-chart-panel">
          <div className="card-head"><span>{current.note}</span><b>{current.values[0].year}—{current.values[current.values.length - 1].year}</b></div>
          <PakistanTrendChart metric={metric} />
        </div>
        <div className="case-card-grid">
          {pakistanData.caseCards.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}<em>{item.unit}</em></strong>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </div>
      <SourceNote links={[{ label: 'World Bank · Pakistan', url: sourceLinks.pakistan }]}>
        方法说明：巴基斯坦部分呈现水资源与农业背景指标，并列出卡洛特水电站案例；趋势指标不用于推断单一项目成效。
      </SourceNote>
    </div>
  )
}

function PolicyFlow() {
  const [year, setYear] = useState(2024)
  const [active, setActive] = useState('中央统筹')
  const yearThemes = {
    2016: {
      title: '基础建设启动期',
      desc: '重点表现基础设施补短板，资源先流向农村供水和水污染治理两个基础领域。',
      nodes: ['中央统筹', '农村供水', '水污染治理'],
      hotLines: ['l2'],
      dotCount: 2
    },
    2019: {
      title: '流域协同强化期',
      desc: '政策重心转向流域协同和重点区域治理，黄河流域、西北山区开始被突出强调。',
      nodes: ['中央统筹', '黄河流域', '西北山区'],
      hotLines: ['l1', 'l2'],
      dotCount: 3
    },
    2022: {
      title: '后普及运营期',
      desc: '普及之后，重点转为山区供水稳定性、工程管护和县域层面的长期运营。',
      nodes: ['中央统筹', '西南山区', '重点县域', '农村供水'],
      hotLines: ['l3', 'l4'],
      dotCount: 4
    },
    2024: {
      title: '系统治理整合期',
      desc: '供水、水质、重点县域和区域治理被放在同一张网络里，表现多目标协同。',
      nodes: ['中央统筹', '黄河流域', '西北山区', '西南山区', '重点县域', '农村供水', '水污染治理'],
      hotLines: ['l1', 'l2', 'l3', 'l4'],
      dotCount: 5
    }
  }
  const yearTheme = yearThemes[year]
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
          <button
            key={node.name}
            className={`flow-node n${index} ${active === node.name ? 'active' : ''} ${yearTheme.nodes.includes(node.name) ? 'year-hot' : ''}`}
            onClick={() => setActive(node.name)}
          >
            {node.name}
          </button>
        ))}
        {['l1', 'l2', 'l3', 'l4'].map((line) => (
          <div key={line} className={`flow-line ${line} ${yearTheme.hotLines.includes(line) ? 'hot' : ''}`} />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className={`pulse-dot d${(index % 3) + 1} ${index >= yearTheme.dotCount ? 'muted' : ''}`} />
        ))}
      </div>
      <div className="policy-note">
        <span>{year} / {yearTheme.title}</span>
        <strong>{activeNode.name}</strong>
        <p>{activeNode.desc}</p>
        <p className="year-note">{yearTheme.desc}</p>
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
    const root = document.documentElement
    const onPointerMove = (event) => {
      root.style.setProperty('--flow-x', `${event.clientX}px`)
      root.style.setProperty('--flow-y', `${event.clientY}px`)
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
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
    <main className={`story story-${activeSection}`}>
      <div className="water-current" aria-hidden="true" />
      <div className="water-lines" aria-hidden="true" />
      <div className="water-cursor" aria-hidden="true" />
      <div className="progress"><div className="progress-bar" /></div>
      <ChapterNav active={activeSection} />

      <section className="hero" id="top">
        <div className="hero-water" />
        <nav className="topline"><span>DATA NEWS / WATER IN MOTION</span><span>World water resources</span></nav>
        <div className="hero-content">
          <p className="eyebrow">流淌的危机</p>
          <h1 className="hero-title"><span>全球水困局</span><span>与破局之路</span></h1>
          <p className="hero-copy">全球基本饮水服务覆盖率已经超过九成，仍有约 6.96 亿人被留在数字之外。更棘手的是，缺水、人口和区域发展并不总在同一个地方相遇。</p>
          <div className="hero-photo reveal">
            <img src={clearRiver} alt="高山河流" decoding="async" fetchpriority="high" />
          <div>
            <span>FLOWING CONTEXT</span>
            <strong>水的流向，决定风险和治理的方向。</strong>
          </div>
          </div>
          <div className="hero-kpis">
            <Kpi value={data.hero.worldCoverage2024} decimals={2} suffix="%" label="2024 年全球基本饮水服务覆盖率" note="World Bank 指标整理" />
            <Kpi value={data.hero.worldUnservedMillion2024} decimals={1} suffix="百万" label="估算仍未获得基本饮水服务人口" note="由覆盖率 × 总人口计算" />
            <Kpi value={167.14} decimals={2} suffix="%" label="2021 年中东北非区域水资源压力指数" note="区域压力最高" />
          </div>
        </div>
      </section>

      <section className="chapter chapter-intro" id="opening">
        <div className="chapter-bg" />
        <SectionText kicker="00 / OPENING" title="九成覆盖率之外，缺口仍然存在。">
          全球基本饮水服务覆盖率持续提高，但平均值无法呈现地区差异。把覆盖率换算成人数，再叠加水资源压力，风险分布会更加清晰。
        </SectionText>
        <div className="image-collage">
          <ImagePanel
            image={droughtChild}
            eyebrow="HUMAN SCALE"
            title="比例最终会落到人身上。"
            caption="覆盖率越接近高位，剩余缺口越集中，也越容易被平均数遮住。"
          />
          <ImagePanel
            image={earthWater}
            eyebrow="PLANETARY VIEW"
            title="全球视角揭示压力分布。"
            caption="地图、排行和趋势线共同回答：压力在哪里集中，缺口由哪些地区承担。"
            tone="green"
          />
        </div>
      </section>

      <section className="chapter two-col reverse map-chapter" id="map">
        <div className="chapter-bg" />
        <div className="glass-card reveal map-card"><div className="card-head"><span>全球极高水资源压力点位</span><b>2022</b></div><InsightChip>高压力点位集中在中东北非、南亚和中亚一带。</InsightChip><WorldPressureMap /><SourceNote links={[{ label: 'World Bank · 水资源压力', url: sourceLinks.waterStress }]}>点位大小与颜色表示淡水提取量占可再生淡水资源总量的比例。</SourceNote></div>
        <SectionText kicker="01 / MAP" title="高压力国家沿着干旱带聚集。">
          点位地图按水资源压力指数绘制。点的大小和颜色代表压力强度，中东北非、南亚和中亚形成较明显的高值带。
        </SectionText>
      </section>

      <section className="chapter two-col" id="coverage">
        <div className="chapter-bg" />
        <SectionText kicker="02 / DRINKING WATER" title="基础饮水覆盖率接近全球普及，但差距集中在脆弱地区。">
          2024 年全球基本饮水服务覆盖率约 91.45%。这个数字看起来很高，但撒哈拉以南非洲、最不发达国家、脆弱和冲突影响地区仍明显落后。
        </SectionText>
        <div className="glass-card reveal"><div className="card-head"><span>基本饮水服务覆盖率 / 缺口人口</span><b>2024</b></div><InsightChip>全球覆盖率接近 91.45%，但脆弱地区仍明显落后。</InsightChip><CoverageSwitcher /><SourceNote links={[{ label: 'World Bank · 基本饮水服务', url: sourceLinks.drinkingWater }]}>基本饮水服务指取水往返不超过 30 分钟、来自改善水源的饮水服务。</SourceNote></div>
      </section>

      <section className="chapter two-col reverse" id="people">
        <div className="chapter-bg" />
        <div className="glass-card reveal"><div className="card-head"><span>未获基本饮水服务人口估算</span><b>百万人</b></div><InsightChip>比例换成人数后，撒哈拉以南非洲的缺口会被放大。</InsightChip><UnservedChart /><SourceNote links={[{ label: 'World Bank · 人口', url: sourceLinks.population }]}>估算值 = 地区总人口 ×（1 - 基本饮水服务覆盖率）。</SourceNote></div>
        <SectionText kicker="03 / PEOPLE" title="换算成人数后，缺口更加集中。">
          低覆盖率和大人口规模叠加后，缺口会被放大。全球约 6.96 亿人仍未获得基本饮水服务，中低收入经济体承担了其中大部分压力。
        </SectionText>
      </section>

      <section className="chapter two-col" id="stress">
        <div className="chapter-bg" />
        <SectionText kicker="04 / WATER STRESS" title="水资源压力不是平均分布，而是在少数国家被推到极端。">
          水资源压力以淡水提取量占可再生淡水资源总量的比例衡量。埃及、巴林等国家数值远高于其他国家，因此图表采用对数轴展示。
        </SectionText>
        <div className="glass-card reveal"><div className="card-head"><span>国家水资源压力排行</span><b>2022</b></div><InsightChip>极端值远高于普通国家，图表采用对数轴展示。</InsightChip><StressRanking /><SourceNote links={[{ label: 'World Bank · 指标定义', url: sourceLinks.waterStress }]}>数值超过 100% 表示取水量高于当期可再生淡水资源量，图中横轴采用对数刻度。</SourceNote></div>
      </section>

      <section className="chapter two-col reverse" id="relation">
        <div className="chapter-bg" />
        <div className="glass-card reveal"><div className="card-head"><span>压力 × 人均淡水 × 人口</span><b>代表国家</b></div><InsightChip>人口规模会改变压力的含义：高压力小国和人口大国不是同一种问题。</InsightChip><StressScatter /><SourceNote links={[{ label: 'World Bank · 人均淡水资源', url: sourceLinks.freshwater }]}>横轴和纵轴均为对数刻度，气泡面积表示人口规模。</SourceNote></div>
        <SectionText kicker="05 / RELATION" title="同样是高压力，背后的结构不一样。">
          气泡大小代表人口，横轴是人均淡水资源，纵轴是水资源压力。巴基斯坦、印度这类人口大国，和海湾小国的压力结构并不相同。
        </SectionText>
      </section>

      <section className="chapter two-col" id="trend">
        <div className="chapter-bg" />
        <SectionText kicker="06 / REGION TREND" title="区域趋势里，中东北非是一条明显抬高的曲线。">
          2014—2021 年间，中东北非始终处在高位，2021 年达到 167.14%。其他区域的曲线相对平缓，压力并没有平均分布。
        </SectionText>
        <div className="glass-card reveal"><div className="card-head"><span>全球主要区域水压力趋势</span><b>2014—2021</b></div><InsightChip>中东北非曲线长期处在最高位，2021 年达到 167.14%。</InsightChip><RegionTrendChart /><SourceNote links={[{ label: 'World Bank · 水资源压力', url: sourceLinks.waterStress }]}>区域值按 World Bank 地区聚合口径展示；各指标最新年份不同，不进行跨年份因果比较。</SourceNote></div>
      </section>

      <section className="chapter concept" id="concept">
        <div className="chapter-bg" />
        <SectionText kicker="07 / POLICY FLOW" title="供水工程背后，是治理资源的重新分配。">
          政策流向图呈现治理关系：中央统筹连接流域、山区、县域供水和污染治理。年份切换对应不同阶段的政策侧重。
        </SectionText>
        <div className="glass-card reveal concept-card"><PolicyFlow /></div>
      </section>

      <section className="chapter china-chapter" id="china">
        <div className="chapter-bg" />
        <div className="china-heading reveal">
          <span className="eyebrow">08 / CHINA IN ACTION</span>
          <h2>覆盖率之后，投入、水质和长期运行成为新的重点。</h2>
          <p>中国章节聚焦农村供水投入、覆盖率、水质改善和跨区域调水。这些指标共同指向一个变化：工程建设之后，稳定运行和水质保障变得更重要。</p>
        </div>
        <div className="glass-card reveal china-card"><ChinaActionDashboard /></div>
      </section>

      <section className="chapter two-col overseas-chapter" id="overseas">
        <div className="chapter-bg" />
        <SectionText kicker="09 / OVERSEAS PROJECTS" title="海外水利项目呈现出多类型分布。">
          海外项目覆盖水电站、供水、水坝、河道治理、灌溉和水利信息化。本节以国家点位和项目类型展示项目分布，金额信息仅用于已披露项目。
        </SectionText>
        <div className="glass-card reveal overseas-card">
          <div className="card-head"><span>中国海外水利项目</span><b>2006—2024</b></div>
          <InsightChip>10 个项目覆盖 9 个国家，已知投资额只覆盖其中 2 个项目。</InsightChip>
          <OverseasPortfolio />
        </div>
      </section>

      <section className="chapter two-col reverse pakistan-chapter" id="pakistan">
        <div className="chapter-bg" />
        <div className="case-visual-stack">
          <ImagePanel
            image={waterInfra}
            eyebrow="CASE STUDY"
            title="案例从工程项目进入。"
            caption="巴基斯坦部分以卡洛特水电站为入口，同时呈现水资源压力和农业用水背景。"
          />
          <ImagePanel
            image={droughtGround}
            eyebrow="CONTEXT"
            title="背景压力需要单独观察。"
            caption="地下水超采、灌溉效率和水资源压力来自长期结构，不适合由单一项目解释。"
            tone="green"
          />
        </div>
        <SectionText kicker="10 / PAKISTAN CASE" title="巴基斯坦案例显示了水资源压力的多重背景。">
          巴基斯坦长期处于高水资源压力状态。灌溉农地占比、谷物单产和地下水超采共同构成案例背景；卡洛特水电站则提供了基础设施合作的具体切口。
        </SectionText>
        <div className="glass-card reveal pakistan-card"><PakistanCaseDashboard /></div>
      </section>

      <section className="finale" id="method">
        <div className="finale-inner reveal">
          <span className="eyebrow">11 / CONCLUSION</span>
          <h2>水危机没有统一曲线，治理也不是单一工程。</h2>
          <p>全球平均覆盖率继续上升，人口缺口仍集中在脆弱地区；高压力国家面对的是另一组约束。进入后普及阶段后，供水、水质和长期运营需要被放在同一张图里观察。</p>
          <div className="method-grid">
            <article><span>数据范围</span><strong>2014—2025</strong><p>不同指标更新节奏不同，作品保留各自年份，避免跨口径拼接。</p></article>
            <article><span>估算方法</span><strong>覆盖率 × 人口</strong><p>未获基本饮水服务人口由覆盖率和总人口计算，结果保留一位小数。</p></article>
            <article><span>概念图边界</span><strong>关系示意</strong><p>政策流动图用于呈现治理关系和阶段侧重，不代表资金规模或项目数量。</p></article>
          </div>
          <SourceNote links={[
            { label: 'World Bank Data', url: sourceLinks.drinkingWater },
            { label: '水利部', url: chinaData.ruralWater.source },
            { label: '生态环境部', url: chinaData.waterQualitySources[4].url },
            { label: 'World Bank Pakistan', url: sourceLinks.pakistan }
          ]}>数据文件：{data.sources.join('、')}、1_rural_water_investment.csv、2_rural_water_coverage.csv、3_surface_water_quality.csv、4_south_north_diversion.csv、5_overseas_water_projects.csv、6_pakistan_cooperation.csv。图片素材用于情境表达，不作为统计证据。</SourceNote>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>回到顶部</button>
        </div>
      </section>
    </main>
  )
}
