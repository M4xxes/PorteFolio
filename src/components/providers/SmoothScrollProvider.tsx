'use client'

import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'

let lenisInstance: Lenis | null = null

/** Accès à l'instance Lenis (ex. bloquer le défilement quand le menu mobile est ouvert). */
export function getLenis() {
  return lenisInstance
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      autoRaf: true,
      anchors: { offset: -80 },
    })
    lenisInstance = lenis

    return () => {
      lenis.destroy()
      lenisInstance = null
    }
  }, [])

  // reducedMotion="user" : Framer Motion coupe les animations de transformation si l'utilisateur le demande.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
