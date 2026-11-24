'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as THREE from 'three'
import { categoryLabels, projects } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { reducedMotionQuery } from '@/lib/motion'
import { EYE_VH, DISS_VH } from '@/components/intro/timing'
import { scrollToTarget, setScrollGuard } from '@/components/shell/ScrollEngine'
import { app } from '@/components/sphere/state'
import './gallery.css'

/* Galerie courbe de projets : bande de cartes en « sourire », titre qui se brouille, verre épais sur les bords.
   Les cartes sont rendues dans une cible transparente, puis un passage plein écran applique la réfraction, la dispersion RGB
   et les lumières de bord. Le nuage de particules reste visible derrière (il n'est pas réfracté : autre canvas). */

const N = projects.length
const REPEAT = 3 // la bande se répète : N projets × 3 exemplaires, bouclés à l'infini
const M = N * REPEAT
const PITCH = 0.1786
const CARD_W = 0.174
const SPAN = M * PITCH

// Codes courts des projets (titre géant et étiquettes), dans l'esprit des codes de 7 caractères du brief.
const CODES: Record<string, { code: string; fx: number }> = {
  'mixer-hmi': { code: 'MLX HMI', fx: 0.12 },
  animarah: { code: 'ANM RAH', fx: 0.18 },
  evastre: { code: 'EVA STR', fx: 0.4 },
  notchpack: { code: 'NTC HPK', fx: 0.1 },
}
const code = (i: number) => CODES[projects[i].id]?.code ?? projects[i].short.slice(0, 7).toUpperCase()

const PALETTE = [
  { name: 'NOIR', c: [0.16, 0.15, 0.34] },
  { name: 'ROUGE', c: [0.36, 0.1, 0.16] },
  { name: 'VERT', c: [0.1, 0.3, 0.2] },
  { name: 'JAUNE', c: [0.3, 0.26, 0.08] },
  { name: 'BLEU', c: [0.08, 0.16, 0.4] },
]

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const rchars = (n: number) => Array.from({ length: n }, () => CHARS[(Math.random() * CHARS.length) | 0]).join('')
const scramble = () => `${rchars(2 + ((Math.random() * 2) | 0))} ${rchars(3 + ((Math.random() * 2) | 0))}`

const vert = /* glsl */ `
uniform vec2 uRes;
uniform float uX;
uniform float uS;
uniform float uGrid;
uniform vec4 uGR;
uniform float uMobile;
uniform float uCardW;
varying vec2 vUv;
void main() {
  vUv = uv;
  float u = uv.x;
  float v = 1.0 - uv.y;
  float W = uRes.x;
  float H = uRes.y;
  float k = uMobile > 0.5 ? 1.6 : 1.0;
  float topBase = uMobile > 0.5 ? 0.26 : 0.217;
  float botBase = uMobile > 0.5 ? 0.60 : 0.659;
  float cx = W * 0.5 + uX * W;
  float px = cx + (u - 0.5) * uCardW;
  float dxn = (px - W * 0.5) / W;
  float topY = H * (topBase - 0.03 * smoothstep(0.30, 0.45, abs(dxn) * k));
  float botY = H * (botBase - 0.135 * smoothstep(0.12, 0.39, abs(uX) * k));
  float topC = H * (topBase - 0.03 * smoothstep(0.30, 0.45, abs(uX) * k));
  float cy = (topC + botY) * 0.5;
  vec2 p = vec2(px, mix(topY, botY, v));
  p = (p - vec2(cx, cy)) * uS + vec2(cx, cy);
  vec2 g = vec2(uGR.x + u * uGR.z, uGR.y + v * uGR.w);
  p = mix(p, g, uGrid);
  gl_Position = vec4(p.x / W * 2.0 - 1.0, 1.0 - p.y / H * 2.0, 0.0, 1.0);
}`

const frag = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uHasTex;
uniform float uRev;
uniform float uSeed;
uniform vec2 uSize;
uniform float uHover;
uniform float uImgAsp;
uniform float uFx;
uniform float uAlpha;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
vec2 cover(vec2 uv) {
  float cardAsp = uSize.x / uSize.y;
  vec2 s = uv;
  if (cardAsp < uImgAsp) {
    float w = cardAsp / uImgAsp;
    s.x = uFx * (1.0 - w) + uv.x * w;
  } else {
    float h = uImgAsp / cardAsp;
    s.y = (1.0 - h) * 0.5 + uv.y * h;
  }
  return s;
}
void main() {
  // SDF d'un rectangle arrondi, en pixels réels (rayon : 4,8 % de la largeur)
  vec2 pp = (vUv - 0.5) * uSize;
  float r = 0.048 * uSize.x;
  vec2 q = abs(pp) - (uSize * 0.5 - r);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  float a = 1.0 - smoothstep(-0.8, 0.8, d);

  vec3 col = vec3(0.05);
  if (uHasTex > 0.5) col = texture2D(uTex, cover(vUv)).rgb;

  // Révélation par blocs : grille 5 × 7
  float v = 1.0 - vUv.y;
  vec2 cell = floor(vec2(vUv.x * 5.0, v * 7.0));
  float rr = hash(cell + uSeed) * 0.92 + 0.04;
  if (rr > uRev) {
    col = vec3(0.043, 0.043, 0.058);
  } else if (uRev < 0.999 && rr > uRev - 0.12 && uHasTex > 0.5) {
    vec2 cc = (cell + 0.5) / vec2(5.0, 7.0);
    vec3 px = texture2D(uTex, cover(vec2(cc.x, 1.0 - cc.y))).rgb;
    col = mix(col, px * 0.8, 0.85);
  }
  col *= 1.0 + 0.08 * uHover;
  float al = a * uAlpha;
  gl_FragColor = vec4(col * al, al);
}`

const postVert = /* glsl */ `
void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`

const postFrag = /* glsl */ `
precision highp float;
uniform sampler2D uScene;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uCarrier;

float sdf(vec2 px) {
  float m = min(uRes.x, uRes.y);
  float rad = 0.22 * m;
  vec2 q = abs(px - uRes * 0.5) - (uRes * 0.5 - rad);
  float s = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - rad;
  return -s;
}
vec4 tex(vec2 px) { return texture2D(uScene, clamp(px, vec2(0.5), uRes - 0.5) / uRes); }

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes;
  float m = min(uRes.x, uRes.y);
  float rim = 0.17 * m * (1.0 + 0.3 * smoothstep(0.25, 0.0, uv.y));
  float d = sdf(px);
  float t = clamp(1.0 - d / rim, 0.0, 1.0);

  // Normale sortante (différences finies du SDF)
  vec2 g = vec2(sdf(px + vec2(1.0, 0.0)) - sdf(px - vec2(1.0, 0.0)), sdf(px + vec2(0.0, 1.0)) - sdf(px - vec2(0.0, 1.0)));
  vec2 n = -normalize(g + 1e-6);
  vec2 tang = vec2(-n.y, n.x);
  vec2 off = n * t * t * rim * 0.46;
  float spread = t * t * t * 0.003 * m;

  // Réfraction + dispersion : 5 prises le long de la tangente, rouge ×1,06, vert ×1,00, bleu ×0,94
  vec4 cr = vec4(0.0), cg = vec4(0.0), cb = vec4(0.0);
  for (int i = -2; i <= 2; i++) {
    vec2 j = tang * float(i) * spread * 0.5;
    cr += tex(px - off * 1.06 + j);
    cg += tex(px - off * 1.00 + j);
    cb += tex(px - off * 0.94 + j);
  }
  cr /= 5.0; cg /= 5.0; cb /= 5.0;
  vec3 col = vec3(cr.r, cg.g, cb.b);
  float alpha = cg.a;

  // Lumières de bord : trois taches R, V, B qui dérivent autour de l'écran
  float ang = atan((px.y - uRes.y * 0.5) / uRes.y, (px.x - uRes.x * 0.5) / uRes.x);
  float T = uTime;
  float lr = 0.5 + 0.5 * (0.62 * sin(2.0 * ang + 0.55 * T) + 0.38 * sin(3.0 * ang - 0.41 * T + 1.7));
  float lg = 0.5 + 0.5 * (0.62 * sin(2.0 * ang - 0.47 * T + 2.3) + 0.38 * sin(ang - 0.33 * T + 4.1));
  float lb = 0.5 + 0.5 * (0.62 * sin(ang + 0.38 * T + 4.6) + 0.38 * sin(3.0 * ang + 0.52 * T + 0.9));
  float R = smoothstep(0.32, 0.9, lr);
  float G = smoothstep(0.32, 0.9, lg);
  float B = smoothstep(0.32, 0.9, lb);
  G *= 1.0 - 0.65 * R;
  float xEdge = min(px.x, uRes.x - px.x);
  float k = clamp(min(min(xEdge / (0.12 * uRes.x), px.y / (0.19 * uRes.y)), (uRes.y - px.y) / (0.09 * uRes.y)), 0.0, 1.0);
  float mask = pow(1.0 - k, 1.7);
  vec3 light = vec3(R, G, B) + uCarrier;
  light = mix(light, vec3(dot(light, vec3(0.299, 0.587, 0.114))), 0.12);
  col += light * mask * 0.34;

  // Sortie prémultipliée : la lumière s'ajoute au nuage derrière le canvas.
  gl_FragColor = vec4(col, alpha);
}`

const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}
const wrap = (v: number) => ((((v + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2

type Card = {
  i: number
  proj: number
  mesh: THREE.Mesh
  mat: THREE.ShaderMaterial
  label: HTMLElement
  x: number
  s: number
  inView: boolean
  revStart: number
  rev: number
  seed: number
}

export default function Gallery() {
  const pathname = usePathname()
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  const routerRef = useRef(router)
  const pathRef = useRef(pathname)
  useEffect(() => {
    routerRef.current = router
    pathRef.current = pathname
    root.current?.setAttribute('data-active', String(pathname === '/'))
  }, [router, pathname])

  useEffect(() => {
    const el = root.current!
    const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!
    const canvas = q<HTMLCanvasElement>('canvas')
    const zone = q<HTMLDivElement>('.vk-zone')
    const title = q<HTMLElement>('.vk-title')
    const tick = q<HTMLElement>('.vk-tick')
    const rule = q<HTMLElement>('.vk-rule')
    const cross = q<HTMLButtonElement>('.vk-cross')
    const plus = q<HTMLElement>('.vk-plus')
    const toast = q<HTMLElement>('.vk-toast')
    const labels = Array.from(el.querySelectorAll<HTMLElement>('.vk-label'))
    const overlay = q<HTMLElement>('.vk-detail')
    const dImg = q<HTMLImageElement>('.vk-d-img')
    const dBlocks = Array.from(el.querySelectorAll<HTMLElement>('.vk-d-block'))
    const dNum = q<HTMLElement>('.vk-d-num')
    const dName = q<HTMLElement>('.vk-d-name')
    const dDesc = q<HTMLElement>('.vk-d-desc')
    const dStack = q<HTMLElement>('.vk-d-stack')
    const dGo = q<HTMLButtonElement>('.vk-d-go')
    const dClose = q<HTMLButtonElement>('.vk-d-close')
    const sfxBtn = q<HTMLButtonElement>('.vk-sfx')
    const gridBtn = q<HTMLButtonElement>('.vk-grid')
    const palItems = Array.from(el.querySelectorAll<HTMLElement>('.vk-pal li'))

    const reduced = window.matchMedia(reducedMotionQuery).matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' })
    } catch (e) {
      console.warn('WebGL indisponible : galerie désactivée.', e)
      return
    }
    renderer.setClearColor(0x000000, 0)
    const dprOf = () => Math.min(window.devicePixelRatio || 1, 2)
    const scene = new THREE.Scene()
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const rt = new THREE.WebGLRenderTarget(2, 2, { type: THREE.UnsignedByteType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false })

    const V = { W: 1, H: 1, mobile: false }

    /* ------------------------------------------------------------ cartes */
    const geo = new THREE.PlaneGeometry(1, 1, 48, 1)
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    const textures: (THREE.Texture | null)[] = Array(N).fill(null)
    const aspects = projects.map((p) => (p.video?.width ?? p.cover.width) / (p.video?.height ?? p.cover.height))
    const cards: Card[] = Array.from({ length: M }, (_, i) => {
      const proj = i % N
      const mat = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uRes: { value: new THREE.Vector2(1, 1) },
          uX: { value: 0 },
          uS: { value: 1 },
          uGrid: { value: 0 },
          uGR: { value: new THREE.Vector4() },
          uMobile: { value: 0 },
          uCardW: { value: 100 },
          uTex: { value: null },
          uHasTex: { value: 0 },
          uRev: { value: 0 },
          uSeed: { value: Math.random() * 100 },
          uSize: { value: new THREE.Vector2(100, 150) },
          uHover: { value: 0 },
          uImgAsp: { value: aspects[proj] },
          uFx: { value: CODES[projects[proj].id]?.fx ?? 0.5 },
          uAlpha: { value: 1 },
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
        blending: THREE.CustomBlending,
        blendSrc: THREE.OneFactor,
        blendDst: THREE.OneMinusSrcAlphaFactor,
        blendSrcAlpha: THREE.OneFactor,
        blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.frustumCulled = false
      scene.add(mesh)
      return { i, proj, mesh, mat, label: labels[i], x: 0, s: 1, inView: false, revStart: -1, rev: 0, seed: Math.random() * 100 }
    })
    projects.forEach((p, k) => {
      loader.load(p.video?.poster ?? p.cover.src, (t) => {
        t.minFilter = THREE.LinearFilter
        t.generateMipmaps = false
        textures[k] = t
        for (const c of cards) if (c.proj === k) {
          c.mat.uniforms.uTex.value = t
          c.mat.uniforms.uHasTex.value = 1
        }
      })
    })

    const postMat = new THREE.ShaderMaterial({
      vertexShader: postVert,
      fragmentShader: postFrag,
      uniforms: { uScene: { value: rt.texture }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uCarrier: { value: new THREE.Vector3(...(PALETTE[0].c as [number, number, number])) } },
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    })
    const postScene = new THREE.Scene()
    const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat)
    postQuad.frustumCulled = false
    postScene.add(postQuad)

    const resize = () => {
      V.W = window.innerWidth
      V.H = window.innerHeight
      V.mobile = V.W < 760
      const dpr = dprOf()
      renderer.setPixelRatio(dpr)
      renderer.setSize(V.W, V.H, false)
      rt.setSize(Math.round(V.W * dpr), Math.round(V.H * dpr))
      postMat.uniforms.uRes.value.set(Math.round(V.W * dpr), Math.round(V.H * dpr))
      for (const c of cards) {
        c.mat.uniforms.uRes.value.set(V.W, V.H)
        c.mat.uniforms.uMobile.value = V.mobile ? 1 : 0
      }
    }

    /* ------------------------------------------------------------ géométrie (miroir CPU du shader) */
    const k = () => (V.mobile ? 1.6 : 1)
    const topBase = () => (V.mobile ? 0.26 : 0.217)
    const botBase = () => (V.mobile ? 0.6 : 0.659)
    const topAt = (pxn: number) => V.H * (topBase() - 0.03 * smoothstep(0.3, 0.45, Math.abs(pxn) * k())) // pxn : décalage au centre en largeurs d'écran
    const botAt = (x: number) => V.H * (botBase() - 0.135 * smoothstep(0.12, 0.39, Math.abs(x) * k()))
    /** Point de la carte (u de 0 à 1, v de 0 en haut à 1 en bas), en pixels CSS. */
    const cardPt = (c: Card, u: number, v: number, grid: number) => {
      const W = V.W
      const cx = W / 2 + c.x * W
      const cardW = CARD_W * W
      const px = cx + (u - 0.5) * cardW
      const topY = topAt((px - W / 2) / W)
      const botY = botAt(c.x)
      const topC = topAt(c.x)
      const cy = (topC + botY) / 2
      let x = px
      let y = topY + (botY - topY) * v
      x = cx + (x - cx) * c.s
      y = cy + (y - cy) * c.s
      if (grid > 0) {
        const r = gridRect(c.proj)
        x = x + (r.x + u * r.w - x) * grid
        y = y + (r.y + v * r.h - y) * grid
      }
      return { x, y }
    }
    const gridRect = (p: number) => {
      const w = Math.min(V.W * 0.2, V.H * 0.3 * 0.68 * 1.5)
      const h = w / 0.68
      const gap = V.W * 0.006
      const cols = V.mobile ? 2 : N
      const rows = Math.ceil(N / cols)
      const col = p % cols
      const row = Math.floor(p / cols)
      const totalW = cols * w + (cols - 1) * gap
      const totalH = rows * h + (rows - 1) * gap
      return { x: (V.W - totalW) / 2 + col * (w + gap), y: V.H * 0.46 - totalH / 2 + row * (h + gap), w, h }
    }

    /* ------------------------------------------------------------ état */
    let pos = 0
    let target = 0
    const view = { grid: 0, gridTarget: 0 }
    let centre = -1
    let hover = -1
    let time = 0
    let t0 = -1
    let live = false
    let lastScramble = 0
    let frameN = 0
    let initDone = false
    let dragging = false
    let dragStart = { x: 0, pos: 0, moved: 0 }
    const mouse = { x: -1, y: -1, over: false }
    let crossAngle = 0
    let sfx = false
    let audio: AudioContext | null = null
    let alive = true

    const blip = (f: number) => {
      if (!sfx) return
      try {
        audio ??= new AudioContext()
        const o = audio.createOscillator()
        const g = audio.createGain()
        o.type = 'square'
        o.frequency.value = f
        g.gain.setValueAtTime(0.025, audio.currentTime)
        g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.08)
        o.connect(g).connect(audio.destination)
        o.start()
        o.stop(audio.currentTime + 0.09)
      } catch {}
    }
    let toastTimer = 0
    const showToast = (msg: string) => {
      toast.textContent = msg
      toast.classList.add('on')
      window.clearTimeout(toastTimer)
      toastTimer = window.setTimeout(() => toast.classList.remove('on'), 1800)
    }

    /* ------------------------------------------------------------ détail d'un projet */
    let openIdx = -1
    const openDetail = (proj: number) => {
      openIdx = proj
      const p = projects[proj]
      dImg.src = p.video?.poster ?? p.cover.src
      dImg.alt = p.cover.alt
      dNum.textContent = `PROJET ${String(proj + 1).padStart(2, '0')} · ${categoryLabels[p.category].toUpperCase()} · ${p.year}`
      dName.textContent = code(proj)
      dDesc.textContent = p.description
      dStack.textContent = p.stack.join(' · ')
      dBlocks.forEach((b) => {
        b.style.opacity = '1'
        b.style.transition = 'none'
      })
      overlay.classList.add('open')
      overlay.setAttribute('aria-hidden', 'false')
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          dBlocks.forEach((b) => {
            b.style.transition = `opacity 120ms linear ${300 + Math.random() * 700}ms`
            b.style.opacity = '0'
          })
        )
      )
      blip(440)
      dClose.focus({ preventScroll: true })
    }
    const closeDetail = () => {
      if (openIdx < 0) return
      openIdx = -1
      overlay.classList.remove('open')
      overlay.setAttribute('aria-hidden', 'true')
    }
    dClose.onclick = closeDetail
    dGo.onclick = () => {
      if (openIdx < 0) return
      const id = projects[openIdx].id
      closeDetail()
      routerRef.current.push(`/projets/${id}`)
    }

    /* ------------------------------------------------------------ entrées */
    const pickCard = (mx: number, my: number) => {
      let best = -1
      let bestAbs = 9
      for (const c of cards) {
        if (Math.abs(c.x) > 0.62) continue
        if (view.grid > 0.5 && c.i >= N) continue
        // Test dans le quadrilatère courbe : on retrouve (u, v) approché par balayage vertical
        const tl = cardPt(c, 0, 0, view.grid)
        const tr = cardPt(c, 1, 0, view.grid)
        const bl = cardPt(c, 0, 1, view.grid)
        const left = Math.min(tl.x, bl.x)
        const right = Math.max(tr.x, cardPt(c, 1, 1, view.grid).x)
        if (mx < left || mx > right) continue
        const u = (mx - tl.x) / Math.max(1, tr.x - tl.x)
        const top = cardPt(c, clamp01(u), 0, view.grid).y
        const bot = cardPt(c, clamp01(u), 1, view.grid).y
        if (my >= top && my <= bot && Math.abs(c.x) < bestAbs) {
          best = c.i
          bestAbs = Math.abs(c.x)
        }
      }
      return best
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (openIdx >= 0 || view.grid > 0.5) return
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      target += d * 0.00042 * (V.mobile ? 2 : 1)
    }
    const onDown = (e: PointerEvent) => {
      if (openIdx >= 0) return
      zone.setPointerCapture?.(e.pointerId)
      dragging = true
      dragStart = { x: e.clientX, pos: target, moved: 0 }
    }
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.over = true
      if (!dragging) return
      const dx = e.clientX - dragStart.x
      dragStart.moved = Math.max(dragStart.moved, Math.abs(dx))
      if (view.grid < 0.5) target = dragStart.pos - (dx / V.W) * 1.1
    }
    const onUp = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (dragStart.moved < 6) {
        const hit = pickCard(e.clientX, e.clientY)
        if (hit >= 0) openDetail(cards[hit].proj)
      }
    }
    const onLeave = () => {
      mouse.over = false
    }
    const onKey = (e: KeyboardEvent) => {
      if (pathRef.current !== '/') return
      if (e.key === 'Escape') closeDetail()
      else if (openIdx < 0 && live && view.grid < 0.5) {
        if (e.key === 'ArrowRight') target = Math.round(target / PITCH + 1) * PITCH
        else if (e.key === 'ArrowLeft') target = Math.round(target / PITCH - 1) * PITCH
      }
    }
    zone.addEventListener('wheel', onWheel, { passive: false })
    zone.addEventListener('pointerdown', onDown)
    zone.addEventListener('pointermove', onMove)
    zone.addEventListener('pointerup', onUp)
    zone.addEventListener('pointercancel', onUp)
    zone.addEventListener('pointerleave', onLeave)
    window.addEventListener('keydown', onKey)
    const track = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('pointermove', track, { passive: true })

    cross.onclick = () => {
      if (openIdx >= 0 || view.grid > 0.5) return
      target = Math.round(target / PITCH + 3 + Math.floor(Math.random() * 4)) * PITCH
      blip(220)
    }
    gridBtn.onclick = () => {
      if (openIdx >= 0) return
      view.gridTarget = view.gridTarget ? 0 : 1
      gridBtn.setAttribute('aria-pressed', String(!!view.gridTarget))
      for (const c of cards) {
        c.revStart = performance.now()
        c.rev = 0
      }
    }
    sfxBtn.onclick = () => {
      sfx = !sfx
      sfxBtn.setAttribute('aria-pressed', String(sfx))
      sfxBtn.classList.toggle('on', sfx)
      blip(660)
    }
    el.querySelectorAll<HTMLElement>('[data-toast]').forEach((b) => (b.onclick = () => showToast(b.dataset.toast!)))
    el.querySelector<HTMLElement>('.vk-intro')!.onclick = (e) => {
      e.preventDefault()
      scrollToTarget(0)
    }
    palItems.forEach((li, idx) => {
      li.onclick = () => {
        palItems.forEach((o, j) => {
          o.classList.toggle('on', j === idx)
          o.textContent = (j === idx ? '▪ ' : '') + PALETTE[j].name
        })
        palette = idx
      }
    })
    let palette = 0
    const carrier = new THREE.Vector3(...(PALETTE[0].c as [number, number, number]))
    const carrierTo = new THREE.Vector3()

    const pin = () => (reduced ? 0.9 : EYE_VH - 0.05) * window.innerHeight
    const showAt = () => (reduced ? 0.5 : EYE_VH - DISS_VH - 0.05) * window.innerHeight
    // La molette ne remonte vers l'œil que hors de la bande des cartes (en haut ou en bas de l'écran).
    setScrollGuard((dy) => {
      if (ui.getState().scroll.y < pin()) return true
      if (pathRef.current !== '/' || openIdx >= 0) return false
      const inBand = mouse.y > V.H * 0.1 && mouse.y < V.H * 0.72
      return dy < 0 && !inBand
    })

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(document.documentElement)

    /* ------------------------------------------------------------ boucle */
    const stop = addFrame((now, deltaMs) => {
      const hidden = document.hidden || pathRef.current !== '/'
      const y = ui.getState().scroll.y
      const show = !hidden && y >= showAt()
      el.classList.toggle('live', !hidden && y >= pin())
      if (!show) return
      if (!live && y >= pin()) {
        live = true
        app.introDone = true
      }
      const dt = Math.min(deltaMs / 1000, 0.1)
      if (t0 < 0) t0 = now
      time = (now - t0) / 1000
      frameN++

      // Inertie : pos suit target
      pos += (target - pos) * (1 - Math.pow(1 - 0.12, dt * 30))
      const speed = Math.abs(target - pos)
      view.grid += (view.gridTarget - view.grid) * (1 - Math.pow(0.88, dt * 60))
      if (Math.abs(view.gridTarget - view.grid) < 0.0005) view.grid = view.gridTarget

      // Hover
      const hit = mouse.over && openIdx < 0 && live ? pickCard(mouse.x, mouse.y) : -1
      hover = hit
      zone.style.cursor = hit >= 0 ? 'pointer' : dragging ? 'grabbing' : 'default'

      // Cartes
      let best = 9
      let bestI = -1
      const cardW = CARD_W * V.W
      for (const c of cards) {
        c.x = wrap(c.i * PITCH - pos)
        if (Math.abs(c.x) < best) {
          best = Math.abs(c.x)
          bestI = c.i
        }
        const inView = Math.abs(c.x) < 0.62
        if (!initDone) c.inView = inView
        else if (inView && !c.inView) c.revStart = now + Math.random() * 120 // chaque entrée dans le champ rejoue la révélation
        c.inView = inView
        // Révélation sur 750 ms ; à l'arrivée, échelonnée selon la distance au centre.
        let rev: number
        if (c.revStart < 0) rev = clamp01((time - 0.2 - Math.abs(c.x) * 0.8) / 0.9)
        else rev = now >= c.revStart ? clamp01((now - c.revStart) / 750) : 0
        if (reduced) rev = 1
        c.rev = rev
        const targetS = c.i === hit ? 1.015 : 1
        c.s += (targetS - c.s) * 0.2
        const u = c.mat.uniforms
        u.uX.value = c.x
        u.uS.value = c.s
        u.uCardW.value = cardW
        u.uGrid.value = view.grid
        u.uRev.value = rev
        u.uHover.value += ((c.i === hit ? 1 : 0) - u.uHover.value) * 0.2
        u.uAlpha.value = c.i >= N ? 1 - view.grid : 1
        const r = gridRect(c.proj)
        u.uGR.value.set(r.x, r.y, r.w, r.h)
        const botY = botAt(c.x)
        const topC = topAt(c.x)
        const w = cardW + (r.w - cardW) * view.grid
        const h = (botY - topC) + (r.h - (botY - topC)) * view.grid
        u.uSize.value.set(w * c.s, h * c.s)
        c.mesh.visible = inView || view.grid > 0
        // Étiquette : coin haut-gauche, inclinée selon le bord supérieur
        if (inView && (c.i < N || view.grid < 0.99)) {
          const p0 = cardPt(c, 0, 0, view.grid)
          const p1 = cardPt(c, 1, 0, view.grid)
          const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x)
          c.label.style.opacity = c.i >= N ? String(1 - view.grid) : '1'
          c.label.style.transform = `translate(${(p0.x + 2).toFixed(1)}px, ${(p0.y - V.H * 0.006).toFixed(1)}px) rotate(${ang.toFixed(4)}rad) translateY(-100%)`
        } else c.label.style.opacity = '0'
      }

      initDone = true

      // Carte centrale : repère sur la règle, bip
      if (bestI >= 0 && bestI % N !== centre) {
        centre = bestI % N
        tick.style.left = `${(centre / (N - 1)) * 100}%`
        if (live) blip(1400)
      }

      // Titre : codes aléatoires pendant le mouvement, puis le code du projet central
      if (speed > 0.004) {
        if (frameN - lastScramble >= 3) {
          lastScramble = frameN
          title.textContent = scramble()
        }
      } else if (centre >= 0) title.textContent = code(centre)
      const fade = String(1 - view.grid)
      if (title.style.opacity !== fade) {
        title.style.opacity = fade
        rule.style.opacity = fade
        cross.style.opacity = fade
        cross.style.pointerEvents = view.grid > 0.5 ? 'none' : ''
      }

      // Croix : la rotation s'accélère avec la vitesse du défilement
      crossAngle += (0.5 + speed * 90) * dt * 60
      plus.style.transform = `rotateX(-14deg) rotateY(${crossAngle.toFixed(1)}deg)`

      // Palette : lumière porteuse
      carrierTo.set(PALETTE[palette].c[0], PALETTE[palette].c[1], PALETTE[palette].c[2])
      carrier.lerp(carrierTo, 0.05)
      postMat.uniforms.uCarrier.value.copy(carrier)
      postMat.uniforms.uTime.value = time

      // Rendu : cartes dans la cible, puis passage verre sur l'écran
      renderer.setRenderTarget(rt)
      renderer.setClearColor(0x000000, 0)
      renderer.clear()
      renderer.render(scene, cam)
      renderer.setRenderTarget(null)
      renderer.clear()
      renderer.render(postScene, cam)
    }, 25)

    return () => {
      alive = false
      stop()
      ro.disconnect()
      setScrollGuard(null)
      window.clearTimeout(toastTimer)
      zone.removeEventListener('wheel', onWheel)
      zone.removeEventListener('pointerdown', onDown)
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerup', onUp)
      zone.removeEventListener('pointercancel', onUp)
      zone.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', track)
      textures.forEach((t) => t?.dispose())
      cards.forEach((c) => c.mat.dispose())
      geo.dispose()
      postMat.dispose()
      rt.dispose()
      renderer.dispose()
      void alive
    }
  }, [])

  return (
    <div ref={root} className="vk" data-active={pathname === '/'}>
      <canvas aria-hidden />
      <div className="vk-zone" data-lenis-prevent />

      <nav className="vk-nav" aria-label="Navigation de la galerie">
        <a className="vk-link vk-intro" href="/#top" style={{ left: '31.1%', top: '1.7%' }}>
          INTRO ↑
        </a>
        <button type="button" className="vk-link vk-grid" aria-pressed="false" style={{ left: '37.5%', top: '4.5%' }}>
          LISTE/GRILLE
        </button>
        <a className="vk-logo" href="/#top" aria-label={`${site.name} — retour à l’introduction`} onClick={(e) => { e.preventDefault(); scrollToTarget(0) }}>
          <svg viewBox="0 0 40 46" fill="none" stroke="#e7e4ee" strokeWidth="1.6" aria-hidden>
            <path d="M20 2v26M12 10h16" />
            <circle cx="20" cy="22" r="7" />
            <circle cx="20" cy="22" r="2.4" fill="#e7e4ee" />
            <path d="M8 22h5M27 22h5M16 34l-4 9M24 34l4 9" />
          </svg>
          <span>MP</span>
        </a>
        <Link className="vk-link" href="/a-propos" style={{ left: '61.6%', top: '4.5%' }}>
          À PROPOS
        </Link>
        <a className="vk-link" href={`mailto:${site.email}`} style={{ left: '66.4%', top: '1.7%' }}>
          ME CONTACTER
        </a>
      </nav>

      {Array.from({ length: M }, (_, i) => (
        <div key={i} className="vk-label" aria-hidden>
          {code(i % N)}
        </div>
      ))}

      <h2 className="vk-title" aria-live="off">
        {code(0)}
      </h2>
      <div className="vk-rule" aria-hidden>
        <i className="vk-tick" />
      </div>
      <button type="button" className="vk-cross" aria-label="Avancer de quelques projets">
        <span className="vk-persp">
          <span className="vk-plus">
            {Array.from({ length: 7 }, (_, l) => (
              <svg key={l} viewBox="0 0 100 56" style={{ transform: `translateZ(${(l - 3) * 3}px)` }} aria-hidden>
                <path d="M38 4h24v16h16v16H62v16H38V36H22V20h16z" fill={l === 6 ? '#22222c' : '#0c0c11'} stroke={l === 6 ? 'rgba(231,228,238,.35)' : 'none'} strokeWidth="0.8" />
              </svg>
            ))}
          </span>
        </span>
      </button>

      <footer className="vk-foot">
        <button type="button" className="vk-sfx" aria-pressed="false" style={{ left: '1.1%' }}>
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
            <path d="M1 3.5h2L6 1v8L3 6.5H1z" />
            <path className="wave" d="M8 3.2c.8.9.8 2.7 0 3.6M9.6 2c1.5 1.7 1.5 4.3 0 6" />
          </svg>
          SFX
        </button>
        <a className="vk-link" href={site.github} target="_blank" rel="noreferrer" style={{ left: '29.1%' }}>
          GITHUB ↗
        </a>
        <span style={{ left: '50%', transform: 'translateX(-50%)' }}>MAXIME PERO</span>
        <span style={{ left: '68.8%' }}>©2026</span>
        <ul className="vk-pal" aria-label="Couleur des lumières de bord">
          {PALETTE.map((p, i) => (
            <li key={p.name} className={i === 0 ? 'on' : ''} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLElement).click()}>
              {(i === 0 ? '▪ ' : '') + p.name}
            </li>
          ))}
        </ul>
      </footer>

      <div className="vk-toast" role="status" aria-live="polite" />

      <div className="vk-detail" role="dialog" aria-modal="true" aria-label="Détail du projet" aria-hidden="true">
        <button type="button" className="vk-d-close">
          FERMER
        </button>
        <div className="vk-d-media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="vk-d-img" alt="" />
          <div className="vk-d-grid" aria-hidden>
            {Array.from({ length: 35 }, (_, i) => (
              <i key={i} className="vk-d-block" />
            ))}
          </div>
        </div>
        <div className="vk-d-text">
          <p className="vk-d-num" />
          <h3 className="vk-d-name" />
          <p className="vk-d-desc" />
          <p className="vk-d-stack" />
          <button type="button" className="vk-d-go">
            VOIR LE PROJET →
          </button>
        </div>
      </div>
    </div>
  )
}
