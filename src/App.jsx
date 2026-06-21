import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import * as echarts from 'echarts'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const coverageData = [
  { region: 'Europe', value: 98.1, delta: 0.3 },
  { region: 'Arab World', value: 90.2, delta: 0.8 },
  { region: 'East Asia', value: 95.1, delta: 1.1 },
  { region: 'Caribbean', value: 97.6, delta: 0.2 },
  { region: 'Africa West', value: 76.3, delta: 1.9 },
  { region: 'Africa East', value: 61.6, delta: 2.5 },
  { region: 'Fragile states', value: 70.7, delta: 1.5 },
  { region: 'IDA only', value: 71.6, delta: 1.8 }
]

const timelineData = [
  ['2020', 73.4, 88.1],
  ['2021', 74.1, 88.8],
  ['2022', 74.9, 89.4],
  ['2023', 75.7, 90.1],
  ['2024', 76.8, 90.8]
]

const pressureData = [
  { name: '人口增长', value: 82, color: '#56d6ff' },
  { name: '农业用水', value: 76, color: '#7af0c9' },
  { name: '气候干旱', value: 64, color: '#ffd166' },
  { name: '基础设施', value: 58, color: '#ff7a90' },
  { name: '污染风险', value: 46, color: '#a48cff' },
  { name: '治理能力', value: 38, color: '#8fb9ff' }
]

function useEChart(ref, optionFactory) {
  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chart.setOption(optionFactory())
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
    }
  }, [ref, optionFactory])
}

function CoverageChart() {
  const chartRef = useRef(null)
  useEChart(chartRef, () => ({
    backgroundColor: 'transparent',
    grid: { top: 20, right: 24, bottom: 44, left: 72 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 14, 31, .92)',
      borderColor: 'rgba(93, 217, 255, .35)',
      textStyle: { color: '#eaf7ff' }
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: { color: '#9fb9c9', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    yAxis: {
      type: 'category',
      data: coverageData.map((d) => d.region),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#d8f5ff', fontSize: 12 }
    },
    series: [
      {
        type: 'bar',
        data: coverageData.map((d) => d.value),
        barWidth: 16,
        itemStyle: {
          borderRadius: [0, 12, 12, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#1271ff' },
            { offset: 0.62, color: '#21d3ff' },
            { offset: 1, color: '#8affdc' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          color: '#ffffff',
          formatter: ({ value }) => `${value}%`
        }
      }
    ],
    animationDuration: 1400,
    animationEasing: 'cubicOut'
  }))
  return <div className="chart chart-tall" ref={chartRef} />
}

function TimelineChart() {
  const chartRef = useRef(null)
  useEChart(chartRef, () => ({
    backgroundColor: 'transparent',
    grid: { top: 28, right: 24, bottom: 36, left: 42 },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(5, 14, 31, .92)',
      borderColor: 'rgba(93, 217, 255, .35)',
      textStyle: { color: '#eaf7ff' }
    },
    legend: {
      top: 0,
      right: 0,
      textStyle: { color: '#b9d7e6' },
      itemWidth: 14,
      itemHeight: 8
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timelineData.map((d) => d[0]),
      axisLabel: { color: '#a9c3d3' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,.15)' } }
    },
    yAxis: {
      type: 'value',
      min: 68,
      max: 94,
      axisLabel: { color: '#a9c3d3', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
    },
    series: [
      {
        name: '脆弱地区',
        type: 'line',
        smooth: true,
        data: timelineData.map((d) => d[1]),
        symbolSize: 8,
        lineStyle: { width: 4, color: '#ffcf70' },
        itemStyle: { color: '#ffcf70' },
        areaStyle: { color: 'rgba(255,207,112,.12)' }
      },
      {
        name: '全球平均',
        type: 'line',
        smooth: true,
        data: timelineData.map((d) => d[2]),
        symbolSize: 8,
        lineStyle: { width: 4, color: '#28d7ff' },
        itemStyle: { color: '#28d7ff' },
        areaStyle: { color: 'rgba(40,215,255,.12)' }
      }
    ],
    animationDuration: 1500
  }))
  return <div className="chart" ref={chartRef} />
}

function D3Bubble() {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const width = ref.current.clientWidth
    const height = 360
    d3.select(ref.current).selectAll('*').remove()

    const svg = d3
      .select(ref.current)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', '水资源压力因素气泡图')

    const nodes = pressureData.map((d) => ({
      ...d,
      radius: 24 + d.value * 0.45,
      x: Math.random() * width,
      y: Math.random() * height
    }))

    const simulation = d3
      .forceSimulation(nodes)
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('charge', d3.forceManyBody().strength(18))
      .force('collision', d3.forceCollide().radius((d) => d.radius + 4))
      .on('tick', ticked)

    const group = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'bubble-node')

    group
      .append('circle')
      .attr('r', 0)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.18)
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1.5)
      .transition()
      .duration(900)
      .delay((_, i) => i * 90)
      .attr('r', (d) => d.radius)

    group
      .append('text')
      .text((d) => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '-.1em')
      .attr('fill', '#eafaff')
      .attr('font-size', 13)
      .attr('font-weight', 700)

    group
      .append('text')
      .text((d) => d.value)
      .attr('text-anchor', 'middle')
      .attr('dy', '1.35em')
      .attr('fill', '#93eaff')
      .attr('font-size', 18)
      .attr('font-weight', 900)

    function ticked() {
      group.attr('transform', (d) => `translate(${d.x},${d.y})`)
    }

    return () => simulation.stop()
  }, [])

  return <div className="d3-bubble" ref={ref} />
}

function Kpi({ value, label, tone }) {
  return (
    <div className={`kpi ${tone || ''}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function NarrativeCard({ eyebrow, title, body, stat }) {
  return (
    <article className="narrative-card reveal">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{body}</p>
      {stat && <div className="mini-stat">{stat}</div>}
    </article>
  )
}

export default function App() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.progress-bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2
        }
      })

      gsap.from('.hero-title span', {
        yPercent: 120,
        opacity: 0,
        duration: 1.1,
        stagger: 0.08,
        ease: 'power4.out'
      })

      gsap.from('.hero-kpis .kpi', {
        y: 36,
        opacity: 0,
        duration: 0.8,
        delay: 0.35,
        stagger: 0.12,
        ease: 'power3.out'
      })

      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 56, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 78%'
            }
          }
        )
      })

      gsap.to('.orb-a', {
        y: -140,
        x: 60,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      })
      gsap.to('.orb-b', {
        y: 160,
        x: -80,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      })

      gsap.to('.map-pin', {
        scale: 1.2,
        opacity: 1,
        stagger: 0.08,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: '.world-panel',
          start: 'top 68%'
        }
      })

      gsap.to('.sticky-visual', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: '.story-grid',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      })
    })

    return () => ctx.revert()
  }, [])

  return (
    <main>
      <div className="progress">
        <div className="progress-bar" />
      </div>

      <section className="hero">
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="water-grid" />
        <nav className="topline">
          <span>DATA STORY DEMO</span>
          <span>World Water Resources · 2026</span>
        </nav>
        <div className="hero-content">
          <p className="eyebrow">世界水资源情况 · 可视化叙事样例</p>
          <h1 className="hero-title">
            <span>水</span>
            <span>不</span>
            <span>只</span>
            <span>是</span>
            <span>资</span>
            <span>源</span>
          </h1>
          <p className="hero-copy">
            这个 demo 用前端代码模拟 Readymag 风格的长页数据新闻：大标题、滚动转场、固定视觉面板、动态图表和数据节点。
          </p>
          <div className="hero-kpis">
            <Kpi value="61.6%" label="东部非洲基本饮水覆盖示例" tone="blue" />
            <Kpi value="99.1%" label="高收入地区覆盖示例" tone="green" />
            <Kpi value="8+" label="可替换区域指标" tone="yellow" />
          </div>
        </div>
      </section>

      <section className="section intro">
        <div className="section-label reveal">SCROLL STORY</div>
        <div className="intro-copy reveal">
          <h2>把 Excel 里的指标，转成可以阅读的新闻页面。</h2>
          <p>
            客户给的数据可以被整理成地区、年份、指标代码、数值四类核心字段。页面不强调复杂后台，而强调用户向下滚动时，一段段理解水资源差异。
          </p>
        </div>
      </section>

      <section className="story-grid">
        <div className="story-copy">
          <NarrativeCard
            eyebrow="01 · ACCESS"
            title="饮水覆盖率不是一个数字，而是一条不均衡的曲线。"
            body="同样是 2024 年，部分经济体已经接近全面覆盖，但脆弱地区仍然落在后面。数据新闻的关键，是把这种差异讲清楚。"
            stat="coverage gap / 约 37.5 pct"
          />
          <NarrativeCard
            eyebrow="02 · CHANGE"
            title="滚动不是装饰，它负责控制信息出现的节奏。"
            body="图表可以随章节逐步出现，数值标签延迟进场，背景视觉缓慢位移，形成类似 Readymag 的叙事节奏。"
            stat="GSAP ScrollTrigger"
          />
          <NarrativeCard
            eyebrow="03 · PRESSURE"
            title="压力因素可以被拆成节点，而不是堆满表格。"
            body="人口、农业、气候、基础设施等因素可用 D3 做成气泡、网络或地图节点，形成更强的参赛作品视觉感。"
            stat="D3 force layout"
          />
        </div>
        <div className="sticky-visual">
          <div className="glass-card chart-card reveal">
            <div className="card-heading">
              <span>Basic drinking water coverage</span>
              <strong>2024</strong>
            </div>
            <CoverageChart />
          </div>
        </div>
      </section>

      <section className="section split-section">
        <div className="glass-card reveal">
          <div className="card-heading">
            <span>Trend comparison</span>
            <strong>2020—2024</strong>
          </div>
          <TimelineChart />
        </div>
        <div className="side-note reveal">
          <p className="eyebrow">ECharts</p>
          <h2>图表可以保留真实交互。</h2>
          <p>
            鼠标悬停 tooltip、动态入场、响应式尺寸，这些是纯设计工具很难长期维护的部分。后续替换客户完整数据时，只需要改数据文件。
          </p>
        </div>
      </section>

      <section className="section world-panel">
        <div className="world-copy reveal">
          <p className="eyebrow">GLOBAL PRESSURE</p>
          <h2>用视觉节点表现水资源压力。</h2>
          <p>
            这里用 D3 生成压力气泡，正式版本可以替换为地图、河流路径、国家点位或用水强度网络。
          </p>
        </div>
        <div className="glass-card reveal">
          <D3Bubble />
          <div className="pin-layer">
            <span className="map-pin p1" />
            <span className="map-pin p2" />
            <span className="map-pin p3" />
            <span className="map-pin p4" />
          </div>
        </div>
      </section>

      <section className="finale">
        <div className="finale-inner reveal">
          <p className="eyebrow">HANDOFF</p>
          <h2>正式项目可以直接接客户数据。</h2>
          <p>
            后续可以把 Excel/CSV 转成 JSON，按章节绑定不同图表；构建后发布到 GitHub Pages、Cloudflare Pages、Netlify 或其他免费静态平台。
          </p>
          <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
            回到开头
          </a>
        </div>
      </section>
    </main>
  )
}
