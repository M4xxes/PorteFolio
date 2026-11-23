'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { reducedMotionQuery } from '@/lib/motion'
import { DISS_VH, EYE_VH } from '@/components/intro/timing'
import { app } from '@/components/sphere/state'
import { Fluid } from './fluid'

/* ------------------------------------------------------------------ shaders */

const fullVert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`

const copyFrag = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
varying vec2 vUv;
void main() { gl_FragColor = texture2D(uTex, vUv); }`

const simFrag = /* glsl */ `
precision highp float;
uniform sampler2D uPositions;
uniform sampler2D uOrigin;
uniform sampler2D uFluidVel;
uniform sampler2D uFluidDen;
uniform float uTime;
uniform float uHZ;
uniform mat4 uProj;
uniform mat4 uModel;
uniform mat3 uNormalMatrix;
varying vec2 vUv;

// Rotation d'un vecteur par un quaternion (x, y, z, w).
vec3 qrot(vec3 v, vec4 q) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }

// Rotationnel analytique de trois potentiels (sommes de sinus), normalisé (bruit de type Bridson).
vec3 curlNoise(vec3 p) {
  vec3 k1 = vec3(7.3, 2.1, 5.2), k2 = vec3(3.1, 9.7, 4.4);
  vec3 k3 = vec3(5.9, 6.3, 2.7), k4 = vec3(2.3, 4.1, 8.9);
  vec3 k5 = vec3(8.1, 3.7, 6.1), k6 = vec3(4.7, 7.9, 3.3);
  vec3 gx = k1 * cos(dot(k1, p) + 1.3) + k2 * cos(dot(k2, p) + 4.1);
  vec3 gy = k3 * cos(dot(k3, p) + 2.7) + k4 * cos(dot(k4, p) + 0.6);
  vec3 gz = k5 * cos(dot(k5, p) + 5.2) + k6 * cos(dot(k6, p) + 3.4);
  vec3 c = vec3(gz.y - gy.z, gx.z - gz.x, gy.x - gx.y);
  return normalize(c + 1e-6);
}

// Anneau creux et torsadé, avec une grande ouverture et des lobes plus doux.
// p = (profondeur miroir, x, y) après la rotation par le quaternion ; le tore vit dans (x, y, profondeur).
float sdfRaw(vec3 p) {
  vec3 q = vec3(p.y, p.z, p.x - 0.12);
  float a = q.z * 3.0 + 0.6;
  float c = cos(a), s = sin(a);
  q.xy = mat2(c, -s, s, c) * q.xy;
  q.x *= 0.85;
  float ang = atan(q.y, q.x);
  float R = 0.2 + 0.03 * sin(ang * 2.0 + 0.8) + 0.018 * sin(ang * 3.0 - q.z * 6.0);
  vec2 t = vec2(length(q.xy) - R, q.z * 1.15);
  float r = 0.075 + 0.022 * sin(ang * 3.0 + 1.7);
  return (length(t) - r) * 0.7;
}

float sdfShape(vec3 p) {
  p.z = sqrt(p.z * p.z + 0.0215) - sqrt(0.012); // symétrie avant / arrière, couture douce
  p = qrot(p, vec4(0.5, 0.5, 0.5, 0.5));
  if (length(p) > 0.8) return length(p) - 0.7;
  return sdfRaw(p);
}

vec3 sdfNormal(vec3 p) {
  float e = 0.001;
  return normalize(vec3(
    sdfShape(p + vec3(e, 0.0, 0.0)) - sdfShape(p - vec3(e, 0.0, 0.0)),
    sdfShape(p + vec3(0.0, e, 0.0)) - sdfShape(p - vec3(0.0, e, 0.0)),
    sdfShape(p + vec3(0.0, 0.0, e)) - sdfShape(p - vec3(0.0, 0.0, e))
  ));
}

void main() {
  vec3 pos = texture2D(uPositions, vUv).xyz;
  vec3 origin = texture2D(uOrigin, vUv).xyz;

  if (length(pos) > 0.7) pos /= 2.0;
  pos += curlNoise(pos * 0.1 + uTime * 0.05) * 1.0 * 0.0002 * uHZ;

  vec3 gradient = sdfNormal(pos);
  float sdf = sdfShape(pos);
  pos += cross(normalize(pos), normalize(gradient)) * 0.0005;
  pos += -gradient * sdf * 0.5;
  pos += (origin - pos) * 0.0002 * uHZ;

  // Fluide du curseur
  vec4 clip = uProj * (uModel * vec4(pos, 1.0));
  vec2 screenUV = clip.xy / clip.w * 0.5 + 0.5;
  vec3 flow = vec3(texture2D(uFluidVel, screenUV).xy, 0.0);
  flow = uNormalMatrix * flow;
  pos += flow * 0.0001 * uHZ * 0.4 * min(texture2D(uFluidDen, screenUV).r, 1.0);

  gl_FragColor = vec4(pos, 1.0);
}`

const pointsVert = /* glsl */ `
uniform sampler2D uPositions;
uniform float uDPR;
attribute vec4 random;
varying vec4 vRandom;
varying float vScale;
void main() {
  vec3 pos = texture2D(uPositions, position.xy).xyz;
  pos *= mix(1.0, 1.5, pow(random.y, 150.0));
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  float viewDistance = length(mv.xyz);
  float scale = smoothstep(3.0, 15.0, viewDistance) * mix(0.5, 1.0, random.z);
  gl_PointSize = 0.04 * uDPR * 2.0 * scale * (1000.0 / viewDistance);
  vScale = scale;
  vRandom = random;
  gl_Position = projectionMatrix * mv;
}`

const pointsFrag = /* glsl */ `
precision highp float;
uniform sampler2D uMatcap;
uniform float uTime;
varying vec4 vRandom;
varying float vScale;

vec3 softLight(vec3 b, vec3 s) {
  return mix(2.0 * b * s + b * b * (1.0 - 2.0 * s), sqrt(b) * (2.0 * s - 1.0) + 2.0 * b * (1.0 - s), step(0.5, s));
}
vec3 overlay(vec3 b, vec3 s) {
  return mix(2.0 * b * s, 1.0 - 2.0 * (1.0 - b) * (1.0 - s), step(0.5, b));
}
void main() {
  vec2 uv = gl_PointCoord;
  if (length(uv - 0.5) > 0.5) discard;
  if (vScale < 0.1) discard;

  vec3 base = vec3(mix(0.0, 0.2, vRandom.x));
  base = mix(base, vec3(0.6, 0.45, 1.0), pow(vRandom.z, 100.0));
  float sparkle = 0.5 + (0.4 + sin(uTime * 4.0 + vRandom.y * 20.0)) * pow(vRandom.z, 10.0) * 2.5;
  base *= sparkle;

  float a = sin(uTime + vRandom.z * 20.0) * 0.5 + 1.0;
  vec2 p = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5) + 0.5;
  vec3 mat = texture2D(uMatcap, p).rgb;
  vec3 c = mix(base, softLight(base, mat), 0.8);
  c = mix(c, overlay(c, mat), 0.2);
  gl_FragColor = vec4(c, 1.0);
}`

/* ------------------------------------------------------------------ helpers */

/** Matcap 64×64 : une sphère grise adoucie (générée une fois, pas de fichier). */
function makeMatcap() {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(24, 22, 2, 32, 32, 32)
  grad.addColorStop(0, '#f2f2f2')
  grad.addColorStop(0.45, '#9a9a9a')
  grad.addColorStop(1, '#2a2a2a')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.NoColorSpace
  return t
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const mapClamp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))

/* ---------------------------------------------------------------- composant */

const BASE_CAM = new THREE.Vector3(-1.17, 0, 6)

export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const reduced = window.matchMedia(reducedMotionQuery).matches
    const mobile = window.innerWidth <= 760 || window.matchMedia('(pointer: coarse)').matches
    const SIZE = mobile ? 128 : 512 // 16 384 ou 262 144 particules

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance' })
    } catch (e) {
      console.warn('WebGL indisponible : nuage de particules désactivé.', e)
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 1)
    const floatOk = renderer.extensions.has('EXT_color_buffer_float')
    if (!floatOk) console.warn('EXT_color_buffer_float absent : positions en demi-flottants (précision réduite).')

    const size = () => ({ w: canvas.clientWidth || window.innerWidth, h: canvas.clientHeight || window.innerHeight })
    let { w, h } = size()
    renderer.setSize(w, h, false)

    // Scène : caméra et groupe selon le brief.
    const camera = new THREE.PerspectiveCamera(30, w / h, 0.1, 1000)
    camera.position.copy(BASE_CAM)
    camera.lookAt(0, 0, 0)
    const scene = new THREE.Scene()
    const group = new THREE.Group()
    group.position.set(0.343, 0.16, -1)
    group.rotation.set(THREE.MathUtils.degToRad(-28.4), THREE.MathUtils.degToRad(390), THREE.MathUtils.degToRad(4.92))
    group.scale.set(5, 5, 6)
    scene.add(group)

    // Positions : origine aléatoire dans [-1, 1]³, simulation en ping-pong.
    const N = SIZE * SIZE
    const originData = new Float32Array(N * 4)
    for (let i = 0; i < N; i++) {
      originData[i * 4] = Math.random() * 2 - 1
      originData[i * 4 + 1] = Math.random() * 2 - 1
      originData[i * 4 + 2] = Math.random() * 2 - 1
      originData[i * 4 + 3] = 1
    }
    const origin = new THREE.DataTexture(originData, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType)
    origin.minFilter = origin.magFilter = THREE.NearestFilter
    origin.needsUpdate = true

    const rt = () =>
      new THREE.WebGLRenderTarget(SIZE, SIZE, {
        type: floatOk ? THREE.FloatType : THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        depthBuffer: false,
        stencilBuffer: false,
      })
    let read = rt()
    let write = rt()

    const quadScene = new THREE.Scene()
    const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2))
    quad.frustumCulled = false
    quadScene.add(quad)

    const copyMat = new THREE.ShaderMaterial({ vertexShader: fullVert, fragmentShader: copyFrag, uniforms: { uTex: { value: origin } }, depthTest: false, depthWrite: false })
    quad.material = copyMat
    for (const target of [read, write]) {
      renderer.setRenderTarget(target)
      renderer.render(quadScene, quadCam)
    }
    renderer.setRenderTarget(null)

    const fluid = new Fluid(renderer)

    const simMat = new THREE.ShaderMaterial({
      vertexShader: fullVert,
      fragmentShader: simFrag,
      uniforms: {
        uPositions: { value: null },
        uOrigin: { value: origin },
        uFluidVel: { value: fluid.velocityTexture },
        uFluidDen: { value: fluid.densityTexture },
        uTime: { value: 0 },
        uHZ: { value: 1 },
        uProj: { value: new THREE.Matrix4() },
        uModel: { value: new THREE.Matrix4() },
        uNormalMatrix: { value: new THREE.Matrix3() },
      },
      depthTest: false,
      depthWrite: false,
    })

    // Points : `position.xy` = UV du texel, `random` = vec4 dans [0, 1].
    const uv = new Float32Array(N * 3)
    const random = new Float32Array(N * 4)
    for (let i = 0; i < N; i++) {
      uv[i * 3] = ((i % SIZE) + 0.5) / SIZE
      uv[i * 3 + 1] = (Math.floor(i / SIZE) + 0.5) / SIZE
      random[i * 4] = Math.random()
      random[i * 4 + 1] = Math.random()
      random[i * 4 + 2] = Math.random()
      random[i * 4 + 3] = Math.random()
    }
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(uv, 3))
    geometry.setAttribute('random', new THREE.BufferAttribute(random, 4))
    const matcap = makeMatcap()
    const pointsMat = new THREE.ShaderMaterial({
      vertexShader: pointsVert,
      fragmentShader: pointsFrag,
      uniforms: { uPositions: { value: read.texture }, uMatcap: { value: matcap }, uTime: { value: 0 }, uDPR: { value: dpr } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
    })
    const points = new THREE.Points(geometry, pointsMat)
    points.frustumCulled = false
    group.add(points)

    // Curseur / toucher
    const mouse = { x: w / 2, y: h / 2 }
    const prev = { x: w / 2, y: h / 2 }
    let lastSplat = 0
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) {
        mouse.x = t.clientX
        mouse.y = t.clientY
      }
    }

    const gazeTarget = new THREE.Vector3()
    let time = 0
    const p0 = new THREE.Vector2()
    const p1 = new THREE.Vector2()
    const col = new THREE.Vector3()

    const simulate = (dt: number) => {
      time += dt
      const HZ = dt * 60
      group.updateMatrixWorld(true)
      camera.updateMatrixWorld(true)
      const u = simMat.uniforms
      u.uPositions.value = read.texture
      u.uTime.value = time
      u.uHZ.value = HZ
      u.uProj.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
      u.uModel.value.copy(group.matrixWorld)
      u.uNormalMatrix.value.setFromMatrix4(camera.matrixWorld)
      u.uFluidVel.value = fluid.velocityTexture
      u.uFluidDen.value = fluid.densityTexture
      quad.material = simMat
      renderer.setRenderTarget(write)
      renderer.render(quadScene, quadCam)
      renderer.setRenderTarget(null)
      ;[read, write] = [write, read]
      pointsMat.uniforms.uPositions.value = read.texture
      pointsMat.uniforms.uTime.value = time
    }

    const draw = () => renderer.render(scene, camera)

    const onResize = () => {
      ;({ w, h } = size())
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      if (reduced) draw()
    }
    const ro = new ResizeObserver(onResize)
    ro.observe(canvas)

    let stopLoop = () => {}
    if (reduced) {
      // Nuage figé : on laisse la forme se former, puis une seule image.
      for (let i = 0; i < 240; i++) simulate(1 / 60)
      draw()
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('touchstart', onTouch, { passive: true })
      window.addEventListener('touchmove', onTouch, { passive: true })

      stopLoop = addFrame((_t, deltaMs) => {
        if (document.hidden) return
        const dt = Math.min(deltaMs / 1000, 0.05)
        // Le nuage se forme dès le chargement (derrière l'œil), mais n'est dessiné que lorsque la dissolution commence.
        const y = ui.getState().scroll.y
        const visible = app.offHome || y >= (EYE_VH - DISS_VH - 0.05) * window.innerHeight

        // Regard de la caméra : suit la souris (lerp 0,05).
        const mx = (mouse.x / w) * 2 - 1
        const my = (mouse.y / h) * 2 - 1
        gazeTarget.set(BASE_CAM.x + mx * -1, BASE_CAM.y + my * 2, BASE_CAM.z)
        camera.position.lerp(gazeTarget, 0.05)
        camera.lookAt(0, 0, 0)

        if (visible) {
          // Cursor → fluide
          const dx = mouse.x - prev.x
          const dy = mouse.y - prev.y
          const len = Math.hypot(dx, dy)
          const radius = mapClamp(len, 0, 5) * 60 * 0.6 * (mobile ? 0.8 : 1)
          const mult = mapClamp(len, 0, 15) * 10
          if (len > 0.01) {
            const now = performance.now()
            const startX = now - lastSplat > 50 ? mouse.x : prev.x
            const startY = now - lastSplat > 50 ? mouse.y : prev.y
            lastSplat = now
            p0.set(startX / w, 1 - startY / h)
            p1.set(mouse.x / w, 1 - mouse.y / h)
            col.set(dx * mult, -dy * mult, 1)
            fluid.splat(p0, p1, col, radius / 200, w / h)
          }
          prev.x = mouse.x
          prev.y = mouse.y
          fluid.step()
        } else {
          prev.x = mouse.x
          prev.y = mouse.y
        }

        simulate(dt)
        if (visible) draw()
      }, 20)
    }

    return () => {
      stopLoop()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      fluid.dispose()
      read.dispose()
      write.dispose()
      origin.dispose()
      matcap.dispose()
      geometry.dispose()
      pointsMat.dispose()
      simMat.dispose()
      copyMat.dispose()
      renderer.dispose()
    }
  }, [])

  return <canvas id="bg" ref={ref} aria-hidden />
}
