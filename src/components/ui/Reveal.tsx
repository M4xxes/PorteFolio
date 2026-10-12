'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { easing } from '@/lib/constants'

/** Apparition douce au défilement (une seule fois). Désactivée par MotionConfig si reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  const Component = motion[as]
  return (
    <Component
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: easing.smooth }}
      className={className}
    >
      {children}
    </Component>
  )
}
