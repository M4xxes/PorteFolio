'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Project } from '@/types'
import { ProjectMockup } from './ProjectMockup'

export function ProjectCard({ project }: { project: Project }) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <Link href={`/projects/${project.id}`} data-cursor-hover className="group block">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformPerspective: 800 }}
        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border-soft transition-colors duration-300 group-hover:border-accent/50"
      >
        <ProjectMockup project={project} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
      </motion.div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-fg transition-colors group-hover:text-accent">
            {project.title}
          </h3>
          <p className="mt-2 max-w-sm font-sans text-sm text-fg-muted">{project.description}</p>
        </div>
        <span className="mt-2 shrink-0 font-sans text-xs text-fg-muted opacity-0 transition-opacity group-hover:opacity-100">
          Voir →
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border-soft px-3 py-1 font-sans text-xs text-fg-muted"
          >
            {tech}
          </span>
        ))}
      </div>
    </Link>
  )
}
