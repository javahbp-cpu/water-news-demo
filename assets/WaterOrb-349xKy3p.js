import{j as e,r as o,C as l,a as i,u}from"./three-DC0lEqez.js";import"./charts-CAc75Dgy.js";function f(){const r=o.useRef(null),a=o.useRef(null),s=o.useMemo(()=>({uTime:{value:0},uColorA:{value:new i("#7ef8df")},uColorB:{value:new i("#1cb9e8")},uColorC:{value:new i("#ffffff")}}),[]);return u(({clock:n})=>{const t=n.getElapsedTime();a.current&&(a.current.uniforms.uTime.value=t),r.current&&(r.current.rotation.y=t*.12,r.current.rotation.z=Math.sin(t*.35)*.04)}),e.jsxs("group",{children:[e.jsxs("mesh",{ref:r,children:[e.jsx("sphereGeometry",{args:[1.18,72,72]}),e.jsx("shaderMaterial",{ref:a,uniforms:s,transparent:!0,depthWrite:!1,vertexShader:`
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
          `,fragmentShader:`
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
          `})]}),e.jsxs("mesh",{rotation:[Math.PI/2.15,0,0],children:[e.jsx("torusGeometry",{args:[1.42,.012,8,140]}),e.jsx("meshBasicMaterial",{color:"#79f5de",transparent:!0,opacity:.38})]}),e.jsxs("mesh",{rotation:[Math.PI/2.05,.4,0],children:[e.jsx("torusGeometry",{args:[1.72,.007,8,160]}),e.jsx("meshBasicMaterial",{color:"#37c8ff",transparent:!0,opacity:.24})]})]})}function m(){return e.jsx("div",{className:"water-orb-fallback","aria-hidden":"true"})}function p(){return e.jsx("div",{className:"water-orb-stage",children:e.jsx(o.Suspense,{fallback:e.jsx(m,{}),children:e.jsxs(l,{camera:{position:[0,0,4.2],fov:42},dpr:[1,1.5],gl:{alpha:!0,antialias:!0,powerPreference:"low-power"},children:[e.jsx("ambientLight",{intensity:1.2}),e.jsx("directionalLight",{position:[3,2,4],intensity:2.2,color:"#ffffff"}),e.jsx("pointLight",{position:[-3,-1,3],intensity:1.6,color:"#3fe2ff"}),e.jsx(f,{})]})})})}export{p as default};
