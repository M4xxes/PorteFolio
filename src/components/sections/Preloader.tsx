'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { easing } from '@/lib/constants'

const DURATION_MS = 1800

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const pct = Math.min(100, Math.round((elapsed / DURATION_MS) * 100))
      setProgress(pct)
      if (pct < 100) {
        raf = requestAnimationFrame(tick)
      } else {
        setTimeout(() => setLeaving(true), 250)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!leaving) return
    const timeout = setTimeout(() => {
      document.documentElement.style.overflow = ''
      onComplete()
    }, 900)
    return () => clearTimeout(timeout)
  }, [leaving, onComplete])

  return (
    <AnimatePresence>
      {!leaving && (
        <div className="fixed inset-0 z-[9999] flex flex-col">
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 bg-bg"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.9, ease: easing.smooth }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 bg-bg"
            exit={{ y: '100%' }}
            transition={{ duration: 0.9, ease: easing.smooth }}
          />
          <motion.div
            className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-8"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" aria-hidden>
              <motion.path
                d="M8 52V12L32 38L56 12V52"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: easing.smooth }}
              />
            </svg>
            <div className="flex items-baseline gap-1 font-sans text-sm tracking-[0.3em] text-fg-muted">
              <span className="tabular-nums text-fg">{progress.toString().padStart(3, '0')}</span>
              <span>%</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
