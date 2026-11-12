import { ui } from '@/lib/store'

/**
 * Mesures communes au HTML et à la scène 3D (ce fichier n'importe pas three).
 *
 * Chronologie du hero, pilotée uniquement par le scroll (aucune durée propre) :
 *   t = 0        sphère au repos dans son emplacement
 *   0 → 0,5      la sphère grossit et se disperse
 *   0,4 → 0,9    les particules rejoignent une grille plane, posée sur le premier écran du carrousel
 *   0,9 → 1      la mosaïque s'efface, l'écran 3D du premier projet prend le relais
 * t = 1 quand la section des projets est fixée en haut de la fenêtre.
 *
 * Carrousel : `work.top` → `work.top + work.range`, un cran (`work.step`) par projet.
 */
export const FOV = 30
export const CAMERA_Z = 10
export const T_END = 1
/** Défilement par projet dans la section fixée, en hauteurs de fenêtre. */
export const STEP_VH = 0.6

export const metrics = {
  ready: false,
  vw: 1,
  vh: 1,
  /** Unités monde par pixel CSS, dans le plan z = 0. */
  wpp: 1,
  /** Centre (coordonnées document) et rayon de la sphère, en px. */
  sphere: { x: 0, y: 0, r: 100 },
  /** Écran actif du carrousel, en px dans la fenêtre quand la section est fixée. */
  screen: { cx: 0, cy: 0, w: 100, h: 62.5 },
  /** Section fixée : début (px document), longueur de défilement, cran par projet. */
  work: { top: 0, range: 1, step: 1, count: 1 },
  /** Dernière activité (ms, horloge rAF) : sert au rendu à la demande. */
  lastActivity: 0,
}

/** Signale que quelque chose a changé et qu'il faut redessiner (texture chargée, redimensionnement…). */
export function poke() {
  metrics.lastActivity = performance.now()
}

/** Rectangle de l'écran actif pour une taille de fenêtre : même formule côté CSS (`.screen-rect`). */
export function screenRect(vw: number, vh: number) {
  const w = Math.min(vw * 0.42, vh * 0.62 * 1.6)
  return { cx: vw * 0.58, cy: vh * 0.5, w, h: w * 0.625 }
}

export function measure() {
  const slot = document.querySelector<HTMLElement>('[data-scene="hero"]')
  const work = document.querySelector<HTMLElement>('[data-scene="carousel"][data-pinned]')
  if (!slot || !work) {
    metrics.ready = false
    return
  }
  const sy = window.scrollY
  const vw = window.innerWidth
  const vh = window.innerHeight
  const s = slot.getBoundingClientRect()
  const w = work.getBoundingClientRect()
  const count = Number(work.dataset.count) || 1
  metrics.vw = vw
  metrics.vh = vh
  metrics.wpp = (2 * Math.tan((FOV * Math.PI) / 360) * CAMERA_Z) / vh
  metrics.sphere = { x: s.left + s.width / 2, y: s.top + sy + s.height / 2, r: Math.min(s.width, s.height) * 0.455 }
  metrics.screen = screenRect(vw, vh)
  const range = Math.max(1, w.height - vh)
  metrics.work = { top: w.top + sy, range, step: range / Math.max(1, count - 1), count }
  metrics.ready = true
  poke()
}

/** Progression de la chronologie du hero pour la position de scroll courante. */
export function heroT() {
  return metrics.ready ? ui.getState().scroll.y / Math.max(1, metrics.work.top) : 0
}

/** Progression dans le carrousel (0 → 1) et position à l'écran du bloc fixé (px). */
export function workState() {
  const { top, range } = metrics.work
  const y = ui.getState().scroll.y
  const p = clamp01((y - top) / range)
  const offset = y < top ? top - y : y > top + range ? top + range - y : 0
  return { p, offset, onScreen: metrics.ready && Math.abs(offset) < metrics.vh }
}

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const smooth = (a: number, b: number, v: number) => {
  const x = clamp01((v - a) / (b - a))
  return x * x * (3 - 2 * x)
}
