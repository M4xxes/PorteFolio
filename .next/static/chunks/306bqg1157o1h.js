(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,25234,e=>{"use strict";var o=e.i(1950);e.s(["useFrame",()=>o.D])},79485,e=>{"use strict";var o=e.i(43476),i=e.i(71645),r=e.i(75056),n=e.i(25234),t=e.i(90072);let c=`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;

  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));

  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);

  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);

  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractal sum of a few octaves — softer, more "liquid" undulation than a single noise call.
float fbm(vec3 p) {
  float f = 0.0;
  f += 0.55 * snoise(p);
  f += 0.30 * snoise(p * 2.02 + 5.2);
  f += 0.15 * snoise(p * 4.13 + 1.7);
  return f;
}
`,a=`
  uniform float uTime;
  uniform vec2 uMouse;
  varying float vDisplacement;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  ${c}

  void main() {
    vec3 base = normalize(position);
    float mouseInfluence = (uMouse.x * base.x + uMouse.y * base.y) * 0.1;
    float displacement = fbm(base * 1.05 + uTime * 0.15) * 0.16 + mouseInfluence;
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    vViewNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * mvPosition;
  }
`,s=`
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorRim;
  varying float vDisplacement;
  varying vec3 vViewNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vViewNormal);
    vec3 viewDir = normalize(vViewPosition);
    vec3 lightDir = normalize(vec3(0.5, 0.65, 0.9));

    float diffuse = max(dot(normal, lightDir), 0.0);
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.4);

    vec3 halfDir = normalize(lightDir + viewDir);
    float specular = pow(max(dot(normal, halfDir), 0.0), 80.0);

    vec3 color = mix(uColorDeep, uColorMid, diffuse * 0.65 + 0.35 + vDisplacement * 0.3);
    color = mix(color, uColorRim, fresnel * 0.8);
    color += specular * 0.18;

    gl_FragColor = vec4(color, 1.0);
  }
`;var l=e.i(85149);function v({mouse:e}){let r=(0,i.useRef)(null),c=(0,i.useMemo)(()=>new t.ShaderMaterial({vertexShader:a,fragmentShader:s,uniforms:{uTime:{value:0},uMouse:{value:new t.Vector2(0,0)},uColorDeep:{value:new t.Color("#1e1240")},uColorMid:{value:new t.Color(l.colors.accentDim)},uColorRim:{value:new t.Color("#d8b4fe")}}}),[]);return(0,n.useFrame)(o=>{c.uniforms.uTime.value=o.clock.elapsedTime;let i=e.current,n=c.uniforms.uMouse.value;n.x+=(i.nx-n.x)*.05,n.y+=(i.ny-n.y)*.05,r.current&&(r.current.rotation.y=.08*o.clock.elapsedTime,r.current.rotation.x=.1*Math.sin(.15*o.clock.elapsedTime))}),(0,o.jsxs)("mesh",{ref:r,children:[(0,o.jsx)("icosahedronGeometry",{args:[1.6,64]}),(0,o.jsx)("primitive",{object:c,attach:"material"})]})}function u(e){let o=43758.5453*Math.sin(12.9898*e);return o-Math.floor(o)}let x=new t.Object3D;function m({count:e=120}){let r=(0,i.useRef)(null),c=(0,i.useMemo)(()=>Array.from({length:e},(e,o)=>({position:new t.Vector3((u(1.13*o+1)-.5)*9,(u(2.71*o+5)-.5)*6,(u(3.97*o+9)-.5)*6-1),speed:.05+.15*u(4.41*o+13),offset:u(5.19*o+17)*Math.PI*2,scale:.015+.03*u(6.63*o+21)})),[e]);return(0,n.useFrame)(e=>{if(!r.current)return;let o=e.clock.elapsedTime;c.forEach((e,i)=>{x.position.set(e.position.x+.3*Math.sin(o*e.speed+e.offset),e.position.y+.3*Math.cos(o*e.speed*.8+e.offset),e.position.z),x.scale.setScalar(e.scale),x.updateMatrix(),r.current.setMatrixAt(i,x.matrix)}),r.current.instanceMatrix.needsUpdate=!0}),(0,o.jsxs)("instancedMesh",{ref:r,args:[void 0,void 0,e],children:[(0,o.jsx)("sphereGeometry",{args:[1,6,6]}),(0,o.jsx)("meshBasicMaterial",{color:l.colors.accent,transparent:!0,opacity:.5})]})}var p=e.i(95195),f=e.i(60630);e.s(["HeroScene",0,function(){let e,n=(e=(0,i.useRef)({x:0,y:0,nx:0,ny:0}),(0,i.useEffect)(()=>{let o=o=>{e.current.x=o.clientX,e.current.y=o.clientY,e.current.nx=o.clientX/window.innerWidth*2-1,e.current.ny=-(2*(o.clientY/window.innerHeight))+1};return window.addEventListener("pointermove",o),()=>window.removeEventListener("pointermove",o)},[]),e),t=(0,p.useIsTouch)(),c=(0,f.useReducedMotion)();return(0,o.jsxs)(r.Canvas,{dpr:[1,2],gl:{antialias:!0,alpha:!1},camera:{position:[0,0,4.5],fov:45},className:"!absolute inset-0",children:[(0,o.jsx)("color",{attach:"background",args:["#0a0a0a"]}),(0,o.jsxs)(i.Suspense,{fallback:null,children:[(0,o.jsx)(v,{mouse:n}),!t&&!c&&(0,o.jsx)(m,{count:100})]})]})}],79485)},20407,e=>{e.n(e.i(79485))}]);