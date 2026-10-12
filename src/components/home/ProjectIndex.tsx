'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'
import { categoryLabels } from '@/lib/data/projects'
import { easing } from '@/lib/constants'

/**
 * Index typographique de tous les projets. Sur les écrans avec survol, un aperçu de l'image
 * suit le curseur ; sur écran tactile, chaque ligne affiche directement sa vignette.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 30, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 260, damping: 30, mass: 0.6 })

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    x.set(e.clientX)
    y.set(e.clientY)
  }

  return (
    <div onPointerMove={onMove} onPointerLeave={() => setActive(null)} className="relative">
      <ul className="group/list border-t border-dark-line">
        {projects.map((project, i) => (
          <li
            key={project.id}
            onPointerEnter={(e) => e.pointerType === 'mouse' && setActive(project)}
            className="border-b border-dark-line transition-opacity duration-300 [@media(hover:hover)]:group-hover/list:opacity-35 [@media(hover:hover)]:hover:!opacity-100"
          >
            <Link
              href={`/projects/${project.id}`}
              className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 py-5 sm:grid-cols-[4rem_1fr_9rem_5rem_2rem] sm:py-7"
            >
              <span className="font-mono text-xs text-dark-muted">{String(i + 1).padStart(2, '0')}</span>
              <span className="display text-[clamp(1.9rem,4.6vw,4.25rem)] leading-[0.95] transition-[color,translate] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-3 group-hover:text-orange group-focus-visible:text-orange">
                {project.title}
              </span>
              <span className="relative block aspect-[4/3] w-20 overflow-hidden bg-ink-soft [@media(hover:hover)]:hidden">
                <Image src={project.cover.src} alt="" fill sizes="5rem" className="object-cover object-left-top" />
              </span>
              <span className="label hidden text-dark-muted sm:block">{categoryLabels[project.category]}</span>
              <span className="label hidden text-dark-muted sm:block">{project.year}</span>
              <ArrowUpRight
                size={22}
                aria-hidden
                className="hidden text-dark-muted transition-[color,rotate] duration-300 group-hover:rotate-45 group-hover:text-orange sm:block"
              />
            </Link>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active && (
          <motion.div
            aria-hidden
            className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[22rem] [@media(hover:hover)]:block"
            style={{ x: sx, y: sy, translateX: '-50%', translateY: '-110%' }}
            initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.35, ease: easing.smooth }}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-ink-soft shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active.id}
                  className="absolute inset-0"
                  initial={{ clipPath: 'inset(100% 0 0 0)' }}
                  animate={{ clipPath: 'inset(0% 0 0 0)' }}
                  transition={{ duration: 0.5, ease: easing.inOut }}
                >
                  <Image src={active.cover.src} alt="" fill sizes="22rem" className="object-cover object-left-top" />
                </motion.div>
              </AnimatePresence>
              {active.cover.kind === 'illustration' && (
                <span className="label absolute bottom-2 left-2 bg-ink/80 px-2 py-1 text-[9px] text-cream">Illustration</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
