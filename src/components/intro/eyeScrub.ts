/**
 * Œil de robot en caractères monospace, dessiné sur un canvas 2D et piloté par le temps `t` qu'on lui donne
 * (le défilement, ici) : `draw(t, td)` redessine l'image exacte de cet instant, dans les deux sens.
 * Chronologie (secondes) : fondu 0–0,5 · ouverture 0,5–1,5 · regard 1,5–3,5 (clignement à 2,4)
 * · zoom 3,5–4,8 · iris → étoile 4,215–5,415 · étincelles 4,935–6,235 · puis dissolution en pixels (`td`, 0 → 2,2).
 * La dissolution est une fonction pure de `td` (aucune simulation) : elle se rejoue donc à l'envers sans écart.
 */

export const EYE_END = 6.235 // fin des étincelles ; début de la dissolution
export const EYE_OPEN_T = 1.5 // œil ouvert, avant le regard : position de repos
export const DISSOLVE_END = 2.2 // durée totale de la dissolution, chute des pixels comprise

export type EyeHandle = {
  draw: (t: number, td: number) => void
  resize: () => void
  destroy: () => void
}

const CELL_W = 8
const CELL_H = 12
const RAMP =
  " .`-':,_^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
const NCH = RAMP.length - 1 // 91

const T_OPEN = 0.5
const D_OPEN = 1
const T_LOOK = 1.5
const D_LOOK = 2
const T_ZOOM = 3.5
const D_ZOOM = 1.3
const T_MORPH = T_ZOOM + D_ZOOM * 0.55
const D_MORPH = 1.2
const T_SPARK = T_MORPH + D_MORPH * 0.6
const D_SPARK = 1.3
const T_DIS = T_SPARK + D_SPARK // 6,235
const D_DIS = 1.3
const BLOCK = 12
const BLINK_AT = T_LOOK + D_LOOK * 0.45
const BLINK_DUR = 0.24

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const ease = (x: number) => {
  x = clamp01(x)
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

type RGB = [number, number, number]
const hex = (h: string): RGB => {
  const s = h.replace('#', '')
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]
}
const mix = (a: RGB, b: RGB, k: number): RGB => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
const css = (c: RGB) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
const ramp = (stops: RGB[], n = 16): RGB[] =>
  Array.from({ length: n }, (_, i) => {
    const x = (i / (n - 1)) * (stops.length - 1)
    const k = Math.min(stops.length - 2, Math.floor(x))
    return mix(stops[k], stops[k + 1], x - k)
  })

function hash(i: number, k: number) {
  let x = (Math.imul(i, 374761393) + Math.imul(k, 668265263)) | 0
  x = Math.imul(x ^ (x >>> 13), 1274126177)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967295
}

// Bruit de valeur périodique selon l'angle (fibres de l'iris).
function makeNoise(n: number) {
  const v = Float32Array.from({ length: n }, () => Math.random())
  return (a: number) => {
    const x = (a / (Math.PI * 2) + 0.5) * n
    const i = Math.floor(x)
    const f = x - i
    const s = f * f * (3 - 2 * f)
    return lerp(v[((i % n) + n) % n], v[(((i + 1) % n) + n) % n], s)
  }
}

const GAZE: [number, number, number][] = [
  [0, 0, 0],
  [0.12, 0, 0],
  [0.24, -0.42, 0.02],
  [0.4, -0.42, 0.02],
  [0.5, 0.38, -0.04],
  [0.64, 0.38, -0.04],
  [0.74, -0.12, -0.16],
  [0.86, -0.12, -0.16],
  [1, 0, 0],
]
function gazeAt(f: number): [number, number] {
  f = clamp01(f)
  for (let i = 0; i < GAZE.length - 1; i++) {
    const a = GAZE[i]
    const b = GAZE[i + 1]
    if (f <= b[0]) {
      const k = ease((f - a[0]) / (b[0] - a[0] || 1))
      return [lerp(a[1], b[1], k), lerp(a[2], b[2], k)]
    }
  }
  return [0, 0]
}

type Sparkle = { nx: number; ny: number; size: number; born: number; freq: number; phase: number }
type Particle = { x: number; y: number; vx: number; vy: number; s: number; color: string; glow: boolean; life: number }


export function createEyeScrub(view: HTMLCanvasElement): EyeHandle {
  const BG = hex('#0c0907')
  const ACCENT = hex('#f2804a')
  const CREAM = hex('#f3ead8')
  const WHITE: RGB = [255, 255, 255]
  const deep = mix(ACCENT, BG, 0.8)
  const orange = ramp([deep, mix(ACCENT, [0, 0, 0], 0.38), ACCENT, mix(ACCENT, WHITE, 0.5), WHITE])
  const cream = ramp([deep, mix(CREAM, BG, 0.62), CREAM, WHITE])

  const mk = () => document.createElement('canvas')
  const frame = mk()
  const rem = mk()
  const snap = mk()
  const vctx = view.getContext('2d')!
  const fctx = frame.getContext('2d')!
  const rctx = rem.getContext('2d')!
  const sctx = snap.getContext('2d', { willReadFrequently: true })!
  let dissolveReady = false
  let destroyed = false

  let dpr = 1
  let W = 0
  let H = 0
  let cwP = 8
  let chP = 12
  let cols = 0
  let rows = 0
  let appear = new Float32Array(0)
  let dust = new Float32Array(0)
  let atlas: HTMLCanvasElement | null = null
  let sparkles: Sparkle[] = []

  const noise24 = makeNoise(24)
  const noise48 = makeNoise(48)
  const noise96 = makeNoise(96)

  function buildAtlas() {
    atlas = mk()
    atlas.width = (NCH + 1) * cwP
    atlas.height = 32 * chP
    const a = atlas.getContext('2d')!
    a.font = `600 ${11 * dpr}px ui-monospace, Menlo, Consolas, monospace`
    a.textAlign = 'center'
    a.textBaseline = 'middle'
    const all = [...orange, ...cream]
    for (let row = 0; row < 32; row++) {
      a.fillStyle = css(all[row])
      for (let c = 1; c <= NCH; c++) a.fillText(RAMP[c], c * cwP + cwP / 2, row * chP + chP / 2)
    }
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1)
    W = view.clientWidth || window.innerWidth
    H = view.clientHeight || window.innerHeight
    dissolveReady = false
    const Wp = Math.round(W * dpr)
    const Hp = Math.round(H * dpr)
    for (const c of [view, frame, rem, snap]) {
      c.width = Wp
      c.height = Hp
    }
    cwP = Math.round(CELL_W * dpr)
    chP = Math.round(CELL_H * dpr)
    cols = Math.ceil(Wp / cwP)
    rows = Math.ceil(Hp / chP)
    appear = new Float32Array(cols * rows)
    dust = new Float32Array(cols * rows)
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        appear[i] = Math.random() * 0.33 + (r / rows) * 0.12
        dust[i] = Math.random() < 0.55 ? 0.03 + Math.random() * 0.1 : 0
      }
    buildAtlas()
    {
      const n = Math.floor((W * H) / 8000)
      sparkles = Array.from({ length: n }, () => ({
        nx: Math.random(),
        ny: Math.random(),
        size: 7 + 48 * Math.pow(Math.random(), 3.2),
        born: Math.random() * 0.75 * D_SPARK,
        freq: 2 + Math.random() * 3,
        phase: Math.random() * Math.PI * 2,
      }))
    }
  }

  // ---------- Modèle de l'œil (unités œil : demi-largeur du boîtier = 1, y vers le bas) ----------
  let oRamp = -1
  let oPos = 0
  let oB = 0
  const S = { top: -0.02, bot: 0.02, ix: 0, iy: 0, m: 0, sp: 0, t: 0 }

  function evalEye(ex: number, ey: number) {
    oRamp = -1
    oB = 0
    oPos = 0
    const ax = Math.abs(ex)
    const ay = Math.abs(ey)
    if (ax > 1.02 || ay > 0.78) return
    const fade = 1 - S.m
    const r = Math.hypot(ex, ey)

    // Boîtier
    if (fade > 0.001) {
      const q = ax ** 4 + (ay / 0.74) ** 4
      if (q < 1) {
        const dome = 1 - 0.32 * q * q
        const light = 1 - 0.12 * ey
        const seam = Math.abs(ax - 0.74) < 0.012 ? 0.45 : 1
        const outline = q > 0.92 ? 0.55 : 1
        oRamp = 1
        oB = 0.95 * dome * light * seam * outline * fade
        oPos = 0.6 + 0.2 * dome
        // Vis
        const bx = Math.abs(ax - 0.82)
        const by = Math.abs(ay - 0.47)
        if (bx < 0.06 && by < 0.06) {
          const d = Math.hypot(bx, by)
          if (d < 0.025) {
            oPos = 0.9
            oB = 0.85 * fade
          } else if (d < 0.055) {
            oPos = 0.25
            oB = 0.2 * fade
          }
        }
      }
      // Pourtour sombre autour de l'orbite
      if (r >= 0.6 && r < 0.67) {
        oRamp = 0
        oPos = 0.08
        oB = 0.22 * fade
      }
    }

    // Orbite : fond sombre, iris, pupille, reflets
    if (r < 0.6) {
      const rim = Math.exp(-(((r - 0.6) / 0.03) ** 2))
      const sh = ey > S.top ? 1 - 0.5 * Math.exp(-(ey - S.top) / 0.1) : 1
      oRamp = 0
      oPos = 0.12 + 0.3 * rim
      oB = (0.13 + 0.45 * rim) * sh * fade

      const dx = ex - S.ix
      const dy = ey - S.iy
      const m = S.m
      let rr: number
      if (m > 0) {
        const p = 2 - 1.5 * m
        const R = 0.47 * (1 - 0.06 * m) * (1 + 0.015 * Math.sin(9 * S.t))
        rr = Math.pow(Math.pow(Math.abs(dx), p) + Math.pow(Math.abs(dy), p), 1 / p) / R
      } else rr = Math.hypot(dx, dy) / 0.47

      if (rr < 1) {
        const ts = ey > S.top ? 0.55 * Math.exp(-(ey - S.top) / 0.12) : 0
        let pos = 0
        let b = 0
        if (m < 1) {
          const rings = 0.5 + 0.5 * Math.cos(rr * 9 * Math.PI)
          const ang = Math.atan2(dy, dx)
          const fib = 0.5 * noise24(ang) + 0.3 * noise48(ang) + 0.2 * noise96(ang)
          const coll = 0.25 * Math.exp(-(((rr - 0.6) / 0.06) ** 2))
          const limbal = rr > 0.9 ? 0.55 : 1
          const np = rr < 0.5 ? 0.9 : 1
          const light = 1 + 0.15 * (dy / 0.47)
          const k = 1 - m
          pos = 0.58 + 0.2 * (1 - rr) + 0.08 * rings * k
          b = (0.74 + (0.22 * rings + 0.12 * fib + coll) * k) * limbal * np * light * (1 - ts)
        }
        if (m > 0) {
          const sPos = 0.5 + 0.22 * (1 - rr) + 0.35 * S.sp
          const sB = 0.62 + 0.35 * (1 - rr) + 0.3 * S.sp
          pos = lerp(pos, sPos, m)
          b = lerp(b, sB, m)
        }
        oRamp = 0
        oPos = pos
        oB = b > 1 ? 1 : b
        if (m < 0.001) {
          if (rr < 0.39 * (1 + 0.05 * Math.sin(S.t * 1.6))) {
            oPos = 0.1
            oB = 0.02
          }
          const u = dx / 0.47
          const v = dy / 0.47
          const wx = Math.abs(u + 0.36)
          const wy = Math.abs(v + 0.36)
          if ((wx < 0.14 && wy < 0.14 && wx > 0.011 && wy > 0.011) || Math.hypot(u - 0.3, v - 0.28) < 0.06) {
            oRamp = 1
            oPos = 1
            oB = 1
          }
        }
      }
    }

    // Plaques d'obturateur
    if (fade > 0.001) {
      let edge = 0
      let hit = false
      if (ey < S.top && (r < 0.6 || (ey > S.top - 0.17 && ax < 0.64))) {
        hit = true
        edge = S.top
      } else if (ey > S.bot && (r < 0.6 || (ey < S.bot + 0.17 && ax < 0.64))) {
        hit = true
        edge = S.bot
      }
      if (hit) {
        let b = Math.floor(ey / 0.042) & 1 ? 0.95 : 0.7
        let pos = 0.56
        if (Math.abs(ey - edge) < 0.025) {
          b += 0.25
          pos += 0.15
        }
        b *= 1 - 0.3 * (ax / 0.64) ** 4
        oRamp = 0
        oPos = pos
        oB = b * fade
      }
    }
  }

  // ---------- Dessin d'une image ----------
  function drawFrame(t: number) {
    const f = fctx
    f.setTransform(1, 0, 0, 1, 0, 0)
    f.globalAlpha = 1
    f.fillStyle = css(BG)
    f.fillRect(0, 0, frame.width, frame.height)

    // État de l'œil
    let open = 0.04
    if (t >= T_OPEN) open = lerp(0.04, 1, ease((t - T_OPEN) / D_OPEN))
    const bp = (t - BLINK_AT) / BLINK_DUR
    if (bp > 0 && bp < 1) open *= 1 - 0.97 * Math.sin(Math.PI * bp)
    const [gx, gy] = t >= T_LOOK ? gazeAt((t - T_LOOK) / D_LOOK) : [0, 0]
    const lift = Math.max(0, -gy) * 0.06
    S.top = -(0.5 + lift) * open
    S.bot = 0.5 * open
    S.ix = gx * 0.5
    S.iy = gy * 0.5
    S.m = ease((t - T_MORPH) / D_MORPH)
    S.sp = ease((t - T_SPARK) / D_SPARK)
    S.t = t
    const zoom = 1 + 0.9 * ease((t - T_ZOOM) / D_ZOOM)
    const unit = Math.min(W * 0.37, H * 0.6) * zoom
    const cx = W / 2
    const cy = H / 2
    const dustMul = 1 - 0.5 * clamp01((t - T_SPARK) / 0.5)
    const fk = Math.floor(t * 12)
    const cellX = cwP / dpr
    const cellY = chP / dpr

    for (let r = 0; r < rows; r++) {
      const py = (r + 0.5) * cellY
      const ey = (py - cy) / unit
      const scan = r & 1 ? 0.84 : 1
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const fi = clamp01((t - appear[i]) / 0.15)
        if (fi <= 0) continue
        const ex = ((c + 0.5) * cellX - cx) / unit
        evalEye(ex, ey)
        let ramp = oRamp
        let pos = oPos
        let b = oB
        if (ramp < 0) {
          if (dust[i] === 0) continue
          ramp = 1
          pos = 0.05
          b = dust[i] * dustMul
        }
        b += (hash(i, fk) - 0.5) * 0.16
        b *= scan
        if (b <= 0) continue
        const idx = Math.round((b > 1 ? 1 : b) * NCH)
        if (idx === 0) continue
        const alpha = fi * (0.3 + 0.7 * (b > 1 ? 1 : b))
        if (alpha < 0.02) continue
        const step = Math.min(15, Math.max(0, Math.round(pos * 15)))
        f.globalAlpha = alpha
        f.drawImage(atlas!, idx * cwP, (ramp * 16 + step) * chP, cwP, chP, c * cwP, r * chP, cwP, chP)
      }
    }
    f.globalAlpha = 1

    // Étincelles ✦
    f.setTransform(dpr, 0, 0, dpr, 0, 0)
    const ts = t - T_SPARK
    if (ts > 0) {
      f.textAlign = 'center'
      f.textBaseline = 'middle'
      for (const s of sparkles) {
        const age = ts - s.born
        if (age <= 0) continue
        const fadeIn = Math.min(1, age / 0.25)
        const tw = 0.65 + 0.35 * Math.sin(age * s.freq * Math.PI * 2 + s.phase)
        const size = s.size * (0.75 + 0.25 * tw) * fadeIn
        if (size < 2) continue
        const col = css(mix(ACCENT, hex('#ffe6cf'), clamp01(age / 0.9)))
        f.globalAlpha = fadeIn * tw
        f.fillStyle = col
        f.shadowColor = col
        f.shadowBlur = 4 + 0.35 * size
        f.font = `${size}px system-ui, "Segoe UI Symbol", sans-serif`
        f.fillText('✦', s.nx * W, s.ny * H)
      }
      f.shadowBlur = 0
      f.globalAlpha = 1
    }

    // Barre de progression
    if (t >= T_MORPH) {
      const p = ease((t - T_MORPH) / (T_DIS - T_MORPH))
      const a = clamp01((t - T_MORPH) / 0.2)
      const w = Math.min(260, W * 0.5)
      f.globalAlpha = a
      f.fillStyle = css(deep)
      f.fillRect(16, H - 42, w, 4)
      f.fillStyle = css(ACCENT)
      f.fillRect(16, H - 42, w * p, 4)
      f.globalAlpha = 1
    }
    f.setTransform(1, 0, 0, 1, 0, 0)
  }

  // ---------- Dissolution en pixels : fonction pure de td ----------
  type Block = { x: number; y: number; delay: number }
  type Particle = { x: number; y: number; s: number; color: string; vx: number; vy: number; delay: number; glow: boolean }
  let blocks: Block[] = []
  let particles: Particle[] = []
  let pixels: ImageData | null = null

  function sample(x: number, y: number): [number, number, number] {
    const d = pixels!
    let r = 0
    let g = 0
    let b = 0
    for (const [ox, oy] of [[0.5, 0.5], [0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) {
      const px = Math.min(d.width - 1, Math.floor((x + ox * BLOCK) * dpr))
      const py = Math.min(d.height - 1, Math.floor((y + oy * BLOCK) * dpr))
      const k = (py * d.width + px) * 4
      r += d.data[k]
      g += d.data[k + 1]
      b += d.data[k + 2]
    }
    return [r / 5, g / 5, b / 5]
  }

  function buildDissolve() {
    drawFrame(EYE_END)
    sctx.setTransform(1, 0, 0, 1, 0, 0)
    sctx.clearRect(0, 0, snap.width, snap.height)
    sctx.drawImage(frame, 0, 0)
    pixels = sctx.getImageData(0, 0, snap.width, snap.height)

    const bc = Math.ceil(W / BLOCK)
    const br = Math.ceil(H / BLOCK)
    const unit = Math.min(W * 0.37, H * 0.6) * 1.9
    const seeds = sparkles.map((s) => ({ x: s.nx * W, y: s.ny * H, size: s.size }))
    seeds.push({ x: W / 2, y: H / 2, size: unit * 0.47 * 2.2 })
    const dist: number[] = []
    let maxD = 1
    for (let r = 0; r < br; r++)
      for (let c = 0; c < bc; c++) {
        const x = (c + 0.5) * BLOCK
        const y = (r + 0.5) * BLOCK
        let d = Infinity
        for (const s of seeds) d = Math.min(d, Math.max(0, Math.hypot(x - s.x, y - s.y) - 1.2 * s.size) / (1 + s.size / 30))
        dist.push(d)
        if (d > maxD) maxD = d
      }
    blocks = []
    particles = []
    const delays = new Map<number, number>()
    dist.forEach((d, i) => {
      const x = (i % bc) * BLOCK
      const y = Math.floor(i / bc) * BLOCK
      const delay = (0.72 * (d / maxD) + 0.15 * Math.random()) * D_DIS
      delays.set(i, delay)
      blocks.push({ x, y, delay })
      const [r, g, b] = sample(x, y)
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
      if (lum <= 0.32) return
      const color = `rgb(${r | 0},${g | 0},${b | 0})`
      const parts: [number, number, number][] = lum > 0.62 ? [[0, 0, BLOCK / 2], [BLOCK / 2, 0, BLOCK / 2], [0, BLOCK / 2, BLOCK / 2], [BLOCK / 2, BLOCK / 2, BLOCK / 2]] : [[0, 0, BLOCK]]
      for (const [ox, oy, s] of parts)
        particles.push({ x: x + ox, y: y + oy, s, color, vx: (Math.random() * 2 - 1) * 140, vy: -(60 + Math.random() * 220), delay, glow: false })
    })
    for (const s of sparkles) {
      const key = Math.floor((s.ny * H) / BLOCK) * bc + Math.floor((s.nx * W) / BLOCK)
      const delay = delays.get(key) ?? 0
      const n = 6 + Math.floor(s.size / 5)
      for (let k = 0; k < n; k++)
        particles.push({
          x: s.nx * W, y: s.ny * H, s: 2 + Math.random() * 3,
          color: Math.random() < 0.5 ? '#ffffff' : '#ffd2b8',
          vx: (Math.random() * 2 - 1) * 140, vy: -(60 + Math.random() * 220), delay, glow: true,
        })
    }
    blocks.sort((a, b) => a.delay - b.delay)
    pixels = null
    dissolveReady = true
  }

  function drawDissolve(td: number) {
    const v = vctx
    v.setTransform(1, 0, 0, 1, 0, 0)
    v.globalAlpha = 1
    v.clearRect(0, 0, view.width, view.height)
    // Reste de l'image : l'instantané moins les blocs déjà tombés.
    if (td < D_DIS) {
      rctx.setTransform(1, 0, 0, 1, 0, 0)
      rctx.clearRect(0, 0, rem.width, rem.height)
      rctx.drawImage(snap, 0, 0)
      const bw = Math.ceil(BLOCK * dpr) + 1
      for (let i = 0; i < blocks.length && blocks[i].delay <= td; i++)
        rctx.clearRect(Math.floor(blocks[i].x * dpr), Math.floor(blocks[i].y * dpr), bw, bw)
      v.drawImage(rem, 0, 0)
      // Tranches décalées, tirées d'une graine liée à td : stables, donc réversibles.
      if (td < D_DIS * 0.6) {
        let seed = Math.floor(td * 40) * 9301 + 49297
        const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
        for (let k = 0; k < 3; k++) {
          const h = 6 + rnd() * 26
          const y = rnd() * (H - h)
          const dx = (10 + rnd() * 40) * (rnd() < 0.5 ? -1 : 1)
          v.drawImage(rem, 0, y * dpr, rem.width, h * dpr, dx * dpr, y * dpr, rem.width, h * dpr)
        }
      }
    }
    v.setTransform(dpr, 0, 0, dpr, 0, 0)
    const crowded = particles.length > 1500
    for (const p of particles) {
      const a = td - p.delay
      if (a < 0 || a >= 1) continue
      v.globalAlpha = 1 - a
      v.fillStyle = p.color
      if (p.glow && !crowded) {
        v.shadowColor = p.color
        v.shadowBlur = 8
      } else v.shadowBlur = 0
      v.fillRect(p.x + p.vx * a, p.y + p.vy * a + 450 * a * a, p.s, p.s)
    }
    v.shadowBlur = 0
    v.globalAlpha = 1
    v.setTransform(1, 0, 0, 1, 0, 0)
  }

  function draw(t: number, td: number) {
    if (destroyed || !atlas) return
    if (td <= 0) {
      drawFrame(Math.min(t, EYE_END))
      vctx.setTransform(1, 0, 0, 1, 0, 0)
      vctx.drawImage(frame, 0, 0)
      return
    }
    if (!dissolveReady) buildDissolve()
    drawDissolve(td)
  }

  function onResize() {
    resize()
  }
  resize()
  return {
    draw,
    resize: onResize,
    destroy() {
      destroyed = true
      atlas = null
      pixels = null
      blocks = []
      particles = []
      for (const c of [view, frame, rem, snap]) {
        c.width = 0
        c.height = 0
      }
    },
  }
}
