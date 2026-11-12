'use client'

import { useEffect, useRef, useState } from 'react'
import { finePointerQuery, reducedMotionQuery } from '@/lib/motion'

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/'
const DURATION = 240

/**
 * Effet « décodage » au survol : les lettres défilent puis se fixent de gauche à droite (≤ 250 ms).
 * Le texte réel reste lisible par les lecteurs d'écran (le texte animé est masqué pour eux).
 */
export function DecodeText({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text)
  const raf = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const run = () => {
    if (!window.matchMedia(finePointerQuery).matches || window.matchMedia(reducedMotionQuery).matches) return
    cancelAnimationFrame(raf.current)
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      const fixed = Math.floor(t * text.length)
      let out = ''
      for (let i = 0; i < text.length; i++) {
        const c = text[i]
        out += i < fixed || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setShown(out)
      if (t < 1) raf.current = requestAnimationFrame(step)
      else setShown(text)
    }
    raf.current = requestAnimationFrame(step)
  }

  return (
    <span className={className} onPointerEnter={run}>
      <span aria-hidden>{shown}</span>
      {/* Version lue : sans les flèches ni crochets décoratifs ; un lien ↗ s'ouvre dans un nouvel onglet. */}
      <span className="sr-only">
        {text.replace(/[↗→←[\]]/g, '').trim()}
        {text.includes('↗') ? ' (nouvel onglet)' : ''}
      </span>
    </span>
  )
}
