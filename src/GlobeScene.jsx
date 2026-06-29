import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, extend } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import ThreeGlobe from 'three-globe'
import * as THREE from 'three'
import worldGeo from './assets/world.geo.json'

extend({ ThreeGlobe })

const CHINA_ORIGIN = {
  name: '中国水利合作起点',
  lat: 35.86,
  lng: 104.19
}

const stressNameZh = {
  EGY: '埃及',
  BHR: '巴林',
  TKM: '土库曼斯坦',
  ARE: '阿联酋',
  SAU: '沙特阿拉伯',
  LBY: '利比亚',
  SDN: '苏丹',
  QAT: '卡塔尔',
  MRT: '毛里塔尼亚',
  PAK: '巴基斯坦',
  UZB: '乌兹别克斯坦',
  SYR: '叙利亚',
  YEM: '也门',
  AZE: '阿塞拜疆'
}

function stressDisplayName(item) {
  return stressNameZh[item.code] || item.name?.replace(', Arab Rep.', '') || item.name
}

function GlobeObject({ stressPoints, projectPoints }) {
  const globeRef = useRef(null)

  const pointsData = useMemo(() => {
    const stress = stressPoints.map((item) => ({
      ...item,
      lng: item.lon,
      kind: 'stress',
      displayName: stressDisplayName(item),
      label: `${stressDisplayName(item)} · 水资源压力 ${Number(item.value).toFixed(0)}%`
    }))
    const projects = projectPoints.map((item) => ({
      ...item,
      lng: item.lon,
      kind: 'project',
      value: item.investment || 5,
      name: item.project,
      displayName: item.project,
      label: `${item.country} · ${item.project}`
    }))
    return [...stress, ...projects]
  }, [projectPoints, stressPoints])

  const arcsData = useMemo(() => projectPoints.map((item, index) => ({
    order: index,
    startLat: CHINA_ORIGIN.lat,
    startLng: CHINA_ORIGIN.lng,
    endLat: item.lat,
    endLng: item.lon,
    color: index % 2 ? '#7af0c9' : '#34c8ff'
  })), [projectPoints])

  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const material = globe.globeMaterial()
    material.color = new THREE.Color('#c7f7ff')
    material.emissive = new THREE.Color('#117b9a')
    material.emissiveIntensity = 0.28
    material.shininess = 0.9
    material.transparent = true
    material.opacity = 0.94

    globe
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor('#7af0c9')
      .atmosphereAltitude(0.18)
      .polygonsData(worldGeo.features)
      .polygonAltitude(() => 0.008)
      .polygonCapColor(() => 'rgba(27, 137, 171, 0.56)')
      .polygonSideColor(() => 'rgba(14, 94, 125, 0.18)')
      .polygonStrokeColor(() => 'rgba(236, 255, 255, 0.28)')
      .pointsData(pointsData)
      .pointLat('lat')
      .pointLng('lng')
      .pointAltitude((d) => (d.kind === 'project' ? 0.045 : 0.075))
      .pointRadius((d) => {
        if (d.kind === 'project') return 0.42
        return Math.max(0.45, Math.min(0.95, Number(d.value) / 900))
      })
      .pointColor((d) => (d.kind === 'project' ? '#7af0c9' : '#ffb25f'))
      .pointsMerge(false)
      .labelsData(pointsData.filter((d) => d.kind === 'stress').slice(0, 5))
      .labelLat('lat')
      .labelLng('lng')
      .labelText((d) => d.displayName)
      .labelSize(0.9)
      .labelDotRadius(0.18)
      .labelColor(() => '#ecfbff')
      .labelResolution(2)
      .arcsData(arcsData)
      .arcStartLat('startLat')
      .arcStartLng('startLng')
      .arcEndLat('endLat')
      .arcEndLng('endLng')
      .arcColor((d) => [d.color, d.color])
      .arcAltitudeAutoScale(0.42)
      .arcStroke(0.55)
      .arcDashLength(0.58)
      .arcDashGap(1.7)
      .arcDashInitialGap((d) => d.order * 0.28)
      .arcDashAnimateTime(3600)
      .ringsData(projectPoints.slice(0, 7).map((item) => ({ lat: item.lat, lng: item.lon, color: '#7af0c9' })))
      .ringLat('lat')
      .ringLng('lng')
      .ringColor((d) => (t) => `rgba(122, 240, 201, ${Math.max(0, 0.42 - t * 0.42)})`)
      .ringMaxRadius(2.2)
      .ringPropagationSpeed(0.85)
      .ringRepeatPeriod(1400)
  }, [arcsData, pointsData, projectPoints])

  return <threeGlobe ref={globeRef} />
}

function GlobeFallback() {
  return <div className="globe-fallback">3D 地球加载中</div>
}

export default function WaterResourceGlobe({ stressPoints, projects }) {
  const [focus, setFocus] = useState({ ...(stressPoints.find((item) => item.code === 'PAK') || stressPoints[0]), kind: 'stress' })
  const stageRef = useRef(null)
  const [active, setActive] = useState(false)
  const topStress = useMemo(() => [...stressPoints].sort((a, b) => b.value - a.value).slice(0, 4), [stressPoints])
  const projectPreview = useMemo(() => projects.slice(0, 4), [projects])
  const focusName = focus.kind === 'project' ? focus.project : stressDisplayName(focus)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      setActive(entry.isIntersecting)
    }, { rootMargin: '240px 0px' })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="globe-3d-wrap">
      <div className="globe-3d-stage" ref={stageRef}>
        <Suspense fallback={<GlobeFallback />}>
          <Canvas
            camera={{ position: [0, 0, 360], fov: 42 }}
            dpr={[1, 1.5]}
            frameloop={active ? 'always' : 'demand'}
            gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          >
            <color attach="background" args={['transparent']} />
            <ambientLight intensity={1.35} />
            <directionalLight color="#ffffff" position={[-280, 180, 260]} intensity={1.5} />
            <pointLight color="#7af0c9" position={[180, -120, 220]} intensity={1.15} />
            <GlobeObject stressPoints={stressPoints} projectPoints={projects} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 1.55}
              autoRotate={active}
              autoRotateSpeed={0.65}
            />
          </Canvas>
        </Suspense>
        <div className="globe-glow" aria-hidden="true" />
        <div className="globe-stage-stat" aria-label="3D 地球数据摘要">
          <span>空间对照</span>
          <strong>{stressPoints.length} 个高压力点 / {projects.length} 个水利项目</strong>
          <p>同屏观察水资源压力带与海外项目落点，避免地图左下区域留白。</p>
        </div>
      </div>

      <aside className="globe-info-panel">
        <div>
          <span className="globe-panel-kicker">3D GLOBE VIEW</span>
          <strong>{focusName}</strong>
          <p>{focus.kind === 'project' ? `${focus.country} · ${focus.type}` : `水资源压力指数 ${Number(focus.value).toFixed(2)}%`}</p>
        </div>
        <div className="globe-legend">
          <span><i className="stress" /> 高水压国家</span>
          <span><i className="project" /> 海外水利项目</span>
          <span><i className="arc" /> 中国水利合作路径</span>
        </div>
        <div className="globe-pick-list">
          {topStress.map((item) => (
            <button key={item.code} type="button" onClick={() => setFocus({ ...item, kind: 'stress' })}>
              <span>{stressDisplayName(item)}</span>
              <b>{Number(item.value).toFixed(0)}%</b>
            </button>
          ))}
          {projectPreview.map((item) => (
            <button key={item.project} type="button" onClick={() => setFocus({ ...item, name: item.project, kind: 'project' })}>
              <span>{item.country}</span>
              <b>{item.type}</b>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}
