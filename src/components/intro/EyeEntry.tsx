'use client'

import { useEffect, useRef } from 'react'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { DISS_VH, EYE_VH } from './timing'
import { app } from '@/components/sphere/state'
import { DISSOLVE_END, EYE_END, EYE_OPEN_T, createEyeScrub } from './eyeScrub'

const ART = [
  ' __  __ ____ ',
  '|  \\/  |  _ \\',
  '| |\\/| | |_) |',
  '| |  | |  __/ ',
  '|_|  |_|_|    ',
]
const LINES = [
  '> Maxime Pero (Maxxes)',
  '> Développeur web — B3 Informatique @ YNOV',
  '> Lyon, France',
  '> github.com/M4xxes',
  '> défiler pour entrer',
]
const TEXT = [...ART, '', ...LINES].join('\n')
const TYPE_MS = 1400
const smooth = (a: number, b: number, v: number) => {
  const x = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return x * x * (3 - 2 * x)
}

/**
 * Entrée du site : l'œil en caractères, fixé à l'écran, dont l'animation avance avec le défilement
 * (dans les deux sens) puis se dissout sur la section des projets.
 * Au chargement, l'œil s'ouvre seul ; ensuite c'est le scroll qui commande. Si on s'arrête, tout s'arrête.
 * Une présentation en ASCII se « tape » au chargement et à chaque retour tout en haut.
 */
export function EyeEntry() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const term = useRef<HTMLDivElement>(null)
  const caret = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const cv = canvas.current
    const box = term.current
    if (!cv || !box) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const eye = createEyeScrub(cv)

    // ---- Présentation en ASCII (frappe ≤ 1,4 s) ----
    const node = document.createTextNode('')
    box.querySelector('pre')!.prepend(node)
    let typeRaf = 0
    const showAll = () => {
      node.data = TEXT
    }
    const type = () => {
      cancelAnimationFrame(typeRaf)
      const t0 = performance.now()
      const step = (now: number) => {
        const n = Math.min(TEXT.length, Math.floor(((now - t0) / TYPE_MS) * TEXT.length))
        node.data = TEXT.slice(0, n)
        if (n < TEXT.length) typeRaf = requestAnimationFrame(step)
      }
      typeRaf = requestAnimationFrame(step)
    }

    if (reduced) {
      showAll()
      const still = () => eye.draw(3.5, 0)
      still()
      const ro = new ResizeObserver(() => {
        eye.resize()
        still()
      })
      ro.observe(cv)
      return () => {
        ro.disconnect()
        eye.destroy()
      }
    }

    // Retour d'une page projet : on atterrit directement sur la sphère, sans rejouer l'entrée.
    if (app.introDone && window.scrollY < 10) window.scrollTo(0, EYE_VH * window.innerHeight)
    type()
    let t = 0
    let first = true
    let lastT = -1
    let lastTd = -1
    let lastOpacity = ''
    let away = false
    let hidden = false
    const born = performance.now()
    const intro = window.scrollY < 10

    const draw = (force: boolean, td: number) => {
      if (force || t !== lastT || td !== lastTd) {
        lastT = t
        lastTd = td
        eye.draw(t, td)
      }
    }

    let lastW = cv.clientWidth
    let lastH = cv.clientHeight
    const ro = new ResizeObserver(() => {
      // Sur mobile, la barre d'adresse fait varier la hauteur : on ne redessine que pour un vrai changement.
      if (cv.clientWidth === lastW && Math.abs(cv.clientHeight - lastH) < 120) return
      lastW = cv.clientWidth
      lastH = cv.clientHeight
      eye.resize()
      draw(true, lastTd)
    })
    ro.observe(cv)

    const stop = addFrame((time, delta) => {
      const y = ui.getState().scroll.y
      const vh = window.innerHeight
      const scrubEnd = (EYE_VH - DISS_VH) * vh
      const s = y / scrubEnd
      let target = EYE_OPEN_T + (EYE_END - EYE_OPEN_T) * Math.min(1, Math.max(0, s))
      let td = 0
      if (y > scrubEnd) td = Math.min(DISSOLVE_END, ((y - scrubEnd) / (DISS_VH * vh)) * DISSOLVE_END)

      // Ouverture automatique au chargement : l'œil s'ouvre seul jusqu'à sa position de repos.
      if (intro) {
        const e = (performance.now() - born) / 1400
        if (e < 1) target = Math.max(target, EYE_OPEN_T * e * (2 - e))
      }
      // Arrivée en cours de page (retour depuis un projet, rechargement) : pas de rattrapage depuis zéro.
      const k = first && !intro ? 1 : 1 - Math.exp(-(delta / 1000) * 10)
      first = false
      t += (target - t) * k
      if (Math.abs(target - t) < 0.0008) t = target

      // L'œil n'est redessiné que si l'image change ; passé la dissolution, plus rien à dessiner.
      // Passée la dissolution, le canvas est masqué (plus de dessin, plus de coût).
      const over = y >= EYE_VH * vh
      if (over !== hidden) {
        hidden = over
        cv.style.visibility = over ? 'hidden' : ''
      }
      if (!over) draw(false, td)

      // Présentation : visible tout en haut, s'efface au scroll, se retape au retour.
      const o = (1 - smooth(0.02, 0.1, s)).toFixed(3)
      if (o !== lastOpacity) {
        lastOpacity = o
        box.style.opacity = o
        box.style.visibility = o === '0.000' ? 'hidden' : ''
      }
      if (s > 0.12) away = true
      else if (s < 0.02 && away) {
        away = false
        type()
      }
    }, 5)

    return () => {
      stop()
      ro.disconnect()
      cancelAnimationFrame(typeRaf)
      eye.destroy()
    }
  }, [])

  return (
    <section id="top" aria-label="Introduction" className="eye-entry pointer-events-none relative">
      <div className="eye-sticky pointer-events-none sticky top-0 z-20 h-svh overflow-hidden">
        <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />
        <h1 className="sr-only">Maxime Pero — développeur web</h1>
        <div
          ref={term}
          className="absolute bottom-6 left-[var(--gutter)] max-w-[calc(100%-2*var(--gutter))] bg-bg/75 p-3 backdrop-blur-[2px] sm:bottom-8"
          style={{ fontFamily: 'var(--font-departure), ui-monospace, monospace' }}
        >
          <span className="sr-only">{LINES.slice(0, 4).join('. ').replaceAll('> ', '')}</span>
          <pre aria-hidden className="m-0 whitespace-pre-wrap text-[11px] leading-[1.45] text-fg sm:text-[13px]">
            <span ref={caret} className="caret">
              _
            </span>
          </pre>
        </div>
      </div>
      {/* Ancre « Projets » : la fin de l'entrée, là où l'œil est dissous et où l'accueil est interactif. */}
      <div id="projets" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: 'var(--eye-scroll)' }} />
    </section>
  )
}
