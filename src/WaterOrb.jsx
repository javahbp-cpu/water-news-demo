import React, { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WaterSphere() {
  const meshRef = useRef(null)
  const materialRef = useRef(null)

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uColorA: { value: new THREE.Color('#7ef8df') },
    uColorB: { value: new THREE.Color('#1cb9e8') },
    uColorC: { value: new THREE.Color('#ffffff') }
  }), [])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    if (materialRef.current) materialRef.current.uniforms.uTime.value = time
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.12
      meshRef.current.rotation.z = Math.sin(time * 0.35) * 0.04
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.18, 72, 72]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vNormal;
            uniform float uTime;

            void main() {
              vUv = uv;
              vNormal = normalize(normalMatrix * normal);
              vec3 p = position;
              float waveA = sin((p.y * 7.5) + uTime * 1.3) * 0.035;
              float waveB = sin((p.x * 9.0) - uTime * 1.7) * 0.025;
              float waveC = sin((p.z * 8.0) + uTime * 1.1) * 0.018;
              p += normal * (waveA + waveB + waveC);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            varying vec3 vNormal;
            uniform float uTime;
            uniform vec3 uColorA;
            uniform vec3 uColorB;
            uniform vec3 uColorC;

            void main() {
              float flow = sin((vUv.y * 16.0) + uTime * 1.2) * 0.5 + 0.5;
              float shimmer = sin((vUv.x * 22.0) - uTime * 1.7) * 0.5 + 0.5;
              float fresnel = pow(1.0 - max(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
              vec3 color = mix(uColorB, uColorA, flow * 0.72 + shimmer * 0.18);
              color = mix(color, uColorC, fresnel * 0.42);
              gl_FragColor = vec4(color, 0.62 + fresnel * 0.28);
            }
          `}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2.15, 0, 0]}>
        <torusGeometry args={[1.42, 0.012, 8, 140]} />
        <meshBasicMaterial color="#79f5de" transparent opacity={0.38} />
      </mesh>
      <mesh rotation={[Math.PI / 2.05, 0.4, 0]}>
        <torusGeometry args={[1.72, 0.007, 8, 160]} />
        <meshBasicMaterial color="#37c8ff" transparent opacity={0.24} />
      </mesh>
    </group>
  )
}

function WaterOrbFallback() {
  return <div className="water-orb-fallback" aria-hidden="true" />
}

export default function WaterOrb() {
  return (
    <div className="water-orb-stage">
      <Suspense fallback={<WaterOrbFallback />}>
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        >
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 2, 4]} intensity={2.2} color="#ffffff" />
          <pointLight position={[-3, -1, 3]} intensity={1.6} color="#3fe2ff" />
          <WaterSphere />
        </Canvas>
      </Suspense>
    </div>
  )
}
