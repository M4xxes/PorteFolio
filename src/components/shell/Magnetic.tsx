'use client'

import { useEffect, useRef } from 'react'
import { addFrame } from '@/lib/loop'
import { finePointerQuery, reducedMotionQuery } from '@/lib/motion'

const MAX = 6
// Ressort amorti (raideur / masse et amortissement / masse) : léger dépassement au relâchement.
const K = 433
const C = 30

/**
 * Attire légèrement son contenu vers le curseur (6 px max), avec un ressort au relâchement.
 * Le ressort tourne sur la boucle d'animation commune, seulement tant que ça bouge.
 */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, stop: null as null | (() => void) })

  useEffect(() => {
    const st = s.current
    return () => st.stop?.()
  }, [])

  const run = () => {
    const st = s.current
    if (st.stop) return
    st.stop = addFrame((_, delta) => {
      const dt = Math.min(delta, 50) / 1000
      st.vx += (-K * (st.x - st.tx) - C * st.vx) * dt
      st.vy += (-K * (st.y - st.ty) - C * st.vy) * dt
      st.x += st.vx * dt
      st.y += st.vy * dt
      ref.current!.style.transform = `translate3d(${st.x.toFixed(2)}px, ${st.y.toFixed(2)}px, 0)`
      const settled = Math.abs(st.x - st.tx) < 0.02 && Math.abs(st.y - st.ty) < 0.02 && Math.abs(st.vx) < 0.05 && Math.abs(st.vy) < 0.05
      if (settled && st.tx === 0 && st.ty === 0) {
        ref.current!.style.transform = ''
        st.x = st.y = st.vx = st.vy = 0
        st.stop?.()
        st.stop = null
      }
    }, 15)
  }

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !window.matchMedia(finePointerQuery).matches || window.matchMedia(reducedMotionQuery).matches) return
    const r = ref.current!.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    s.current.tx = Math.max(-1, Math.min(1, dx)) * MAX
    s.current.ty = Math.max(-1, Math.min(1, dy)) * MAX
    run()
  }
  const reset = () => {
    s.current.tx = 0
    s.current.ty = 0
    if (s.current.x !== 0 || s.current.y !== 0) run()
  }

  return (
    <span ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`inline-flex will-change-transform ${className ?? ''}`}>
      {children}
    </span>
  )
}
