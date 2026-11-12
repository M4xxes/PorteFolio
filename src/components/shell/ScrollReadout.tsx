'use client'

import { useEffect, useRef } from 'react'
import { ui } from '@/lib/store'

/** Barre de progression de 2 px (accent), mise à jour hors du cycle React. */
export function ScrollBar() {
  const bar = useRef<HTMLDivElement>(null)
  useEffect(
    () =>
      ui.subscribe((s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.scroll.progress})`
      }),
    []
  )
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[110] h-0.5 bg-line">
      <div ref={bar} className="h-full origin-left scale-x-0 bg-accent" />
    </div>
  )
}

/** « SCROLL 042 % » en Doto. */
export function ScrollPercent({ className }: { className?: string }) {
  const out = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    let last = -1
    return ui.subscribe((s) => {
      const pct = Math.round(s.scroll.progress * 100)
      if (pct !== last && out.current) {
        last = pct
        out.current.textContent = String(pct).padStart(3, '0')
      }
    })
  }, [])
  return (
    <p aria-hidden className={`ui text-fg-2 ${className ?? ''}`}>
      SCROLL{' '}
      <span ref={out} className="doto text-[1.35em] text-fg">
        000
      </span>{' '}
      %
    </p>
  )
}
