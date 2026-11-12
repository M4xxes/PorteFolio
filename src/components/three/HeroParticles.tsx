'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ui } from '@/lib/store'
import { T_END, clamp01, heroT, metrics, smooth } from './heroTimeline'

// 56 × 35 = 1 960 points : une sphère au repos, une mosaïque 16:10 à l'arrivée.
const COLS = 56
const ROWS = 35
const COUNT = COLS * ROWS

const vertexShader = /* glsl */ `
  attribute vec3 aDir;
  attribute vec2 aCell;
  attribute vec4 aRand;

  uniform mat3 uRot;
  uniform vec3 uSphere;   // centre (xy) et rayon, en unités monde
  uniform vec4 uPlane;    // centre (xy), largeur, hauteur
  uniform vec2 uGrid;
  uniform float uDisperse;
  uniform float uForm;
  uniform float uFade;
  uniform float uWpp;
  uniform float uTime;
  uniform float uVel;
  uniform float uTexReady;
  uniform sampler2D uTex;
  uniform vec3 uFg;
  uniform vec3 uAccent;

  varying vec4 vColor;

  void main() {
    // --- Sphère : rotation (temps + curseur), profondeur → taille et opacité
    vec3 d = uRot * aDir;
    float depth = d.z * 0.5 + 0.5;
    float grow = 1.0 + uDisperse * 0.9;
    float burst = 1.0 + uDisperse * aRand.x * 1.6;
    vec3 sp = d * uSphere.z * grow * burst;
    sp.xy += uDisperse * 0.12 * uSphere.z * vec2(sin(uTime * 0.6 + aRand.y * 6.283), cos(uTime * 0.5 + aRand.z * 6.283));
    sp.xy += uSphere.xy;
    float sizeS = (2.0 + depth * 4.0) * uWpp * (1.0 + uDisperse * 0.5 * aRand.w);
    float alphaS = (0.12 + depth * 0.88) * (1.0 - uDisperse * 0.4);
    float lit = step(0.93, aRand.y) * smoothstep(0.5, 0.8, d.z);
    vec3 colS = mix(uFg, uAccent, lit);

    // --- Plan : une case de la grille, couleur prise dans la capture du premier projet
    vec3 pl = vec3(uPlane.x + (aCell.x - 0.5) * uPlane.z, uPlane.y + (0.5 - aCell.y) * uPlane.w, 0.0);
    vec2 cell = uPlane.zw / uGrid;
    vec3 tex = texture2D(uTex, vec2(aCell.x, 1.0 - aCell.y)).rgb;
    float luma = dot(tex, vec3(0.2126, 0.7152, 0.0722));
    tex = mix(tex, vec3(luma), 0.35); // même désaturation que la carte HTML (grayscale 0.35)
    vec3 colP = mix(uFg * 0.45, tex, uTexReady);

    // --- Passage de l'un à l'autre, décalé par particule
    float f = clamp((uForm - aRand.z * 0.45) / 0.55, 0.0, 1.0);
    f = f * f * (3.0 - 2.0 * f);
    vec3 pos = mix(sp, pl, f);
    pos.z += sin(f * 3.14159) * uSphere.z * 0.7 * (aRand.w - 0.3);

    vec2 size = mix(vec2(sizeS), cell * 1.03, f);
    // La vitesse du scroll étire les particules en vol ; à l'arrêt, elles redeviennent carrées.
    size.y *= 1.0 + min(abs(uVel) * 0.035, 1.6) * (1.0 - f) * smoothstep(0.02, 0.2, uDisperse);

    vColor = vec4(mix(colS, colP, smoothstep(0.45, 1.0, f)), mix(alphaS, 1.0, f) * uFade);
    gl_Position = projectionMatrix * viewMatrix * vec4(pos + vec3(position.xy * size, 0.0), 1.0);
  }
`

const fragmentShader = /* glsl */ `
  varying vec4 vColor;
  void main() {
    if (vColor.a < 0.004) discard;
    gl_FragColor = vColor;
  }
`

/** Couleur CSS (#rrggbb) → vec3 sRGB brut (le shader écrit directement en sRGB). */
function cssColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  const hex = /^#([0-9a-f]{6})$/i.exec(raw)?.[1] ?? fallback.slice(1)
  const n = parseInt(hex, 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

// Pseudo-aléatoire déterministe : la sphère est identique à chaque visite.
function mulberry(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function HeroParticles({ texture, onFirstFrame }: { texture: string; onFirstFrame: () => void }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const first = useRef(true)
  // Ressort de rotation (curseur) et fondu d'apparition.
  const spring = useRef({ rx: 0, ry: 0, vx: 0, vy: 0, intro: 0 })

  const { geometry, material } = useMemo(() => {
    const rand = mulberry(20260)
    const dir = new Float32Array(COUNT * 3)
    const cell = new Float32Array(COUNT * 2)
    const rnd = new Float32Array(COUNT * 4)
    // Cases de la grille dans un ordre mélangé : chaque point de la sphère part vers une case quelconque.
    const order = Array.from({ length: COUNT }, (_, i) => i)
    for (let i = COUNT - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      dir.set([Math.cos(th) * r, y, Math.sin(th) * r], i * 3)
      const c = order[i]
      cell.set([((c % COLS) + 0.5) / COLS, (Math.floor(c / COLS) + 0.5) / ROWS], i * 2)
      rnd.set([rand(), rand(), rand(), rand()], i * 4)
    }
    const geometry = new THREE.PlaneGeometry(1, 1)
    geometry.setAttribute('aDir', new THREE.InstancedBufferAttribute(dir, 3))
    geometry.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 2))
    geometry.setAttribute('aRand', new THREE.InstancedBufferAttribute(rnd, 4))

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uRot: { value: new THREE.Matrix3() },
        uSphere: { value: new THREE.Vector3() },
        uPlane: { value: new THREE.Vector4() },
        uGrid: { value: new THREE.Vector2(COLS, ROWS) },
        uDisperse: { value: 0 },
        uForm: { value: 0 },
        uFade: { value: 0 },
        uWpp: { value: 1 },
        uTime: { value: 0 },
        uVel: { value: 0 },
        uTexReady: { value: 0 },
        uTex: { value: null as THREE.Texture | null },
        uFg: { value: cssColor('--fg', '#edede8') },
        uAccent: { value: cssColor('--accent', '#d4ff3a') },
      },
    })
    return { geometry, material }
  }, [])

  // Capture du premier projet : petite texture (la grille ne fait que 56 × 35 échantillons).
  useEffect(() => {
    let disposed = false
    let tex: THREE.Texture | null = null
    new THREE.TextureLoader().load(texture, (t) => {
      if (disposed) return t.dispose()
      tex = t
      t.colorSpace = THREE.NoColorSpace
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.generateMipmaps = true
      const u = (mesh.current?.material as THREE.ShaderMaterial | undefined)?.uniforms
      if (!u) return t.dispose()
      u.uTex.value = t
      u.uTexReady.value = 1
    })
    return () => {
      disposed = true
      tex?.dispose()
    }
  }, [texture])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
    },
    [geometry, material]
  )

  const euler = useMemo(() => new THREE.Euler(), [])
  const m4 = useMemo(() => new THREE.Matrix4(), [])

  useFrame((state, delta) => {
    if (!metrics.ready) return
    // Uniforms lus via la ref du mesh : on ne modifie pas une valeur mémorisée par React.
    const u = (mesh.current!.material as THREE.ShaderMaterial).uniforms
    const { scroll, pointer } = ui.getState()
    const dt = Math.min(delta, 0.05)
    const t = heroT()
    const { wpp, vw, vh } = metrics
    const toX = (px: number) => (px - vw / 2) * wpp
    const toY = (py: number) => -(py - vh / 2) * wpp

    // Ressort amorti vers la position du curseur (jamais en 1:1 sec).
    const s = spring.current
    const k = 38
    const c = 9
    s.vy += (-k * (s.ry - pointer.nx * 0.85) - c * s.vy) * dt
    s.vx += (-k * (s.rx - pointer.ny * 0.5) - c * s.vx) * dt
    s.ry += s.vy * dt
    s.rx += s.vx * dt
    s.intro = Math.min(1, s.intro + dt / 0.5)

    const time = state.clock.elapsedTime
    euler.set(0.3 + s.rx, time * 0.14 + s.ry, 0, 'XYZ')
    u.uRot.value.setFromMatrix4(m4.makeRotationFromEuler(euler))

    // La sphère reste presque en place pendant que la page défile (léger parallax), puis se disperse.
    u.uSphere.value.set(toX(metrics.sphere.x), toY(metrics.sphere.y - scroll.y * 0.3), metrics.sphere.r * wpp)
    const tg = metrics.target
    u.uPlane.value.set(toX(tg.x + tg.w / 2), toY(tg.y - scroll.y + tg.h / 2), tg.w * wpp, tg.h * wpp)
    u.uDisperse.value = smooth(0, 0.5, t)
    u.uForm.value = clamp01((t - 0.4) / 0.6)
    u.uFade.value = s.intro * (1 - clamp01((t - 1) / (T_END - 1)))
    u.uWpp.value = wpp
    u.uTime.value = time
    u.uVel.value = scroll.velocity

    if (first.current) {
      first.current = false
      onFirstFrame()
    }
  })

  return <instancedMesh ref={mesh} args={[geometry, material, COUNT]} frustumCulled={false} />
}
