'use client'

import { useRef } from 'react'
import { motion, useSpring } from 'framer-motion'
import { finePointerQuery, reducedMotionQuery } from '@/lib/motion'

const MAX = 6

/** Attire légèrement son contenu vers le curseur (6 px max), avec un ressort au relâchement. */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 })
  const y = useSpring(0, { stiffness: 260, damping: 18, mass: 0.6 })

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !window.matchMedia(finePointerQuery).matches || window.matchMedia(reducedMotionQuery).matches) return
    const r = ref.current!.getBoundingClientRect()
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2)
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2)
    x.set(Math.max(-1, Math.min(1, dx)) * MAX)
    y.set(Math.max(-1, Math.min(1, dy)) * MAX)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.span ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={`inline-flex ${className ?? ''}`}>
      {children}
    </motion.span>
  )
}
