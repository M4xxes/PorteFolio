'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProjectCategory } from '@/types'
import { categoryLabels, projects } from '@/lib/data/projects'
import { easing } from '@/lib/constants'
import { ProjectCard } from './ProjectCard'

type Filter = 'all' | ProjectCategory

const filters: { id: Filter; label: string; count: number }[] = [
  { id: 'all', label: 'Tout', count: projects.length },
  ...(Object.keys(categoryLabels) as ProjectCategory[])
    .map((id) => ({ id, label: categoryLabels[id], count: projects.filter((p) => p.category === id).length }))
    .filter((f) => f.count > 0),
]

/**
 * Composition éditoriale : largeurs, décalages et proportions varient selon la position,
 * pour éviter une grille de cartes toutes identiques.
 */
const layout = [
  { col: 'lg:col-span-7', aspect: 'aspect-[16/10]' },
  { col: 'lg:col-span-5 lg:mt-32', aspect: 'aspect-[4/3]' },
  { col: 'lg:col-span-5', aspect: 'aspect-[4/3]' },
  { col: 'lg:col-span-6 lg:col-start-7 lg:mt-20', aspect: 'aspect-[16/10]' },
  { col: 'lg:col-span-8 lg:col-start-3', aspect: 'aspect-[16/9]' },
  { col: 'lg:col-span-6', aspect: 'aspect-[16/10]' },
  { col: 'lg:col-span-5 lg:col-start-8 lg:mt-28', aspect: 'aspect-[4/3]' },
]

export function ProjectsExplorer() {
  const [filter, setFilter] = useState<Filter>('all')
  const visible = filter === 'all' ? projects : projects.filter((p) => p.category === filter)

  return (
    <div>
      <div className="mb-16 flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="label text-muted">Filtrer</p>
        <div role="group" aria-label="Filtrer les projets par catégorie" className="flex flex-wrap gap-x-6 gap-y-2">
          {filters.map((f) => {
            const active = filter === f.id
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={active}
                className={`group relative inline-flex min-h-10 items-baseline gap-1.5 text-base transition-colors ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}
              >
                {f.label}
                <sup className={`font-mono text-[10px] ${active ? 'text-orange-ink' : ''}`}>{String(f.count).padStart(2, '0')}</sup>
                <span
                  aria-hidden
                  className={`absolute bottom-1 left-0 h-[2px] w-full origin-left bg-orange transition-transform duration-500 ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'}`}
                />
              </button>
            )
          })}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} projet{visible.length > 1 ? 's' : ''} affiché{visible.length > 1 ? 's' : ''}
      </p>

      <ul className="grid gap-x-8 gap-y-20 lg:grid-cols-12 lg:gap-y-28">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => {
            const slot = layout[i % layout.length]
            return (
              <motion.li
                key={project.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6, ease: easing.smooth }}
                className={slot.col}
              >
                <ProjectCard project={project} index={projects.indexOf(project) + 1} aspect={slot.aspect} priority={i < 2} />
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
