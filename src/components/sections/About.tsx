'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { education } from '@/lib/data/education'
import { projects } from '@/lib/data/projects'
import { skillCategories } from '@/lib/data/skills'
import { site, easing } from '@/lib/constants'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'

const yearsExperience = new Date().getFullYear() - site.yearStarted
const totalSkills = skillCategories.reduce((acc, c) => acc + c.skills.length, 0)

const stats = [
  { label: 'Années de formation', value: Math.max(yearsExperience, 1), suffix: '+' },
  { label: 'Projets réalisés', value: projects.length, suffix: '' },
  { label: 'Technologies maîtrisées', value: totalSkills, suffix: '+' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.8, ease: easing.smooth },
  }),
}

export function About() {
  return (
    <section id="about" className="relative z-20 bg-bg px-6 py-32 sm:px-10 lg:px-20">
      <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        {/* Colonne gauche : photo + stats */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
          variants={fadeUp}
          className="flex flex-col gap-10 lg:sticky lg:top-32 lg:self-start"
        >
          <div
            data-cursor-hover
            className="group relative aspect-[4/5] w-full max-w-sm overflow-hidden transition-[border-radius] duration-700 ease-out"
            style={{ borderRadius: '58% 42% 38% 62% / 58% 36% 64% 42%' }}
          >
            <div className="absolute inset-0 origin-center scale-105 transition-transform duration-700 ease-out group-hover:scale-[1.15] group-hover:rotate-2">
              <Image
                src={site.photoUrl}
                alt={site.name}
                fill
                sizes="(min-width: 1024px) 24rem, 80vw"
                className="object-cover grayscale-[15%] transition-[filter] duration-700 group-hover:grayscale-0"
                priority
              />
            </div>
            <div className="absolute inset-0 bg-accent opacity-0 mix-blend-color transition-opacity duration-700 group-hover:opacity-25" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border-soft" />
          </div>

          <dl className="grid grid-cols-3 gap-6 border-t border-border-soft pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-serif text-4xl text-fg">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </dd>
                <dd className="mt-2 font-sans text-xs uppercase tracking-wide text-fg-muted">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Colonne droite : bio + timeline */}
        <div className="flex flex-col gap-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-15%' }}
            variants={fadeUp}
          >
            <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
              À propos
            </span>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-fg sm:text-5xl">
              Développeur full-stack, curieux par nature.
            </h2>
            <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-fg-muted">
              Actuellement en 3ème année de Bachelor Informatique à Ynov Campus Lyon,
              je me spécialise dans le développement web full-stack. J&apos;aime autant
              soigner une interface au pixel près que résoudre des problèmes techniques
              côté serveur — avec une préférence pour les projets où le design et
              l&apos;ingénierie se rencontrent.
            </p>
            <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-fg-muted">
              Autonome, rigoureux et toujours en veille technologique, j&apos;ai eu
              l&apos;occasion de travailler sur des projets clients réels — d&apos;un
              site vitrine à une interface de supervision industrielle.
            </p>
          </motion.div>

          <div className="relative flex flex-col gap-10 border-l border-border-soft pl-8">
            {education.map((item, i) => (
              <motion.div
                key={item.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-10%' }}
                variants={fadeUp}
                className="relative"
              >
                <span className="absolute -left-[2.28rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg" />
                <p className="font-sans text-xs uppercase tracking-wide text-accent">
                  {item.period}
                  {item.current && ' — en cours'}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-fg">{item.degree}</h3>
                <p className="mt-1 font-sans text-sm text-fg-muted">
                  {item.school} — {item.location}
                </p>
                {item.description && (
                  <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-fg-muted">
                    {item.description}
                  </p>
                )}
                {item.certification && (
                  <p className="mt-2 font-sans text-xs text-fg-muted/80">
                    {item.certification}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
