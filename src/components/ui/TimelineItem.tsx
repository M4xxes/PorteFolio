import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface TimelineItemProps {
  period: string
  title: string
  subtitle: string
  location?: string
  badge?: string
  badgeColor?: string
  current?: boolean
  children?: ReactNode
  index: number
}

// Élément de timeline vertical utilisé dans Expérience et Formation
export function TimelineItem({
  period, title, subtitle, location, badge, badgeColor = 'text-accent bg-accent/10 border-accent/25',
  current, children, index,
}: TimelineItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex gap-6 md:gap-8"
    >
      {/* Colonne de gauche : indicateur timeline */}
      <div className="flex flex-col items-center shrink-0">
        {/* Point */}
        <div className={`mt-1.5 w-3 h-3 rounded-full border-2 shrink-0 z-10
          ${current ? 'bg-accent border-accent shadow-accent-sm' : 'bg-elevated border-c-border'}`}
        />
        {/* Ligne verticale */}
        <div className="w-px flex-1 mt-2 bg-c-border" />
      </div>

      {/* Contenu */}
      <div className="pb-10 flex-1 min-w-0">
        {/* Période + badge */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono text-xs text-c-muted tracking-wide">{period}</span>
          {badge && (
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium tracking-widest uppercase ${badgeColor}`}>
              {badge}
            </span>
          )}
          {current && (
            <span className="text-[10px] px-2 py-0.5 rounded border font-medium tracking-widest uppercase
                             text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
              Actuel
            </span>
          )}
        </div>

        {/* Titre */}
        <h3 className="font-serif text-lg md:text-xl text-c-text font-semibold leading-snug">{title}</h3>

        {/* Sous-titre + lieu */}
        <p className="text-c-muted text-sm mt-0.5">
          {subtitle}
          {location && <span className="opacity-60"> · {location}</span>}
        </p>

        {/* Contenu optionnel (description, certification…) */}
        {children && <div className="mt-3">{children}</div>}
      </div>
    </motion.div>
  )
}
