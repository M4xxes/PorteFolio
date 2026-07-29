'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { projects } from '@/lib/data/projects'
import { ProjectCard } from '@/components/ui/ProjectCard'
import { easing } from '@/lib/constants'

const ALL = 'Tous'

export function Projects() {
  const stacks = useMemo(() => {
    const set = new Set<string>()
    projects.forEach((p) => p.stack.forEach((s) => set.add(s)))
    return [ALL, ...Array.from(set)]
  }, [])

  const [filter, setFilter] = useState(ALL)

  const filtered = useMemo(
    () => (filter === ALL ? projects : projects.filter((p) => p.stack.includes(filter))),
    [filter]
  )

  return (
    <section id="projects" className="relative z-20 bg-bg px-6 py-32 sm:px-10 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.8, ease: easing.smooth }}
        className="mx-auto mb-16 max-w-6xl"
      >
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">Projets</span>
        <h2 className="mt-4 max-w-2xl font-serif text-4xl text-fg sm:text-5xl">
          Des idées transformées en produits concrets.
        </h2>

        <div className="mt-8 flex flex-wrap gap-2">
          {stacks.map((s) => (
            <button
              key={s}
              data-cursor-hover
              onClick={() => setFilter(s)}
              className={`rounded-full border px-4 py-1.5 font-sans text-xs uppercase tracking-wide transition-colors ${
                filter === s
                  ? 'border-accent bg-accent/15 text-fg'
                  : 'border-border-soft text-fg-muted hover:border-accent/40 hover:text-fg'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="mx-auto grid max-w-6xl gap-x-10 gap-y-20 sm:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: easing.smooth }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}
