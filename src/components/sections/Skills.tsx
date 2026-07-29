'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { skillCategories } from '@/lib/data/skills'
import { categoryColors } from '@/lib/skillColors'
import { easing } from '@/lib/constants'
import { useIsTouch } from '@/hooks/useIsTouch'

const SkillsCloud = dynamic(
  () => import('@/components/3d/SkillsCloud').then((m) => m.SkillsCloud),
  { ssr: false }
)

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easing.smooth } },
}

export function Skills() {
  const isTouch = useIsTouch()

  return (
    <section id="skills" className="relative z-20 overflow-hidden bg-bg-elevated px-6 py-32 sm:px-10 lg:px-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-15%' }}
        variants={fadeUp}
        className="mx-auto mb-4 max-w-6xl text-center"
      >
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
          Compétences
        </span>
        <h2 className="mt-4 font-serif text-4xl text-fg sm:text-5xl">
          Une stack pensée pour construire vite, proprement.
        </h2>
        <p className="mx-auto mt-4 max-w-lg font-sans text-sm text-fg-muted">
          {isTouch ? 'Glissez pour explorer le nuage.' : 'Survolez ou faites glisser pour explorer le nuage.'}
        </p>
      </motion.div>

      <div className="relative mx-auto h-[70vh] max-w-5xl">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 6.5], fov: 45 }}
          className="!absolute inset-0"
        >
          <Suspense fallback={null}>
            <SkillsCloud interactive />
          </Suspense>
        </Canvas>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-15%' }}
        variants={fadeUp}
        className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3"
      >
        {skillCategories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: categoryColors[cat.id] ?? '#a855f7' }}
            />
            <span className="font-sans text-xs uppercase tracking-wide text-fg-muted">
              {cat.label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
