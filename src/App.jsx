import React, { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import * as d3 from 'd3'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import data from './waterData.generated.json'
import { chinaData, overseasProjects, pakistanData, sourceLinks } from './chinaData'
import worldGeo from './assets/world.geo.json'
import clearRiver from './assets/clear-river.webp'
import forestWaterfall from './assets/forest-waterfall.webp'
import chinaNewsEcologyOne from './assets/china-news-ecology-1.png'
import chinaNewsEcologyTwo from './assets/china-news-ecology-2.png'
import clientWaterPressure from './assets/client/water-pressure.jpg'
import droughtCrackedLand from './assets/client/drought-cracked-land.webp'
import clientTurkana from './assets/client/turkana.jpg'
import somaliaDisplacement from './assets/client/somalia-displacement.png'
import yemenAdenMarket from './assets/client/yemen-aden-market.png'
import clientWaterQuality from './assets/client/water-quality.jpg'
import clientPakistanProjectOne from './assets/client/china-pakistan-project-1.png'
import clientPakistanProjectTwo from './assets/client/china-pakistan-project-2.png'
import mapFlowIllustration from './assets/client/map-flow-illustration.png'
import bottledWaterIllustration from './assets/client/bottled-water-illustration.png'
import waterRecycleIllustration from './assets/client/water-recycle-illustration.png'
import shipIllustration from './assets/client/ship-illustration.png'
import fishIllustration from './assets/client/fish-illustration.png'
import houseIllustration from './assets/client/house-illustration.png'
import windIllustration from './assets/client/wind-illustration.png'
import oceanAnimalsIllustration from './assets/client/ocean-animals-illustration.png'
import shortageSeedling from './assets/client/shortage-seedling.jpg'
import yangtzeEstuaryLandsat from './assets/client/yangtze-estuary-landsat.png'
import illustrationWaterDrop from './assets/client/illustration-water-drop.png'
import illustrationHelp from './assets/client/illustration-help.png'
import endingDujiangyan from './assets/ending/dujiangyan.webp'
import endingSystemGovernance from './assets/ending/system-governance.webp'
import endingRoomForRiver from './assets/ending/room-for-river.webp'
import endingDripIrrigation from './assets/ending/drip-irrigation.webp'
import endingNewater from './assets/ending/newater.webp'
import endingSharedFuture from './assets/ending/shared-water-future.webp'
import unityHands from './assets/ending/people/unity-hands.png'
import './App.css'

gsap.registerPlugin(ScrollTrigger)
echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

const loadWaterResourceGlobe = () => import('./GlobeScene')
const WaterResourceGlobe = lazy(loadWaterResourceGlobe)
const WaterOrb = lazy(() => import('./WaterOrb'))

const finalePersonImages = Object.entries(import.meta.glob('./assets/ending/people/figure-*.png', { eager: true, import: 'default' }))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src)

const finalePeopleLeft = finalePersonImages.slice(0, 9)
const finalePeopleRight = finalePersonImages.slice(9)

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
  { id: 'shortage', label: '全球' },
  { id: 'concept', label: '中国' },
  { id: 'debate', label: '反思' },
  { id: 'overseas', label: '出海' },
  { id: 'method', label: '结语' }
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

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function playChartOnEnter(root, play) {
  let played = false
  const playOnce = (immediate = false) => {
    if (played) return
    played = true
    play(immediate)
  }

  if (prefersReducedMotion()) {
    playOnce(true)
    return () => {}
  }

  const isReady = () => {
    const rect = root.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    return rect.top < viewportHeight * 0.76 && rect.bottom > viewportHeight * 0.18
  }

  let frame = 0
  const tick = () => {
    if (played) return
    if (isReady()) {
      observer.disconnect()
      playOnce()
      return
    }
    frame = requestAnimationFrame(tick)
  }

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && isReady()) {
      observer.disconnect()
      playOnce()
    }
  }, {
    threshold: 0.22,
    rootMargin: '0px 0px -16% 0px'
  })
  observer.observe(root)
  frame = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(frame)
    observer.disconnect()
  }
}

function chartSeriesList(series) {
  if (!series) return []
  return Array.isArray(series) ? series : [series]
}

function chartAxisList(axis) {
  if (!axis) return []
  return Array.isArray(axis) ? axis : [axis]
}

function chartValueAxis(option, series) {
  const xAxis = chartAxisList(option.xAxis)[series.xAxisIndex || 0]
  const yAxis = chartAxisList(option.yAxis)[series.yAxisIndex || 0]
  if (series.type === 'bar' && (xAxis?.type === 'value' || xAxis?.type === 'log')) return xAxis
  return yAxis
}

function chartBaseline(option, series) {
  const axis = chartValueAxis(option, series)
  if (typeof axis?.min === 'number') return axis.min
  if (axis?.type === 'log') return 1
  return 0
}

function chartBaselineData(option, series) {
  if (!Array.isArray(series.data)) return series.data
  const baseline = chartBaseline(option, series)

  return series.data.map((item) => {
    if (item == null) return item
    if (typeof item === 'number') return baseline
    if (Array.isArray(item)) return item.map((value) => (typeof value === 'number' ? baseline : value))
    if (typeof item === 'object') {
      if (typeof item.value === 'number') return { ...item, value: baseline }
      if (Array.isArray(item.value)) {
        return { ...item, value: item.value.map((value) => (typeof value === 'number' ? baseline : value)) }
      }
    }
    return item
  })
}

function prepareChartGrowthOption(option, active, animate = active) {
  const seriesList = chartSeriesList(option.series)
  if (!seriesList.length) return { ...option, animation: animate }

  const nextSeries = seriesList.map((series, seriesIndex) => ({
    ...series,
    data: active ? series.data : (series.type === 'line' ? [] : chartBaselineData(option, series)),
    clip: true,
    animation: animate,
    animationDuration: animate ? (series.animationDuration ?? (series.type === 'line' ? 1500 : 1100)) : 0,
    animationDurationUpdate: animate ? (series.animationDurationUpdate ?? 850) : 0,
    animationEasing: series.animationEasing || 'cubicOut',
    animationDelay: series.type === 'line' ? seriesIndex * 140 : (dataIndex) => dataIndex * 34 + seriesIndex * 110,
    animationDelayUpdate: (dataIndex) => dataIndex * 18 + seriesIndex * 70
  }))

  return {
    ...option,
    animation: animate,
    animationThreshold: 2400,
    series: Array.isArray(option.series) ? nextSeries : nextSeries[0]
  }
}

function chartHasLineSeries(option) {
  return chartSeriesList(option.series).some((series) => series.type === 'line')
}

function useEChart(ref, optionFactory, deps = []) {
  useEffect(() => {
    if (!ref.current) return undefined
    const root = ref.current
    const reduceMotion = prefersReducedMotion()
    let played = reduceMotion
    const chart = echarts.init(root)
    const getOption = (active, animate = active && !reduceMotion) => prepareChartGrowthOption(optionFactory(), active, animate)
    const hasLineSeries = chartHasLineSeries(optionFactory())
    const renderFinal = (animate) => {
      played = true
      chart.setOption(getOption(true, animate), true)
    }
    const cleanupGrowth = reduceMotion ? (() => {}) : playChartOnEnter(root, () => renderFinal(true))

    if (reduceMotion) {
      renderFinal(false)
    } else if (!hasLineSeries) {
      chart.setOption(getOption(false, false), true)
    }
    const onResize = () => {
      chart.resize()
      if (played) chart.setOption(getOption(true, false), true)
      else if (!hasLineSeries) chart.setOption(getOption(false, false), true)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      cleanupGrowth()
      chart.dispose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

function Kpi({ value, label, note, decimals = 0, suffix = '', prefix = '', accentImage }) {
  return (
    <div className={`kpi reveal ${accentImage ? 'with-accent' : ''}`}>
      {accentImage && <img className="kpi-accent" src={accentImage} alt="" loading="lazy" decoding="async" />}
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

function ChartAnnotation({ children }) {
  return (
    <div className="chart-annotation">
      <span>图表注释</span>
      <p>{children}</p>
    </div>
  )
}

function WaterStressMechanism() {
  return (
    <div className="water-stress-mechanism" aria-label="资源性缺水和水质性缺水成因机制图">
      <div className="mechanism-heading">两类缺水成因</div>
      <div className="mechanism-cause-grid">
        <div className="mechanism-node resource">
          <span>成因一 · 资源性缺水</span>
          <strong>水量本身不足</strong>
          <small>水资源分布不均、干旱或人均资源偏低；农业、人口与产业取水增加会进一步放大压力</small>
        </div>
        <div className="mechanism-node quality">
          <span>成因二 · 水质性缺水</span>
          <strong>有水但无法安全利用</strong>
          <small>污染、富营养化或物理化学性质恶化，导致可用水量下降</small>
        </div>
      </div>
      <div className="mechanism-arrow" aria-hidden="true">↓</div>
      <div className="mechanism-result">
        <strong>水资源压力升高</strong>
        <span>淡水取水量 ÷ 可再生淡水资源总量</span>
      </div>
      <div className="mechanism-buffer">
        <span>缓冲方式</span>
        <strong>地下水超采 · 海水淡化 · 外部水源 · 虚拟水贸易</strong>
        <small>可以维持供水，但不等于本地水资源压力消失</small>
      </div>
    </div>
  )
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

function StrongMark({ children }) {
  return <strong className="text-mark">{children}</strong>
}

function ClientVisual({ image, alt, caption, variant = '' }) {
  return (
    <figure className={`client-visual reveal ${variant}`}>
      <img src={image} alt={alt} loading="lazy" decoding="async" />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

function runWhenIdle(callback, timeout = 900) {
  if (typeof window === 'undefined') return () => {}
  if ('requestIdleCallback' in window) {
    const idleId = window.requestIdleCallback(callback, { timeout })
    return () => window.cancelIdleCallback(idleId)
  }
  const timeoutId = window.setTimeout(callback, Math.min(timeout, 300))
  return () => window.clearTimeout(timeoutId)
}

function LazyWhenVisible({ children, fallback = null, rootMargin = '480px', idle = false, idleTimeout = 900 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible || !ref.current) return undefined
    let cancelled = false
    let cancelIdle = () => {}
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect()
        const show = () => {
          if (!cancelled) setVisible(true)
        }
        cancelIdle = idle ? runWhenIdle(show, idleTimeout) : (() => {
          show()
          return () => {}
        })()
      }
    }, { rootMargin })
    observer.observe(ref.current)
    return () => {
      cancelled = true
      cancelIdle()
      observer.disconnect()
    }
  }, [idle, idleTimeout, rootMargin, visible])

  return <div ref={ref}>{visible ? children : fallback}</div>
}

function ThreeFallback({ type = 'globe' }) {
  return (
    <div className={`three-fallback ${type}`}>
      <i />
      <span>{type === 'orb' ? '水面动效加载中' : '3D 地球加载中'}</span>
    </div>
  )
}

function HeroWaterVisual() {
  const [use3D, setUse3D] = useState(() => {
    if (typeof window === 'undefined') return false
    const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
    return width > 720 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const update = () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const width = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0)
      setUse3D(width > 720 && !reduced)
    }
    update()
    const frame = requestAnimationFrame(update)
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!use3D) return <div className="mobile-water-surface" />

  return (
    <LazyWhenVisible fallback={<ThreeFallback type="orb" />} rootMargin="120px">
      <Suspense fallback={<ThreeFallback type="orb" />}>
        <WaterOrb />
      </Suspense>
    </LazyWhenVisible>
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
      <div className="mode-toggle" aria-label="切换图表视图">
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

const stressCountryAliases = {
  'Egypt, Arab Rep.': 'Egypt',
  'Syrian Arab Republic': 'Syria',
  'Yemen, Rep.': 'Yemen'
}

const stressValueByCountry = new Map(
  pressurePoints.map((item) => [stressCountryAliases[item.name] || item.name, item.value])
)

const focusPressurePoints = pressurePoints.filter((point) => (
  point.lon >= 20 && point.lon <= 94 && point.lat >= 2 && point.lat <= 52
))

const mapLabelNames = {
  EGY: 'Egypt',
  BHR: 'Bahrain',
  TKM: 'Turkmenistan',
  ARE: 'UAE',
  SAU: 'Saudi Arabia',
  LBY: 'Libya',
  SDN: 'Sudan',
  QAT: 'Qatar',
  PAK: 'Pakistan',
  UZB: 'Uzbekistan',
  SYR: 'Syria',
  YEM: 'Yemen',
  AZE: 'Azerbaijan'
}

// Keep the geographic coordinates true, but offset crowded markers for legibility.
const mapPointLayout = {
  EGY: { offset: [-14, -14], label: [-8, -12], anchor: 'end' },
  LBY: { offset: [-16, -8], label: [-8, -10], anchor: 'end' },
  SDN: { offset: [-16, 16], label: [-8, 18], anchor: 'end' },
  SYR: { offset: [-12, -14], label: [-8, -10], anchor: 'end' },
  SAU: { offset: [-14, 18], label: [-8, 20], anchor: 'end' },
  YEM: { offset: [18, 20], label: [10, 18], anchor: 'start' },
  BHR: { offset: [30, -22], label: [9, -10], anchor: 'start' },
  ARE: { offset: [28, -18], label: [9, -8], anchor: 'start' },
  QAT: { offset: [44, -8], label: [9, -8], anchor: 'start' },
  TKM: { offset: [16, -18], label: [9, -10], anchor: 'start' },
  AZE: { offset: [18, -22], label: [9, -10], anchor: 'start' },
  UZB: { offset: [32, 4], label: [9, 4], anchor: 'start' },
  PAK: { offset: [22, 18], label: [9, 12], anchor: 'start' }
}

function WorldPressureMap() {
  const ref = useRef(null)
  const [selected, setSelected] = useState(pressurePoints.find((d) => d.code === 'PAK') || pressurePoints[0])

  useEffect(() => {
    if (!ref.current) return undefined
    const root = ref.current
    let cleanupGrowth = null
    let hasPlayed = prefersReducedMotion()

    const draw = () => {
      cleanupGrowth?.()
      const width = root.clientWidth || 760
      const height = Math.max(420, Math.min(560, width * 0.58))
      d3.select(root).selectAll('*').interrupt()
      d3.select(root).selectAll('*').remove()

      const svg = d3.select(root).append('svg').attr('viewBox', `0 0 ${width} ${height}`)
      const projection = d3.geoNaturalEarth1()
        .center([55, 28])
        .scale(Math.min(width * 0.92, height * 1.18))
        .translate([width * 0.5, height * 0.52])
      const path = d3.geoPath(projection)
      const graticule = d3.geoGraticule10()
      const radius = d3.scaleSqrt().domain(d3.extent(focusPressurePoints, (d) => d.value)).range([5, 24])
      const color = d3.scaleSequentialLog(d3.interpolateOrRd).domain(d3.extent(pressurePoints, (d) => d.value))

      svg.append('path')
        .datum(graticule)
        .attr('class', 'map-graticule')
        .attr('d', path)

      svg.append('g')
        .selectAll('path')
        .data(worldGeo.features)
        .join('path')
        .attr('class', (d) => stressValueByCountry.has(d.properties.name) ? 'map-country shortage-country hot' : 'map-country shortage-country')
        .attr('d', path)
        .attr('fill', (d) => {
          const value = stressValueByCountry.get(d.properties.name)
          return value ? color(value) : 'rgba(65, 130, 152, .20)'
        })
        .attr('opacity', (d) => stressValueByCountry.has(d.properties.name) ? 0.88 : 0.48)

      const tip = d3.select(root).append('div').attr('class', 'd3-tip')

      const points = svg.append('g')
        .selectAll('g')
        .data(focusPressurePoints)
        .join('g')
        .attr('class', 'map-point')
        .attr('transform', (d) => {
          const [x, y] = projection([d.lon, d.lat])
          const [offsetX, offsetY] = mapPointLayout[d.code]?.offset || [0, 0]
          return `translate(${x + offsetX},${y + offsetY})`
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

      const halos = points.append('circle')
        .attr('class', 'map-point-halo')
        .attr('r', 0)
        .attr('fill', (d) => color(d.value))

      const cores = points.append('circle')
        .attr('class', 'map-point-core')
        .attr('r', 0)
        .attr('fill', (d) => color(d.value))

      points
        .append('line')
        .attr('class', 'map-point-leader')
        .attr('x1', (d) => -(mapPointLayout[d.code]?.offset?.[0] || 0))
        .attr('y1', (d) => -(mapPointLayout[d.code]?.offset?.[1] || 0))
        .attr('x2', (d) => mapPointLayout[d.code]?.label?.[0] || 8)
        .attr('y2', (d) => mapPointLayout[d.code]?.label?.[1] || 0)
        .attr('opacity', (d) => mapPointLayout[d.code] ? 1 : 0)

      const pointLabels = points
        .append('text')
        .attr('class', 'map-point-label')
        .attr('x', (d) => mapPointLayout[d.code]?.label?.[0] || 8)
        .attr('y', (d) => mapPointLayout[d.code]?.label?.[1] || 0)
        .attr('dy', (d) => (mapPointLayout[d.code]?.label?.[1] || 0) < 0 ? '-0.25em' : '0.9em')
        .attr('text-anchor', (d) => mapPointLayout[d.code]?.anchor || 'start')
        .attr('opacity', 0)
        .text((d) => mapLabelNames[d.code] || d.name.replace(', Arab Rep.', ''))

      const completeGrowth = () => {
        halos.attr('r', (d) => radius(d.value) * 1.8)
        cores.attr('r', (d) => radius(d.value))
        pointLabels.attr('opacity', 1)
      }

      if (hasPlayed) {
        completeGrowth()
        return
      }

      cleanupGrowth = playChartOnEnter(root, (immediate) => {
        hasPlayed = true
        if (immediate) {
          completeGrowth()
          return
        }
        halos.transition().duration(900).delay((_, i) => i * 70).attr('r', (d) => radius(d.value) * 1.8)
        cores.transition().duration(900).delay((_, i) => i * 70).attr('r', (d) => radius(d.value))
        pointLabels.transition().duration(420).delay(820).attr('opacity', 1)
      })
    }

    draw()
    window.addEventListener('resize', draw)
    return () => {
      cleanupGrowth?.()
      window.removeEventListener('resize', draw)
    }
  }, [])

  return (
    <div className="world-map-wrap">
      <div className="map-legend shortage-legend" aria-hidden="true">
        <span><i className="legend-low" />普通压力</span>
        <span><i className="legend-mid" />高压力</span>
        <span><i className="legend-high" />极高压力</span>
      </div>
      <div className="world-map shortage-map" ref={ref} role="img" aria-label="全球水资源短缺热力图与高压力国家气泡图" />
      <div className="map-lock-card">
        <span>热力图锁定</span>
        <strong>{selected.name}</strong>
        <p>水资源压力指数 <b>{selected.value}%</b></p>
        <small>颜色越深、气泡越大，代表缺水压力越高</small>
      </div>
    </div>
  )
}

function TurkanaCasePanel() {
  return (
    <div className="turkana-case-layout reveal">
      <ClientVisual
        image={clientTurkana}
        alt="妇女们在干旱稀树草原中运输储水容器"
        variant="turkana-visual"
        caption={<>妇女们依靠头顶、手提、拖拽等多种方式运载储水容器，在干旱稀树草原长途行进。图片来源：<a href={sourceLinks.turkanaImage} target="_blank" rel="noreferrer">https://www.voroniapp.com/</a></>}
      />
      <div className="turkana-case-card">
        <div className="turkana-copy">
          <span className="case-art-title"><span>肯尼亚</span><strong>图尔卡纳</strong></span>
          <p className="scroll-copy">肯尼亚图尔卡纳县便是这片干旱带上一个切面。作为肯尼亚第二大县，这里也是该国最干燥、水资源最匮乏的地区之一。五个孩子的母亲玛丽·洛克瓦洛普曾带着孩子步行 50-60 公里寻找水源，浑浊的河水是唯一的指望，牲畜在干旱中接连倒毙，孩子被迫辍学。</p>
          <p className="scroll-copy"><StrongMark>在这片土地上，缺水从来不是地图上一个冰冷的数据点，而是每一个具体家庭日常中最为切肤的痛楚；每一处水源的抵达，改变的都是整条生命链条的运转。</StrongMark></p>
          <SourceNote links={[{ label: 'UNICEF Kenya - Turkana case', url: sourceLinks.turkanaCase }]}>资料来源：UNICEF Kenya</SourceNote>
        </div>
      </div>
    </div>
  )
}

function RegionalCasePanel({ variant, country, title, image, imageAlt, caption, children }) {
  return (
    <article className={`regional-case-panel ${variant} reveal`}>
      <ClientVisual image={image} alt={imageAlt} variant="regional-case-photo" caption={caption} />
      <div className="turkana-case-card regional-case-card">
        <div className="regional-case-content">
          <div className="turkana-copy">
            <span className="case-art-title"><span>{country}</span><strong>{title}</strong></span>
            {children}
          </div>
        </div>
      </div>
    </article>
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
    let cleanupGrowth = null
    let hasPlayed = prefersReducedMotion()
    const draw = () => {
      const width = root.clientWidth || 720
      const height = 430
      cleanupGrowth?.()
      d3.select(root).selectAll('*').interrupt()
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
      const circles = g.selectAll('circle').data(data.stressScatter).join('circle')
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

      const labels = ['Egypt, Arab Rep.', 'Pakistan', 'India', 'Saudi Arabia']
      const pointLabels = g.selectAll('.point-label').data(data.stressScatter.filter((d) => labels.includes(d.name))).join('text')
        .attr('x', (d) => x(d.freshwaterPerCapita) + r(d.population) + 4)
        .attr('y', (d) => y(d.stress) + 4)
        .attr('fill', '#ecfbff')
        .attr('font-size', 11)
        .attr('opacity', 0)
        .text((d) => d.name.replace(', Arab Rep.', ''))

      const completeGrowth = () => {
        circles.attr('r', (d) => r(d.population))
        pointLabels.attr('opacity', 1)
      }

      if (hasPlayed) {
        completeGrowth()
        return
      }

      cleanupGrowth = playChartOnEnter(root, (immediate) => {
        hasPlayed = true
        if (immediate) {
          completeGrowth()
          return
        }
        circles.transition().duration(900).delay((_, i) => i * 18).attr('r', (d) => r(d.population))
        pointLabels.transition().duration(420).delay(760).attr('opacity', 1)
      })
    }
    draw()
    window.addEventListener('resize', draw)
    return () => {
      cleanupGrowth?.()
      window.removeEventListener('resize', draw)
    }
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

function RuralCoverageChart() {
  const ref = useRef(null)
  const rows = chinaData.ruralCoverage
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
      backgroundColor: 'transparent',
      color: ['#35c8ff', '#7af0c9'],
      grid: { top: 54, left: mobile ? 36 : 46, right: mobile ? 12 : 20, bottom: 34 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(4,12,24,.94)',
        borderColor: 'rgba(53,200,255,.34)',
        textStyle: { color: '#ecfbff' }
      },
      legend: { top: 4, right: 0, textStyle: { color: '#b9d7e6', fontSize: mobile ? 10 : 11 } },
      xAxis: {
        type: 'category',
        data: rows.map((item) => item.year),
        axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,.15)' } }
      },
      yAxis: {
        type: 'value',
        min: 70,
        max: 100,
        axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
      },
      series: [
        {
          name: '自来水普及率',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 4 },
          areaStyle: { color: 'rgba(53,200,255,.12)' },
          data: rows.map((item) => item.tap)
        },
        {
          name: '规模化供水覆盖率',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 3 },
          data: rows.map((item) => item.scaled ?? null)
        }
      ]
    })
  }, [])
  return <div className="chart rural-coverage-chart" ref={ref} role="img" aria-label="2015 至 2023 年农村自来水普及率与规模化供水覆盖率趋势图" />
}

function DebateDashboard() {
  return (
    <div className="debate-dashboard">
      <div className="debate-news-grid">
        <figure>
          <img src={chinaNewsEcologyOne} alt="中国新闻网生态环境治理新闻稿截图一" loading="lazy" decoding="async" />
          <figcaption>来源：中国新闻网</figcaption>
        </figure>
        <figure>
          <img src={chinaNewsEcologyTwo} alt="中国新闻网中央生态环保督察新闻稿截图二" loading="lazy" decoding="async" />
          <figcaption>来源：中国新闻网</figcaption>
        </figure>
        <div className="debate-text-panel">
          <strong>从宏观改善到微观感知</strong>
          <p>大江大河水质改善之后，治理继续回到群众身边的小微水体、县乡黑臭水体、园区污染整治和地方执行能力。新闻稿截图作为材料出处，补足这部分“发现问题、公开通报、持续整改”的现实证据。</p>
        </div>
      </div>
      <SourceNote>资料来源：中国新闻网、生态环境部公开信息</SourceNote>
    </div>
  )
}

function ChinaActionDashboard() {
  return (
    <div className="china-dashboard">
      <div className="china-metric-grid">
        <div className="china-metric">
          <span>2025 农村自来水普及率</span>
          <strong><AnimatedNumber value={chinaData.ruralWater.tapWater2025} suffix="%" /></strong>
          <small>问题的重心从“有没有”转向“稳不稳”“好不好”</small>
        </div>
        <div className="china-metric">
          <span>规模化供水覆盖农村人口</span>
          <strong><AnimatedNumber value={chinaData.ruralWater.scaledSupply2025} suffix="%" /></strong>
          <small>稳定运行和水质保障变得更重要</small>
        </div>
        <div className="china-metric target">
          <span>2030 年目标</span>
          <strong><AnimatedNumber value={chinaData.ruralWater.target2030} suffix="%" /></strong>
          <small>全国农村自来水普及率</small>
        </div>
      </div>
      <div className="china-quality-panel">
        <div className="card-head"><span>全国地表水总体水质</span><b>2016—2025</b></div>
        <ChinaQualityChart />
        <ChartAnnotation>Ⅰ—Ⅲ类断面占比从 67.8% 升至 90.2%，劣Ⅴ类下降到 0.4%；这组指标分别观察优良水体和严重污染水体的变化。</ChartAnnotation>
      </div>
        <div className="china-quality-panel">
          <div className="card-head"><span>农村自来水普及率与规模化供水</span><b>2015—2023</b></div>
        <RuralCoverageChart />
        <ChartAnnotation>工程建设推动覆盖率提升后，治理重点会逐步转向稳定运行、水质保障和规模化供水的长期维护。</ChartAnnotation>
      </div>
      <div className="china-split">
        <div className="investment-panel">
          <div className="card-head"><span>农村供水投入</span><b>2018—2023</b></div>
          <InvestmentBarChart />
          <ChartAnnotation>精准的政策蓝图，需要持续的资金投入才能落地；累计投入数据用于补充年度柱状图之外的长期规模。</ChartAnnotation>
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
          title="建设之后，运营成为真正考验。"
          caption="如何确保数以万计小型供水工程的长期可持续运营，如何应对极端气候对供水系统的冲击，是后普及时代的新课题。"
          tone="green"
        />
      </div>
      <SourceNote links={[
        { label: chinaData.ruralWater.sourceLabel, url: chinaData.ruralWater.source },
        { label: '生态环境部公报', url: chinaData.waterQualitySources[3].url }
      ]}>
        资料来源：水利部、生态环境部
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
    let cleanupGrowth = null
    let hasPlayed = prefersReducedMotion()

    const draw = () => {
      cleanupGrowth?.()
      const width = root.clientWidth || 760
      const height = Math.max(380, Math.min(520, width * 0.56))
      d3.select(root).selectAll('*').interrupt()
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

      const halos = points.append('circle')
        .attr('class', 'project-halo')
        .attr('fill', (d) => color(d.type))
        .attr('r', 0)

      const cores = points.append('circle')
        .attr('class', 'project-core')
        .attr('fill', (d) => color(d.type))
        .attr('r', 0)

      const completeGrowth = () => {
        halos.attr('r', (d) => radius(d.investment || 3) * 1.9)
        cores.attr('r', (d) => radius(d.investment || 3))
      }

      if (hasPlayed) {
        completeGrowth()
        return
      }

      cleanupGrowth = playChartOnEnter(root, (immediate) => {
        hasPlayed = true
        if (immediate) {
          completeGrowth()
          return
        }
        halos.transition().duration(900).delay((_, i) => i * 80).attr('r', (d) => radius(d.investment || 3) * 1.9)
        cores.transition().duration(900).delay((_, i) => i * 80).attr('r', (d) => radius(d.investment || 3))
      })
    }

    draw()
    window.addEventListener('resize', draw)
    return () => {
      cleanupGrowth?.()
      window.removeEventListener('resize', draw)
    }
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
  const countryCount = new Set(overseasProjects.map((item) => item.country)).size
  return (
    <div className="overseas-dashboard">
      <div className="portfolio-kpis">
        <article>
          <span>项目数量</span>
          <strong>{overseasProjects.length}</strong>
          <p>覆盖 {countryCount} 个国家，类型包括水电站、供水、水坝、河道治理等。</p>
        </article>
        <article>
          <span>已知投资额</span>
          <strong>{knownInvestment.toFixed(1)}<em>亿美元</em></strong>
          <p>金额字段仅覆盖已披露项目，因此本节以空间分布和项目类型为主。</p>
        </article>
        <article>
          <span>项目类型</span>
          <strong>{Object.keys(projectTypeSummary).length}</strong>
          <p>从工程建设扩展到水资源信息化和流域治理。</p>
        </article>
      </div>
      <OverseasProjectMap />
      <SourceNote links={[{ label: 'CIDCA', url: sourceLinks.cidca }, { label: '水利部国际合作', url: sourceLinks.mwrInternational }]}>
        资料来源：CIDCA、水利部国际合作公开资料
      </SourceNote>
    </div>
  )
}

function BeltRoadTimelineMap() {
  const ref = useRef(null)
  const routeProjects = useMemo(() => (
    [...overseasProjects]
      .filter((item) => item.lon && item.lat)
      .sort((a, b) => a.year - b.year)
      .slice(0, 11)
  ), [])

  useEffect(() => {
    if (!ref.current) return undefined
    const root = ref.current

    const draw = () => {
      const width = root.clientWidth || 820
      const height = Math.max(280, Math.min(340, width * 0.34))
      d3.select(root).selectAll('*').remove()

      const svg = d3.select(root).append('svg').attr('viewBox', `0 0 ${width} ${height}`)
      const projection = d3.geoNaturalEarth1().fitExtent([[20, 26], [width - 20, height - 38]], worldGeo)
      const path = d3.geoPath(projection)
      const origin = projection([104.2, 35.8])
      const barScale = d3.scaleLinear()
        .domain([0, d3.max(routeProjects, (d) => d.investment || 2) || 10])
        .range([18, 64])
      const line = d3.line().curve(d3.curveBasis)

      svg.append('g')
        .selectAll('path')
        .data(worldGeo.features)
        .join('path')
        .attr('class', 'bri-country')
        .attr('d', path)

      const routes = svg.append('g').attr('class', 'bri-routes')
      routeProjects.forEach((item, index) => {
        const target = projection([item.lon, item.lat])
        if (!target) return
        const mid = [
          (origin[0] + target[0]) / 2,
          (origin[1] + target[1]) / 2 - 36 - (index % 3) * 10
        ]
        routes.append('path')
          .datum([origin, mid, target])
          .attr('class', 'bri-route')
          .attr('d', line)
          .attr('style', `--delay:${index * 0.12}s`)

        const barHeight = barScale(item.investment || 2.5)
        routes.append('line')
          .attr('class', 'bri-bar')
          .attr('x1', target[0])
          .attr('x2', target[0])
          .attr('y1', target[1])
          .attr('y2', target[1] - barHeight)
        routes.append('circle')
          .attr('class', 'bri-dot')
          .attr('cx', target[0])
          .attr('cy', target[1])
          .attr('r', 4.5)

        if (index % 2 === 0 || item.country === '巴基斯坦') {
          routes.append('text')
            .attr('class', 'bri-year-label')
            .attr('x', target[0] + 7)
            .attr('y', target[1] - barHeight - 5)
            .text(`${item.year} ${item.country}`)
        }
      })

      svg.append('circle')
        .attr('class', 'bri-origin')
        .attr('cx', origin[0])
        .attr('cy', origin[1])
        .attr('r', 7)
      svg.append('text')
        .attr('class', 'bri-origin-label')
        .attr('x', origin[0] + 10)
        .attr('y', origin[1] + 4)
        .text('中国')
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [routeProjects])

  return (
    <div className="bri-map-wrap">
      <div className="bri-map" ref={ref} role="img" aria-label="一带一路沿线水资源合作路线与年份图" />
      <div className="bri-timeline" aria-label="海外水利合作时间节点">
        {routeProjects.slice(0, 6).map((item) => (
          <article key={`${item.country}-${item.project}-${item.year}`}>
            <span>{item.year}</span>
            <strong>{item.country}</strong>
            <p>{item.type}</p>
          </article>
        ))}
      </div>
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

function PakistanCooperationChart() {
  const ref = useRef(null)
  const rows = pakistanData.trends.guarantee.values
  useEChart(ref, () => {
    const mobile = isMobile()
    return ({
      backgroundColor: 'transparent',
      color: ['#7af0c9', '#ffd166'],
      grid: { top: 56, left: mobile ? 42 : 54, right: mobile ? 42 : 54, bottom: 38 },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(4,12,24,.94)',
        borderColor: 'rgba(122,240,201,.34)',
        textStyle: { color: '#ecfbff' },
        formatter(params) {
          const row = rows[params[0].dataIndex]
          return `${row.year} 年<br/>全国灌溉保证率：${row.value}%<br/>中巴水利合作项目数：${row.projects} 个`
        }
      },
      legend: { top: 4, right: 0, textStyle: { color: '#b9d7e6', fontSize: mobile ? 10 : 11 } },
      xAxis: {
        type: 'category',
        data: rows.map((item) => item.year),
        axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,.15)' } }
      },
      yAxis: [
        {
          type: 'value',
          min: 70,
          max: 86,
          axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11, formatter: '{value}%' },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,.08)' } }
        },
        {
          type: 'value',
          axisLabel: { color: '#a9c4d2', fontSize: mobile ? 9 : 11 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '全国灌溉保证率',
          type: 'line',
          smooth: true,
          symbolSize: 8,
          lineStyle: { width: 4 },
          data: rows.map((item) => item.value)
        },
        {
          name: '中巴水利合作项目数',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: mobile ? 14 : 20,
          data: rows.map((item) => item.projects)
        }
      ]
    })
  }, [])
  return <div className="chart pakistan-chart" ref={ref} role="img" aria-label="巴基斯坦全国灌溉保证率与中巴水利合作项目数趋势图" />
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
        资料来源：World Bank Pakistan
      </SourceNote>
    </div>
  )
}

function WisdomDashboard() {
  return (
    <div className="wisdom-dashboard">
      <div className="wisdom-grid">
        <div className="wisdom-copy">
          <span>从技术合作到规则对话</span>
          <strong>南南水资源合作典范</strong>
          <p>巴基斯坦水资源压力指数与灌溉保证率的变化，以及世界银行的评价和巴基斯坦案例的成效数据，不仅属于“出海之路”的项目实证，更构成了“智慧交融”中“南南水资源合作典范”的论据。</p>
        </div>
        <div className="wisdom-chart-panel">
          <div className="card-head"><span>巴基斯坦灌溉保证率与合作项目数</span><b>2015—2024</b></div>
          <PakistanCooperationChart />
        </div>
      </div>
      <div className="cooperation-card-grid">
        {pakistanData.cooperationCards.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}<em>{item.unit}</em></strong>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
      <SourceNote links={[{ label: 'World Bank · Pakistan water report', url: sourceLinks.pakistanWaterReport }, { label: 'World Bank · groundwater case', url: sourceLinks.pakistanGroundwater }]}>
        资料来源：World Bank Pakistan water reports
      </SourceNote>
    </div>
  )
}

function PolicyFlow() {
  const [year, setYear] = useState(2024)
  const [active, setActive] = useState('中央统筹')
  const flowRef = useRef(null)
  const yearThemes = {
    2005: {
      title: '全国统筹起步期',
      desc: '农村饮水安全工程全面启动，国家涉水治理由区域帮扶迈向全国统筹，水量保障与流域水环境治理开始形成政策协同。',
      nodes: ['中央统筹', '农村供水', '水污染治理'],
      hotLines: ['l2'],
      dotCount: 1
    },
    2016: {
      title: '十三五规划推进期',
      desc: '“十三五”水利规划启动后，基础设施补短板持续推进，农村供水与水污染治理进入提质扩面阶段。',
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

  useEffect(() => {
    const flow = flowRef.current
    if (!flow || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const ctx = gsap.context(() => {
      const idleNodes = gsap.utils.toArray('.flow-node:not(.year-hot)')
      const hotNodes = gsap.utils.toArray('.flow-node.year-hot')
      const hotGlows = gsap.utils.toArray('.flow-node.year-hot .flow-node-glow')
      const allLines = gsap.utils.toArray('.flow-line')
      const hotLines = gsap.utils.toArray('.flow-line.hot')
      const mutedDots = gsap.utils.toArray('.pulse-dot.muted')
      const liveDots = gsap.utils.toArray('.pulse-dot:not(.muted)')
      const note = flow.parentElement?.querySelector('.policy-note')

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl
        .set(allLines, { '--line-scale': 0.55, autoAlpha: 0.32 })
        .set(mutedDots, { autoAlpha: 0, scale: 0.6 })
        .to(idleNodes, { autoAlpha: 0.52, duration: 0.18 }, 0)
        .fromTo(hotNodes, { autoAlpha: 0.72 }, { autoAlpha: 1, duration: 0.28, stagger: { each: 0.05, from: 'center' } }, 0.04)
        .fromTo(hotGlows, { scale: 0.65, opacity: 0.18 }, { scale: 1.28, opacity: 0.78, duration: 0.42, stagger: { each: 0.05, from: 'center' } }, 0.08)
        .fromTo(hotLines, { '--line-scale': 0, autoAlpha: 0.42 }, { '--line-scale': 1, autoAlpha: 1, duration: 0.58, stagger: 0.09 }, 0.18)
        .fromTo(liveDots, { autoAlpha: 0, scale: 0.45 }, { autoAlpha: 1, scale: 1, duration: 0.32, stagger: 0.07 }, 0.42)

      if (note) {
        tl.fromTo(note, { y: 10, autoAlpha: 0.82 }, { y: 0, autoAlpha: 1, duration: 0.42 }, 0.16)
      }
    }, flow)

    return () => ctx.revert()
  }, [year])

  return (
    <div className="policy-wrap">
      <div className="policy-years" aria-label="概念年份轴">
        {[2005, 2016, 2019, 2022, 2024].map((item) => (
          <button key={item} className={year === item ? 'active' : ''} onClick={() => setYear(item)}>{item}</button>
        ))}
      </div>
      <div className={`policy-flow y${year}`} ref={flowRef}>
        {nodes.map((node, index) => (
          <button
            key={node.name}
            className={`flow-node n${index} ${active === node.name ? 'active' : ''} ${yearTheme.nodes.includes(node.name) ? 'year-hot' : ''}`}
            onClick={() => setActive(node.name)}
          >
            <span className="flow-node-glow" aria-hidden="true" />
            <span className="flow-node-label">{node.name}</span>
          </button>
        ))}
        {['l1', 'l2', 'l3', 'l4'].map((line) => (
          <div key={line} className={`flow-line ${line} ${yearTheme.hotLines.includes(line) ? 'hot' : ''}`} />
        ))}
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className={`pulse-dot d${(index % 3) + 1} ${index >= yearTheme.dotCount ? 'muted' : ''}`}
            style={{ animationDelay: `${index * 0.65}s` }}
          />
        ))}
      </div>
      <div className="policy-note">
        <span>{year} / {yearTheme.title}</span>
        <strong>{activeNode.name}</strong>
        <p>{activeNode.desc}</p>
        <p className="year-note">{yearTheme.desc}</p>
      </div>
      <p className="policy-method-note"><strong>注释说明：</strong>阶段划分依据重大顶层政策迭代节点，不以均等时间间隔划分；2005—2015 年主要为农村饮水安全政策落地实施阶段。</p>
    </div>
  )
}

function SectionText({ kicker, title, children }) {
  return (
    <div className={`section-text reveal ${title ? '' : 'no-title'}`}>
      {title && kicker && <span className="eyebrow">{kicker}</span>}
      {title && <h2>{title}</h2>}
      {typeof children === 'string' ? <p>{children}</p> : <div className="story-copy">{children}</div>}
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth <= 720) return undefined
    return runWhenIdle(() => {
      loadWaterResourceGlobe().catch(() => {})
    }, 2200)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth <= 720) return undefined
    const lenis = new Lenis({
      duration: 0.82,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
      lerp: 0.12
    })

    const update = (time) => {
      lenis.raf(time * 1000)
    }

    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', ScrollTrigger.update)
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerWidth <= 720) return undefined
    const cursor = document.querySelector('.water-cursor')
    if (!cursor) return undefined

    gsap.set(cursor, {
      x: window.innerWidth / 2,
      y: window.innerHeight * 0.45,
      xPercent: -50,
      yPercent: -50,
      force3D: true
    })

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.8, ease: 'power3.out' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.8, ease: 'power3.out' })
    const onPointerMove = (event) => {
      xTo(event.clientX)
      yTo(event.clientY)
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      gsap.killTweensOf(cursor)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const ctx = gsap.context(() => {
      gsap.to('.progress-bar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.2 } })
      const heroTimeline = gsap.timeline({
        defaults: { ease: 'power3.out' }
      })
      heroTimeline
        .addLabel('surface', 0)
        .fromTo('.hero-water', { scale: 0.9, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.72 }, 'surface')
        .fromTo('.topline span', { y: -14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.48, stagger: 0.08 }, 'surface+=0.08')
        .fromTo('.hero-content > .eyebrow', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, 'surface+=0.18')
        .addLabel('title', 'surface+=0.28')
        .fromTo('.hero-title span', {
          yPercent: 118,
          x: -18,
          rotation: -1.6,
          autoAlpha: 0
        }, {
          yPercent: 0,
          x: 0,
          rotation: 0,
          autoAlpha: 1,
          duration: 1.05,
          stagger: 0.1,
          ease: 'power4.out'
        }, 'title')
        .fromTo('.hero-copy', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.72 }, 'title+=0.36')
      const revealItems = gsap.utils.toArray('.reveal')
      gsap.set(revealItems, { y: 54, opacity: 0 })
      ScrollTrigger.batch(revealItems, {
        start: 'top 78%',
        once: true,
        batchMax: 6,
        interval: 0.08,
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.08,
            ease: 'power3.out',
            overwrite: 'auto'
          })
        }
      })
      gsap.utils.toArray('.turkana-case-card .scroll-copy').forEach((el, index) => {
        gsap.fromTo(el, { y: 34, opacity: 0 }, {
          y: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: `top ${index === 0 ? '82%' : '76%'}`,
            end: 'top 54%',
            scrub: 0.7
          }
        })
      })
      gsap.utils.toArray('.chapter').forEach((section) => {
        gsap.to(section.querySelector('.chapter-bg'), { yPercent: -18, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      const finaleDivider = document.querySelector('.finale-people-divider')
      if (finaleDivider) {
        const leftPeople = gsap.utils.toArray('.finale-people-run-left img')
        const rightPeople = gsap.utils.toArray('.finale-people-run-right img')
        const handsMark = finaleDivider.querySelector('.finale-hands-mark')
        const handsImage = finaleDivider.querySelector('.finale-hands-mark img')

        gsap.timeline({
          scrollTrigger: {
            trigger: finaleDivider,
            start: 'top 82%',
            once: true
          },
          defaults: { ease: 'power3.out' }
        })
          .fromTo(finaleDivider, { '--finale-line-scale': 0, autoAlpha: 0.86 }, { '--finale-line-scale': 1, autoAlpha: 1, duration: 0.72 }, 0)
          .fromTo(leftPeople, { x: -28, y: 12, autoAlpha: 0, scale: 0.92 }, { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.78, stagger: { each: 0.035, from: 'end' } }, 0.06)
          .fromTo(rightPeople, { x: 28, y: 12, autoAlpha: 0, scale: 0.92 }, { x: 0, y: 0, autoAlpha: 1, scale: 1, duration: 0.78, stagger: { each: 0.035, from: 'start' } }, 0.06)
          .fromTo(handsMark, { y: 8, autoAlpha: 0, scale: 0.82 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.68, ease: 'back.out(1.35)' }, 0.28)
          .fromTo(handsImage, { rotation: -4 }, { rotation: 0, duration: 0.7, ease: 'power2.out' }, 0.32)
      }
      gsap.to('.flow-node-glow', { scale: 1.2, opacity: 0.62, duration: 1.6, yoyo: true, repeat: -1, stagger: 0.2, ease: 'sine.inOut' })
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
        <div className="hero-water-3d" aria-hidden="true">
          <HeroWaterVisual />
        </div>
        <nav className="topline"><span>DATA NEWS / WATER IN MOTION</span><span>World water resources</span></nav>
        <div className="hero-content">
          <p className="eyebrow">流淌的危机</p>
          <h1 className="hero-title"><span>流淌的危机——</span><span>从全球水困局到中国的破局之路</span></h1>
          <p className="hero-copy">联合国大学水、环境与健康研究所发布报告警告，受地下水枯竭、水资源过度开发、土地退化、滥伐森林、水体污染叠加全球变暖影响，全球“水破产”时代已然来临。水是全球发展中极易被忽视却至关重要的议题。然而最新数据显示，2024年全球基本饮水服务覆盖率约为91.45%，这意味着仍有约6.96亿人未能获得基本饮水服务。水资源失衡带来的严峻考验，正拷问着人类共同的治理智慧。</p>
          <div className="hero-saving-cue hero-saving-cue-lower reveal" aria-hidden="true">
            <img src={illustrationWaterDrop} alt="" loading="lazy" decoding="async" />
          </div>
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

      <section className="chapter two-col reverse shortage-section" id="shortage">
        <div className="chapter-bg" />
        <div className="glass-card reveal shortage-card">
          <div className="card-head"><span>中东—中亚—南亚水资源压力带</span><b>HOTSPOTS</b></div>
          <WorldPressureMap />
          <ChartAnnotation>
            水资源压力指数 = 淡水取水量 ÷ 可再生淡水资源总量 × 100%。例如埃及 7750% 约为 77.5 倍，巴林 3877.5% 约为 38.8 倍，表示取水压力远超本国可再生淡水供给。此类极端压力通常需要依赖地下水、海水淡化、外部水源或虚拟水贸易等方式维持供水；由于各国压力值跨度很大，地图采用对数色阶显示颜色，并使用平方根缩放控制气泡大小，避免极端值完全遮盖其他国家。
          </ChartAnnotation>
          <SourceNote links={[{ label: 'World Bank · 水资源压力', url: sourceLinks.waterStress }]}>资料来源：World Bank</SourceNote>
        </div>
        <div className="shortage-copy-stack">
          <SectionText kicker="01 / GLOBAL CRISIS" title="全球水困局：共同危机与交汇的挑战">
            <p><StrongMark>地球表面的颜色不仅是风景，更是人类生存状态的映射。</StrongMark><br />在南亚的部分农田，土壤正在经历不可逆的板结；在北非的村庄，居民每天为获取基本生活用水要跋涉数十公里。数据显示，全球有近7亿人口生活在极度缺水的阴影之下，且这一数字在部分年份甚至呈现16%的波动增长趋势。</p>
            <p>如果我们将视角从宏观的全球气泡图下沉至微观社区便能发现，水资源短缺并非均质分布的自然物理问题，而是分布高度集中的社会痛点。不同地区的缺水成因并不相同：有的受自然水资源禀赋限制，有的则因污染导致可用水量下降，人口、农业和产业用水还会进一步放大压力。</p>
          </SectionText>
          <ClientVisual image={droughtCrackedLand} alt="持续干旱导致大面积土地龟裂的典型景观" caption="图片来源：Dreamstime 商业图库" variant="drought-cracked-land-visual" />
        </div>
      </section>

      <section className="chapter two-col reverse" id="relation">
        <div className="chapter-bg" />
        <div className="glass-card reveal"><div className="card-head"><span>压力 × 人均淡水 × 人口</span><b>代表国家</b></div><StressScatter /><ChartAnnotation>横轴表示人均可再生淡水资源，纵轴表示水资源压力，气泡大小代表人口。高压力不一定等于缺水人口最多：小国可能压力极高，大国则可能因人口规模产生更大的供水缺口。</ChartAnnotation><SourceNote links={[{ label: 'World Bank · 人均淡水资源', url: sourceLinks.freshwater }]}>资料来源：World Bank</SourceNote></div>
        <div className="relation-copy-stack">
          <ClientVisual image={illustrationHelp} alt="earth help illustration" variant="relation-visual" />
          <SectionText kicker="图表说明">
            <p>从宏观的全球气泡图继续观察，可以看到水资源短缺并非均质分布的自然物理问题，而是分布高度集中的社会痛点。气泡大小对应人口规模，横轴与纵轴共同提示：<StrongMark>资源禀赋、人口压力和用水强度会把缺水问题推向不同形态。</StrongMark></p>
          </SectionText>
        </div>
      </section>

      <section className="chapter two-col" id="stress">
        <div className="chapter-bg" />
        <div className="stress-copy-stack">
          <SectionText kicker="图表说明">
            <p>从 2022 年国家水资源压力排名能够清晰看见巨大分化，埃及、巴林、阿联酋等诸多国家淡水取用量显著超出本土可再生淡水资源上限，水资源供需缺口极为尖锐。</p>
          </SectionText>
          <ClientVisual image={clientWaterPressure} alt="water pressure reference" caption="制图数据源依托 World Bank《Water Stress》全球水资源压力数据库" variant="stress-pressure-visual" />
        </div>
        <div className="glass-card reveal"><div className="card-head"><span>国家水资源压力排行</span><b>2022</b></div><StressRanking /><ChartAnnotation>水资源压力指数 = 淡水取水量 ÷ 可再生淡水资源总量 × 100%。埃及 7750% 约为 77.5 倍，巴林 3877.5% 约为 38.8 倍，远高于普通国家几十%或 100% 左右的水平，通常意味着当地需要依赖地下水超采、海水淡化、外部水源或虚拟水贸易维持供水。对数轴用于避免极端值把普通国家全部压缩在一起。</ChartAnnotation><SourceNote links={[{ label: 'World Bank · 指标定义', url: sourceLinks.waterStress }]}>资料来源：World Bank</SourceNote></div>
      </section>

      <section className="chapter two-col reverse map-chapter" id="map">
        <div className="chapter-bg" />
        <div className="glass-card reveal map-card"><div className="card-head"><span>全球高水压与海外水利项目</span><b>3D GLOBE</b></div><LazyWhenVisible fallback={<ThreeFallback />} rootMargin="1800px 0px" idle idleTimeout={1600}><Suspense fallback={<ThreeFallback />}><WaterResourceGlobe stressPoints={pressurePoints} projects={overseasProjects} /></Suspense></LazyWhenVisible><ChartAnnotation>橙色点位表示高水资源压力国家，绿色点位和弧线表示中国海外水利项目；叠加观察可以看到，中东北非、南亚和中亚形成了连续的高压力带。</ChartAnnotation><SourceNote links={[{ label: 'World Bank · 水资源压力', url: sourceLinks.waterStress }, { label: 'CIDCA', url: sourceLinks.cidca }]}>资料来源：World Bank、CIDCA</SourceNote></div>
        <div className="map-copy-stack">
          <ClientVisual image={mapFlowIllustration} alt="mountain river flow illustration" variant="map-illustration-visual" />
          <SectionText kicker="图表说明">
            <p><StrongMark>水资源承压严峻的国家大多沿干旱带呈条带、片区状聚集。</StrongMark>将全球水资源压力指数与海外水利项目叠加在同一空间维度下观察，中东北非、南亚和中亚形成了一条清晰的高压力带。</p>
          </SectionText>
          <ClientVisual image={clientPakistanProjectOne} alt="China Pakistan water cooperation project banner" variant="map-project-visual" />
        </div>
      </section>

      <section className="chapter case-chapter" id="case">
        <div className="chapter-bg" />
        <div className="case-series">
          <TurkanaCasePanel />
          <RegionalCasePanel
            variant="somalia-case"
            country="索马里"
            title="努加尔州"
            image={somaliaDisplacement}
            imageAlt="索马里南部流离失所者营地中的两名年轻女孩"
            caption={<><strong>联合国儿童基金会 / Said Fadhaye</strong>：两名年轻女孩穿行在索马里南部的流离失所者营地，那里收容着因干旱而流离失所的家庭。</>}
          >
            <p className="scroll-copy">索马里则展现出干旱气候与武装冲突交织放大水危机的残酷现实。在索马里东北部努加尔州的游牧社区，持续数十年的周期性干旱不断干涸季节性河谷，部族之间围绕残存水井、水塘的冲突频繁爆发。大量牧民被迫放弃草场涌入难民营，37岁的游牧民法图玛・阿里被迫每日排队数小时领取配给饮用水，洁净水源供给不稳定，腹泻、急性营养不良长期威胁家中幼童生存。</p>
            <p className="scroll-copy"><StrongMark>气候干旱制造水源缺口，动荡局势摧毁供水基础设施，原本维系生存的水资源，持续演变为诱发流离失所、族群矛盾的导火索。</StrongMark></p>
          </RegionalCasePanel>
          <RegionalCasePanel
            variant="yemen-case"
            country="也门"
            title="亚丁老城"
            image={yemenAdenMarket}
            imageAlt="两名也门商贩在亚丁老城街边售卖新鲜蔬果"
            caption="两名也门商贩在亚丁老城街边售卖新鲜蔬果。当地农业与生鲜经营高度依赖地下水资源，地下水枯竭、供水系统崩坏持续冲击城市日常食品供给。摄于也门亚丁。佚名纪实摄影师。"
          >
            <p className="scroll-copy">也门的困境敲响了无节制开采地下水的长久警钟。地处阿拉伯干旱带的也门，曾是阿拉伯半岛农业重镇，数十年间民众无节制抽取深层地下水浇灌经济作物，全国地下水位持续断崖式下降，多数乡村传统水井彻底干涸。居住在萨达省乡村的居民穆罕默德・阿卜杜拉，过去依靠自家浅井维持全家生计，如今必须花费高额费用购买卡车运送的桶装水。</p>
            <p className="scroll-copy"><StrongMark>当天然淡水资源被长期透支，再叠加战乱对市政供水系统的持续破坏，也门沦为中东水资源崩溃最典型的样本，普通人最先承受资源透支带来的生存代价。</StrongMark></p>
          </RegionalCasePanel>
        </div>
      </section>

      <section className="chapter two-col" id="coverage">
        <div className="chapter-bg" />
        <div className="coverage-copy-stack">
          <div className="coverage-illustrations">
            <ClientVisual image={bottledWaterIllustration} alt="three bottled water illustrations" variant="coverage-bottle-visual" />
            <ClientVisual image={waterRecycleIllustration} alt="water recycling illustration" variant="coverage-recycle-visual" />
          </div>
        <SectionText kicker="图表说明">
          <p className="coverage-copy"><StrongMark>进一步的数据分析清晰表明：</StrongMark><br />虽然全球整体基础饮水覆盖率已实现稳步提升，但区域发展失衡问题依旧突出，饮水保障的短板高度集中在生态环境承载力偏弱、经济发展水平不足的区域。伴随着整体供水覆盖率持续向 100% 迈进，尚未实现供水保障的偏远区域与弱势群体，逐步转变为最难攻克的遗留短板，剩余缺口的治理难度持续抬升。这也再次印证，水资源压力并不会在全球均匀分摊，严峻的缺水负担高度集中于部分国家与地区，且当地资源承载已逼近承载极限。</p>
        </SectionText>
        </div>
        <div className="glass-card reveal"><div className="card-head"><span>基本饮水服务覆盖率 / 缺口人口</span><b>2024</b></div><CoverageSwitcher /><ChartAnnotation>覆盖率反映比例，缺口人口反映规模；同一地区即使覆盖率较高，只要人口基数足够大，仍可能存在数量庞大的未覆盖人口。</ChartAnnotation><SourceNote links={[{ label: 'World Bank · 基本饮水服务', url: sourceLinks.drinkingWater }]}>资料来源：World Bank</SourceNote></div>
      </section>

      <section className="chapter two-col reverse" id="people">
        <div className="chapter-bg" />
        <div className="glass-card reveal"><div className="card-head"><span>未获基本饮水服务人口估算</span><b>百万人</b></div><UnservedChart /><ChartAnnotation>把覆盖率缺口换算成人数后，人口规模和基础设施分散程度的影响会更加直观；因此比例较小的地区，也可能对应较大的实际人口缺口。</ChartAnnotation><SourceNote links={[{ label: 'World Bank · 人口', url: sourceLinks.population }]}>资料来源：World Bank</SourceNote></div>
        <div className="people-copy-stack">
          <SectionText kicker="图表说明">
            <p>饮水保障缺口在人口维度显著向<StrongMark>中低收入经济体、撒哈拉以南非洲、冲突脆弱地区</StrongMark>集中。即便部分区域饮水覆盖率降幅有限，庞大的人口基数仍造就规模可观的缺水人群，构成供水普及后期最难啃的攻坚单元。</p>
          </SectionText>
          <ClientVisual image={shortageSeedling} alt="干裂土地中新生幼苗的缺水场景" variant="people-shortage-visual" />
        </div>
      </section>

      <section className="chapter two-col" id="trend">
        <div className="chapter-bg" />
        <div className="trend-copy-stack">
          <SectionText kicker="图表说明">
            <p>同样深陷水资源高压困境，全球缺水危机的内在成因并不能简单依靠水资源压力指数完整概括。世界银行水资源压力折线仅量化取水规模与可再生水量的比值，却难以区分缺水的形成机理。依据水利部与联合国水机制（UN-Water）标准框架，缺水可以划分为资源性缺水与水质性缺水两大类型，二者时常在同一区域交织叠加，进一步放大生存风险。</p>
            <p>中东北非、中亚等干旱带区域长期面临资源禀赋约束，天然水资源总量上限难以突破；而不少湿润区域虽降水充沛，却因污染侵蚀不断压缩可用淡水规模。值得注意的是，缺水类型并非永久固化的地理标签，粗放开发模式有可能推动单一缺水向复合型水危机演变，这也意味着应对水危机不能采取同质化治理方案，需要因地制宜识别核心矛盾、精准匹配治理工具。</p>
          </SectionText>
          <ClientVisual
            image={yangtzeEstuaryLandsat}
            alt="中国长江河口卫星遥感影像，径流裹挟泥沙入海"
            variant="trend-satellite-visual"
            caption={(
              <>
                <span>中国长江河口卫星遥感影像。径流裹挟泥沙、污染物入海，直观展现流域人类活动与水文连通对近海水质的传导效应，是流域—近海水环境联动治理的典型地理样本。</span>
                <small>影像原始数据源：NASA Landsat 卫星遥感数据集</small>
              </>
            )}
          />
        </div>
        <div className="glass-card reveal"><div className="card-head"><span>全球主要区域水压力趋势：压力结果</span><b>2014—2021</b></div><RegionTrendChart /><WaterStressMechanism /><ChartAnnotation>折线图展示的是各区域水资源压力的结果和变化趋势，不能单独证明某一种成因。缺水成因可分为资源性缺水（水量本身不足）和水质性缺水（有水但无法安全利用）；中东北非曲线长期处在最高位，2021 年达到 167.14%，通常与自然供给不足、农业和人口用水增加，以及污染和气候变化对可用水量的压缩共同相关。</ChartAnnotation><SourceNote links={[{ label: 'World Bank · 水资源压力', url: sourceLinks.waterStress }]}>资料来源：World Bank</SourceNote></div>
        <p className="trend-art-copy">以水为媒，人类正共同探寻“命运与共”的深层内涵。在水资源可持续管理领域，没有哪一方能独善其身，我们共享同一片流域、相连着共同命运，更从各自的实践中生长出可供彼此借鉴的智慧。</p>
      </section>

      <section className="chapter concept" id="concept">
        <div className="chapter-bg" />
        <SectionText kicker="02 / CHINA SOLUTION" title="中国方案：系统性治理的实践与成效">
          <p>中国水治理的智慧，从来不是无根之木。两千多年前，李冰父子在岷江上“乘势利导”修建都江堰，开创了人与自然和谐共生的东方治水哲学；如今，“山水林田湖草沙”的系统治理理念，正是这份古老智慧在当代的回响与升级。根植于本土的治水脉络延续至现代，落地为持续迭代完善的现代涉水治理政策体系。</p>
          <p>放眼国内水资源治理实践，早在2005年，中央便出台文件系统性部署饮用水安全保障工作，正式开启农村饮水安全工程建设，针对西北山区、西南偏远县域缺水问题开展初步帮扶，构成全国统筹水资源治理的起点。我国涉水治理工作自此由单纯解决饮水困难，转向水量供给与水质保障协同推进的综合施策阶段。</p>
        </SectionText>
        <div className="glass-card reveal concept-card"><PolicyFlow /></div>
      </section>

      <section className="chapter china-chapter" id="china">
        <div className="chapter-bg" />
        <div className="china-heading reveal">
          <p><StrongMark>依托逐年稳步增加的农村供水资金投入，我国农村自来水普及率持续稳步攀升：</StrongMark>前期依托工程建设实现覆盖率快速提升，后期增长趋于平缓，治理重心转向规模化供水长效运维与水质安全保障，逐步将亿万农村群众纳入标准化现代供水体系，<span className="china-deep-copy">基本解决了乡村取水难、水质差的旧况。</span></p>
          <p>然而，中国治水方案的优势远不止搭建供水体系。随着农村规模化供水全面落地，水环境与水质污染治理的新挑战接踵而至。精准的政策引导，直接推动了水环境质量实现系统性提升。一升一降两组数据，清晰勾勒出近九年来我国地表水水质持续改善的轨迹：<StrongMark>九年间，全国地表水优良断面占比由67.8%升至90.4%，劣V类水体占比从8.6%锐减至0.6%，标志着我国污染水体已基本消除。</StrongMark></p>
          <ClientVisual image={clientWaterQuality} alt="surface water quality improvement" variant="china-quality-visual" />
        </div>
        <div className="glass-card reveal china-card"><ChinaActionDashboard /></div>
      </section>

      <section className="chapter two-col reverse debate-chapter" id="debate">
        <div className="chapter-bg" />
        <div className="glass-card reveal debate-card">
          <div className="card-head debate-card-head"><b>ITERATION</b></div>
          <DebateDashboard />
        </div>
        <SectionText kicker="03 / ITERATION" title="中国之治：在反思中精进的治理智慧">
          <p>然而在大江大河水质明显改善的同时，中国生态环境部始终保持在行进中不断回望、在成绩前始终清醒的反思自觉。在树立和践行正确政绩观的学习教育活动中，他们注意到，群众身边的细小支流、坑塘沟渠仍然存在异色异味的状况。<StrongMark>水质改善的宏观数据与微观感知之间的温差，正是治理精度需要再次校准的地方。</StrongMark></p>
          <p>2026年6月，生态环境部会同国家发展改革委、工信部、住建部、水利部、农业农村部，精准部署五大攻坚行动：工业园区水污染整治、县乡黑臭水体治理、畜禽粪污综合治理、乡村河湖库管护、小微水体排查整治，让人民群众放心用水，不断提升幸福感、获得感。</p>
          <p>同期，第三轮第六批中央生态环境保护督察深入一线，查实了一批突出生态环境问题，核实了一批不作为、慢作为、不担当、不碰硬、甚至敷衍应对、形式主义的问题，并公开通报、以儆效尤。从辽宁葫芦岛生活污水收集处理短板，到多地违规取水与监管不严，国家督察始终坚定“问题不怕暴露，怕的是回避”的工作导向和治理立场，始终把人民的利益放在第一位。</p>
          <p>这种精益求精的治理逻辑，将静态的中国方案转化为一个不断动态发展的治理生态系统。当这套“反思——整改——提升”的闭环机制持续运转，中国水治理便拥有了向内扎根的深度，而这恰恰是它向外生长的底气。</p>
        </SectionText>
      </section>

      <section className="chapter two-col overseas-chapter" id="overseas">
        <div className="chapter-bg" />
        <SectionText
          kicker="04 / OVERSEAS PROJECTS"
          title={(
            <span className="overseas-title-wrap">
              <img className="overseas-ship-illustration" src={shipIllustration} alt="" loading="lazy" decoding="async" />
              <span className="overseas-title-stack">
                <img className="overseas-fish-background" src={fishIllustration} alt="" loading="lazy" decoding="async" />
                <span className="overseas-title-copy">出海之路：<br />系统方案与国际合作的双向赋能</span>
              </span>
            </span>
          )}
        >
          <p>如今，中国治水的实践半径正从国内流域延伸至全球缺水地区——水龙头背后的治水故事，正在被书写进更广阔的世界版图，中国治水的出海之路由此开启。</p>
          <p>当我们把视线聚焦到具体的水坝点位，一幅更清晰的图景浮现出来<br /><StrongMark>——中国治水的海外实践，正沿着“一带一路”落地生根。</StrongMark></p>
        </SectionText>
        <div className="glass-card reveal overseas-card">
          <div className="card-head"><span>中国海外水利项目</span><b>2006—2024</b></div>
          <OverseasPortfolio />
          <ChartAnnotation>15 个项目覆盖 12 个国家，项目类型从水电站扩展到供水、水坝、灌溉和水利信息化；点位数量体现空间分布，投资额仅统计已披露项目。</ChartAnnotation>
        </div>
      </section>

      <section className="chapter two-col reverse pakistan-chapter" id="pakistan">
        <div className="chapter-bg" />
        <div className="pakistan-copy-layout">
          <SectionText kicker="案例说明">
            <p><StrongMark>以巴基斯坦为例，</StrongMark>当地面临着复杂的水资源压力背景，既有季风带来的洪涝风险，也有旱季的极度缺水。中国参与的海外水利项目，不再是单一的水利工程建设，而是结合了本土化需求的系统解决方案。</p>
          </SectionText>
          <div className="pakistan-copy-art" aria-hidden="true">
            <img className="pakistan-house-art" src={houseIllustration} alt="" loading="lazy" decoding="async" />
            <img className="pakistan-wind-art" src={windIllustration} alt="" loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="glass-card reveal pakistan-card"><PakistanCaseDashboard /></div>
      </section>

      <section className="chapter two-col wisdom-chapter" id="wisdom">
        <div className="chapter-bg" />
        <div className="wisdom-copy-stack">
          <img className="wisdom-sea-art reveal" src={oceanAnimalsIllustration} alt="" loading="lazy" decoding="async" />
          <SectionText kicker="图表说明">
            <p><StrongMark>2015至2024年间，</StrongMark>中巴水利合作项目数量逐年稳步增长，同步带动巴基斯坦全国灌溉保证率持续提升，有效缓解了当地水资源承压困境。这些成效数据既是中国治水方案海外落地的有力实证，也完整诠释了南南水资源合作的实践价值，标志着中外水合作从基础技术援建，逐步升级为长效规则对话的理念交融，为全球缺水地区的水资源治理打造了成熟可行的合作范本。</p>
          </SectionText>
          <ClientVisual image={clientPakistanProjectTwo} alt="China Pakistan water cooperation data" variant="wide-visual wisdom-photo-visual" />
        </div>
        <div className="glass-card reveal wisdom-card">
          <div className="card-head"><span>智慧交融</span><b>2015—2024</b></div>
          <WisdomDashboard />
        </div>
      </section>

      <section className="chapter two-col route-chapter" id="route">
        <div className="chapter-bg" />
        <div className="route-art-panel reveal">
          <p className="route-art-copy">
            <span><StrongMark>每一次跨境水利合作，都是对全球水治理体系的一次补充和完善。</StrongMark></span>
            <span>中国方案证明，水危机没有放之四海皆准的统一解法，</span>
            <span>水治理也不是单一的孤立工程，而需要因地制宜的系统思维。</span>
          </p>
        </div>
        <div className="glass-card reveal bri-card">
          <div className="card-head"><span>一带一路沿线水利合作</span><b>ROUTE</b></div>
          <BeltRoadTimelineMap />
          <ChartAnnotation>发光线连接中国与合作国家，年份柱用于增强历史纵深感；路线图强调合作网络和时间顺序，不代表地理距离或投资规模。</ChartAnnotation>
          <SourceNote links={[{ label: 'CIDCA', url: sourceLinks.cidca }, { label: '水利部国际合作', url: sourceLinks.mwrInternational }]}>资料来源：CIDCA、水利部国际合作公开资料</SourceNote>
        </div>
      </section>

      <section className="finale" id="method">
        <div className="finale-inner reveal">
          <span className="eyebrow">CONCLUSION</span>
          <div className="finale-people-divider" aria-hidden="true">
            <div className="finale-people-run finale-people-run-left">
              {finalePeopleLeft.map((src, index) => (
                <img key={`finale-left-${index}`} src={src} alt="" loading="lazy" decoding="async" />
              ))}
            </div>
            <div className="finale-hands-mark">
              <img src={unityHands} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="finale-people-run finale-people-run-right">
              {finalePeopleRight.map((src, index) => (
                <img key={`finale-right-${index}`} src={src} alt="" loading="lazy" decoding="async" />
              ))}
            </div>
          </div>
          <h2>以水为媒<br />共绘人类命运共同体新图景</h2>
          <p>水的故事，从来不止于征服与调配，更在于平衡与共生。从李冰父子“乘势利导”修建的都江堰，到如今统筹“山水林田湖草沙”的系统治理，东方智慧始终蕴含着对自然节律的深刻尊重。这份智慧，与荷兰“还地于河”的谦卑、以色列“滴水归田”的极致、新加坡“化污为清”的循环一道，共同构成了人类应对水危机的多元哲学。</p>
          <p>中国治水的当代叙事，是一曲在古老智慧与现代挑战间寻求接续，在宏大工程与微观管理间探索平衡，在解决自身问题与参与全球合作间建立联结的进行曲。它既为大规模、快节奏推进水基础设施建设提供了实践参考，也仍在探索大型工程的生态伦理、跨境水管理的公平之道，以及水技术与地方性知识的融合路径。</p>
          <p>最终，面对全球水困局，不存在唯一的“破局之道”。答案藏在尼罗河流域的协调谈判中，藏在恒河平原的污染治理行动中，也藏在不同地区不断推进的节水生活与水环境治理实践中。以水为媒缔结的，不是某个方案的霸权，而是一个允许差异、鼓励互鉴、共同负责的命运共同体。每一滴跨越边界的水，都在提醒我们：在这颗蓝色星球上，我们同舟共济。</p>
          <div className="finale-mosaic" aria-label="全球治水智慧图片组">
            <figure><img src={endingDujiangyan} alt="都江堰水利工程" loading="lazy" decoding="async" /><figcaption>都江堰 · 乘势利导</figcaption></figure>
            <figure><img src={endingSystemGovernance} alt="山水林田湖草沙系统治理示意" loading="lazy" decoding="async" /><figcaption>山水林田湖草沙</figcaption></figure>
            <figure><img src={endingRoomForRiver} alt="荷兰还地于河相关空间" loading="lazy" decoding="async" /><figcaption>还地于河</figcaption></figure>
            <figure><img src={endingDripIrrigation} alt="以色列滴灌示意" loading="lazy" decoding="async" /><figcaption>滴水归田</figcaption></figure>
            <figure><img src={endingNewater} alt="新加坡循环水治理空间" loading="lazy" decoding="async" /><figcaption>化污为清</figcaption></figure>
            <figure><img src={endingSharedFuture} alt="世界各国人民携手共同治水" loading="lazy" decoding="async" /><figcaption>同舟共济</figcaption></figure>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>回到顶部</button>
        </div>
      </section>
    </main>
  )
}
