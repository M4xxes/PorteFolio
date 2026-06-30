import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface SectionWrapperProps {
  id: string
  children: ReactNode
  className?: string
  // Délai de l'animation d'entrée pour décaler les sections
  delay?: number
}

// Wrapper réutilisable pour chaque section — applique l'animation d'entrée au scroll
export function SectionWrapper({ id, children, className = '', delay = 0 }: SectionWrapperProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.65, ease: 'easeOut', delay }}
      className={`py-20 md:py-28 ${className}`}
    >
      {children}
    </motion.section>
  )
}

// En-tête de section standardisé avec numéro, titre et ligne décorative
interface SectionHeaderProps {
  number: string
  title: string
  subtitle?: string
}

export function SectionHeader({ number, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="mb-14 md:mb-20">
      {/* Numéro de section + ligne */}
      <div className="flex items-center gap-4 mb-4">
        <span className="font-mono text-xs tracking-[0.25em] text-accent uppercase">{number}</span>
        <div className="h-px flex-1 max-w-[60px] bg-accent opacity-40" />
      </div>

      {/* Titre principal */}
      <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-c-text font-semibold leading-tight">
        {title}
      </h2>

      {/* Sous-titre optionnel */}
      {subtitle && (
        <p className="mt-4 text-c-muted text-base md:text-lg max-w-xl">{subtitle}</p>
      )}
    </div>
  )
}
