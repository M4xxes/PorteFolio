'use client'

import { useEffect } from 'react'
import Lenis from 'lenis'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { reducedMotionQuery } from '@/lib/motion'

let lenisInstance: Lenis | null = null

/** Instance Lenis (null en reduced motion : défilement natif). */
export function getLenis() {
  return lenisInstance
}

type Guard = (deltaY: number) => boolean
let guard: Guard | null = null

/**
 * Filtre du défilement de la page : renvoie false pour laisser un événement de molette au navigateur
 * (par exemple la liste de projets de l'accueil, qui défile seule tant qu'elle n'est pas tout en haut).
 */
export function setScrollGuard(g: Guard | null) {
  guard = g
}

const locks = new Set<string>()

/** Bloque / rétablit le défilement. Chaque demandeur (menu, salle…) a sa clé : on ne débloque que quand tous ont relâché. */
export function lockScroll(locked: boolean, key = 'menu') {
  if (locked) locks.add(key)
  else locks.delete(key)
  const any = locks.size > 0
  document.documentElement.classList.toggle('scroll-locked', any)
  if (any) lenisInstance?.stop()
  else lenisInstance?.start()
}

export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  if (lenisInstance) lenisInstance.scrollTo(target === '#top' ? 0 : target, { immediate, force: immediate })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    el?.scrollIntoView()
  }
}

/**
 * Défilement fluide (Lenis) branché sur la boucle unique `addFrame`,
 * et publication de la position / progression / vitesse dans le store.
 */
export function ScrollEngine({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduced = window.matchMedia(reducedMotionQuery).matches
    let velocity = 0

    const publish = (y: number, rawVelocity: number) => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      velocity += (rawVelocity - velocity) * 0.2
      ui.setState({ scroll: { y, progress: max > 0 ? Math.min(1, Math.max(0, y / max)) : 0, velocity } })
    }

    let lenis: Lenis | null = null
    let lastY = window.scrollY
    if (!reduced) {
      lenis = new Lenis({
        autoRaf: false,
        // Les ancres s'arrêtent sous l'en-tête fixe grâce à `scroll-margin-top` (globals.css), que Lenis respecte.
        anchors: true,
        lerp: 0.1,
        virtualScroll: (e) => (guard ? guard(e.deltaY) : true),
        // Les zones qui défilent elles-mêmes (formulaire, menu) gardent le défilement natif.
        prevent: (node) => node.closest?.('[data-lenis-prevent]') != null,
      })
      lenisInstance = lenis
    }

    // À chaque frame : Lenis avance, puis on publie la vitesse (qui retombe à 0 à l'arrêt).
    const stop = addFrame((time) => {
      lenis?.raf(time)
      const y = lenis ? lenis.scroll : window.scrollY
      const raw = y - lastY
      lastY = y
      if (raw !== 0 || Math.abs(ui.getState().scroll.velocity) > 0.01) publish(y, raw)
    }, 0)
    publish(window.scrollY, 0)

    return () => {
      stop()
      lenis?.destroy()
      lenisInstance = null
    }
  }, [])

  return <>{children}</>
}
