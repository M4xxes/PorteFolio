import { ui } from '@/lib/store'

/**
 * Chronologie du hero, pilotée uniquement par le scroll (aucune durée propre) :
 *   t = 0      sphère au repos dans son emplacement
 *   0 → 0,5    la sphère grossit et se disperse
 *   0,4 → 1    les particules rejoignent une grille plane, posée sur le premier écran des projets
 *   1 → 1,08   la mosaïque s'efface et laisse la vraie capture
 * Les positions viennent du DOM : `[data-scene="hero"]` et `[data-scene-target="first-screen"]`.
 */
export const FOV = 30
export const CAMERA_Z = 10
export const T_END = 1.08

export const metrics = {
  ready: false,
  vw: 1,
  vh: 1,
  /** Unités monde par pixel CSS, dans le plan z = 0. */
  wpp: 1,
  /** Centre (coordonnées document) et rayon de la sphère, en px. */
  sphere: { x: 0, y: 0, r: 100 },
  /** Rectangle du premier écran (coordonnées document), en px. */
  target: { x: 0, y: 0, w: 100, h: 60 },
  /** Scroll (px) pour lequel t = 1 : le premier écran est centré dans la fenêtre. */
  yEnd: 1,
}

export function measure() {
  const slot = document.querySelector<HTMLElement>('[data-scene="hero"]')
  const target = document.querySelector<HTMLElement>('[data-scene-target="first-screen"]')
  if (!slot || !target) {
    metrics.ready = false
    return
  }
  const sy = window.scrollY
  const vw = window.innerWidth
  const vh = window.innerHeight
  const s = slot.getBoundingClientRect()
  const t = target.getBoundingClientRect()
  metrics.vw = vw
  metrics.vh = vh
  metrics.wpp = (2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z) / vh
  metrics.sphere = { x: s.left + s.width / 2, y: s.top + sy + s.height / 2, r: Math.min(s.width, s.height) * 0.455 }
  metrics.target = { x: t.left, y: t.top + sy, w: t.width, h: t.height }
  metrics.yEnd = Math.max(vh * 0.6, metrics.target.y - (vh - t.height) / 2)
  metrics.ready = true
}

/** Progression de la chronologie pour la position de scroll courante. */
export function heroT() {
  return metrics.ready ? ui.getState().scroll.y / metrics.yEnd : 0
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
