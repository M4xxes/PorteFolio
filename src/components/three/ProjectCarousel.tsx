'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '@/lib/data/projects'
import { ui } from '@/lib/store'
import { heroT, metrics, poke, smooth, workState } from './heroTimeline'

const N = projects.length
const STEP = (Math.PI * 2) / N
/** Le quad dépasse l'écran de 6 % : la marge sert aux franges du décalage RGB. */
const PAD = 1.06
/** Rayon du cylindre et pente de la diagonale, en largeurs d'écran. */
const RADIUS = 1.15
const DIAGONAL = 0.62

const vertexShader = /* glsl */ `
  uniform float uSkew;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.y += p.x * uSkew; // légère inclinaison liée à la vitesse du scroll
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uReady;
  uniform float uActive;   // 0 = écran voisin (gris, sombre), 1 = écran actif
  uniform float uVel;      // vitesse du scroll, px / frame
  uniform float uTime;
  uniform float uOpacity;
  uniform float uPx;       // 1 / largeur de l'écran en px
  uniform float uLines;    // nombre de lignes de balayage
  uniform vec3 uAccent;
  uniform vec3 uBlue;
  uniform vec3 uSurface;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Déformation en barillet : l'image paraît bombée, les bords se courbent.
  vec2 barrel(vec2 uv, float k) {
    vec2 c = uv * 2.0 - 1.0;
    c *= (1.0 + k * dot(c, c)) / (1.0 + k);
    return c * 0.5 + 0.5;
  }

  // 1 à l'intérieur de l'écran (coins légèrement arrondis), 0 dehors.
  float inside(vec2 uv) {
    vec2 d = abs(uv - 0.5) - (0.5 - 0.035);
    float sd = length(max(d, 0.0)) - 0.035;
    return 1.0 - smoothstep(-uPx, uPx, sd);
  }

  void main() {
    float v = min(abs(uVel) * 0.02, 1.0);
    float k = 0.07 + v * 0.11;
    vec2 s = (vUv - 0.5) * ${PAD.toFixed(2)} + 0.5;
    vec2 uv = barrel(s, k);
    vec2 dir = uv - 0.5;

    // Image : à l'arrêt elle est nette ; en mouvement, rouge et bleu se séparent vers les bords.
    float ca = v * 0.014;
    vec3 col = vec3(
      texture2D(uTex, uv + dir * ca).r,
      texture2D(uTex, uv).g,
      texture2D(uTex, uv - dir * ca).b
    );
    col = mix(uSurface, col, uReady);

    float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
    col = mix(vec3(luma), col, mix(0.0, 0.62, uActive));
    col = (col - 0.5) * 1.1 + 0.5;
    col *= mix(0.55, 1.0, uActive);

    // Lignes de balayage fines, grain, vignettage.
    float line = smoothstep(0.0, 0.28, abs(fract(uv.y * uLines) - 0.5));
    col *= 1.0 - (0.2 + v * 0.14) * (1.0 - line);
    col += (hash(gl_FragCoord.xy + fract(uTime) * 91.7) - 0.5) * (0.05 + v * 0.1);
    col *= 1.0 - 0.5 * smoothstep(0.5, 1.05, length(dir * 2.0) * 0.72);

    // Décalage RGB sur les bords : accent à gauche, bleu à droite, plus large quand ça défile.
    float off = (2.0 + abs(uVel) * 0.16) * uPx * uActive;
    float m = inside(uv);
    float fa = inside(barrel(s + vec2(off, 0.0), k));
    float fb = inside(barrel(s - vec2(off, 0.0), k));
    vec3 fringe = (uAccent * fa * 0.55 + uBlue * fb * 0.5);
    float fringeAlpha = max(fa * 0.55, fb * 0.5) * (1.0 - m);

    float alpha = max(m, fringeAlpha) * uOpacity;
    if (alpha < 0.004) discard;
    gl_FragColor = vec4(mix(fringe / max(max(fa * 0.55, fb * 0.5), 0.001), col, m), alpha);
  }
`

function cssColor(name: string, fallback: string) {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  const hex = /^#([0-9a-f]{6})$/i.exec(raw)?.[1] ?? fallback.slice(1)
  const n = parseInt(hex, 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}

/** Capture redimensionnée par l'optimiseur d'images de Next (1200 px suffisent pour un écran 3D). */
const optimized = (src: string) => `/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`

/**
 * Carrousel : les projets sont des écrans posés sur un cylindre que le scroll fait tourner.
 * L'écran actif est de face ; les voisins arrivent et repartent en diagonale, plus petits et gris.
 */
export function ProjectCarousel() {
  const group = useRef<THREE.Group>(null)
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const anim = useRef({ rx: 0, ry: 0, vx: 0, vy: 0, active: projects.map((_, i) => (i === 0 ? 1 : 0)) })

  const { geometry, materials } = useMemo(() => {
    const accent = cssColor('--accent', '#d4ff3a')
    const surface = cssColor('--surface', '#18181b')
    const blue = new THREE.Vector3(0x5a / 255, 0xc8 / 255, 0xfa / 255)
    const geometry = new THREE.PlaneGeometry(1, 1)
    const materials = projects.map(
      () =>
        new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          transparent: true,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uTex: { value: null as THREE.Texture | null },
            uReady: { value: 0 },
            uActive: { value: 0 },
            uVel: { value: 0 },
            uTime: { value: 0 },
            uOpacity: { value: 0 },
            uPx: { value: 0.002 },
            uLines: { value: 90 },
            uSkew: { value: 0 },
            uAccent: { value: accent },
            uBlue: { value: blue },
            uSurface: { value: surface },
          },
        })
    )
    return { geometry, materials }
  }, [])

  // Textures : une par projet, libérées au démontage.
  useEffect(() => {
    let disposed = false
    const loaded: THREE.Texture[] = []
    const loader = new THREE.TextureLoader()
    projects.forEach((p, i) => {
      const apply = (t: THREE.Texture) => {
        if (disposed) return t.dispose()
        loaded.push(t)
        t.colorSpace = THREE.NoColorSpace
        t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping
        t.minFilter = THREE.LinearMipmapLinearFilter
        t.anisotropy = 4
        const u = (meshes.current[i]?.material as THREE.ShaderMaterial | undefined)?.uniforms
        if (!u) return
        u.uTex.value = t
        u.uReady.value = 1
        poke()
      }
      // Si l'optimiseur n'est pas disponible, on retombe sur le fichier d'origine.
      loader.load(optimized(p.cover.src), apply, undefined, () => loader.load(p.cover.src, apply))
    })
    return () => {
      disposed = true
      loaded.forEach((t) => t.dispose())
    }
  }, [])

  useEffect(
    () => () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    },
    [geometry, materials]
  )

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const { p, offset, onScreen } = workState()
    const intro = smooth(0.9, 1, heroT())
    g.visible = onScreen && intro > 0
    if (!g.visible) return

    const { scroll, pointer } = ui.getState()
    const dt = Math.min(delta, 0.05)
    const { wpp, vw, vh, screen } = metrics
    const a = anim.current

    // Inclinaison vers le curseur, avec ressort ; nulle tant que la mosaïque du hero n'a pas fini.
    const on = intro >= 1 ? 1 : 0
    const k = 30
    const c = 9
    a.vy += (-k * (a.ry - pointer.nx * 0.15 * on) - c * a.vy) * dt
    a.vx += (-k * (a.rx - pointer.ny * 0.1 * on) - c * a.vx) * dt
    a.ry += a.vy * dt
    a.rx += a.vx * dt

    g.position.set((screen.cx - vw / 2) * wpp, -(offset + screen.cy - vh / 2) * wpp, 0)
    g.rotation.set(a.rx, a.ry, 0)

    const w = screen.w * wpp
    const h = screen.h * wpp
    const radius = w * RADIUS
    const angle = p * (N - 1) * STEP
    const activeIndex = Math.round(p * (N - 1))
    const vel = scroll.velocity
    const time = state.clock.elapsedTime

    for (let i = 0; i < N; i++) {
      const mesh = meshes.current[i]
      if (!mesh) continue
      let rel = i * STEP - angle
      rel = ((((rel + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
      const cos = Math.cos(rel)
      const sin = Math.sin(rel)
      const opacity = cos > 0 ? 0.2 + 0.8 * cos : 0
      mesh.visible = cos > -0.05 && opacity > 0
      if (!mesh.visible) continue

      // Le précédent descend vers le coin bas-gauche, le suivant arrive du coin haut-droit.
      mesh.position.set(sin * radius, sin * DIAGONAL * w, cos * radius - radius)
      mesh.rotation.y = rel
      mesh.scale.set(w * PAD, h * PAD, 1)
      mesh.renderOrder = cos

      a.active[i] += ((i === activeIndex ? 1 : 0) - a.active[i]) * Math.min(1, dt * 10)
      const u = (mesh.material as THREE.ShaderMaterial).uniforms
      u.uActive.value = a.active[i]
      u.uOpacity.value = opacity * intro
      u.uVel.value = vel
      u.uTime.value = time
      u.uPx.value = 1 / screen.w
      u.uLines.value = screen.h / 4
      u.uSkew.value = Math.max(-60, Math.min(60, vel)) * 0.0012
    }
  })

  return (
    <group ref={group} visible={false}>
      {projects.map((p, i) => (
        <mesh
          key={p.id}
          ref={(el) => {
            meshes.current[i] = el
          }}
          geometry={geometry}
          material={materials[i]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
