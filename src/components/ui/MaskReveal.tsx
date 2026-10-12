'use client'

import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ReactNode } from 'react'
import { easing } from '@/lib/constants'

/**
 * Révèle une image par un masque qui s'ouvre du bas vers le haut, pendant que l'image se recadre.
 * Avec reduced-motion, l'image apparaît directement.
 */
export function MaskReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduced = usePrefersReducedMotion()
  if (reduced) return <div className={`overflow-hidden ${className}`}>{children}</div>
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.1, delay, ease: easing.inOut }}
    >
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={{ duration: 1.4, delay, ease: easing.smooth }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
