'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { experiences } from '@/lib/data/experience'
import { easing } from '@/lib/constants'

gsap.registerPlugin(ScrollTrigger)

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easing.smooth } },
}

export function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sectionRef.current || !lineRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: 'top',
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            end: 'bottom 65%',
            scrub: 0.6,
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative z-20 bg-bg-elevated px-6 py-32 sm:px-10 lg:px-20"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-15%' }}
        variants={fadeUp}
        className="mx-auto mb-20 max-w-3xl"
      >
        <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
          Expériences
        </span>
        <h2 className="mt-4 font-serif text-4xl text-fg sm:text-5xl">Le terrain, aussi.</h2>
        <p className="mt-4 max-w-xl font-sans text-sm text-fg-muted">
          En parallèle de mes études, des expériences professionnelles qui m&apos;ont appris la
          rigueur, l&apos;autonomie et la relation client.
        </p>
      </motion.div>

      <div className="relative mx-auto max-w-3xl pl-10">
        <div className="absolute left-0 top-1 bottom-1 w-px bg-border-soft" />
        <div ref={lineRef} className="absolute left-0 top-1 bottom-1 w-px bg-accent" />

        <div className="flex flex-col gap-14">
          {experiences.map((exp) => (
            <motion.div
              key={exp.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-10%' }}
              variants={fadeUp}
              className="relative"
            >
              <span className="absolute -left-[2.65rem] top-1.5 h-3 w-3 rounded-full border-2 border-accent bg-bg-elevated" />

              <div className="flex flex-wrap items-center gap-3">
                <p className="font-sans text-xs uppercase tracking-wide text-accent">
                  {exp.period}
                </p>
                <span className="rounded-full border border-border-soft px-2.5 py-0.5 font-sans text-[10px] uppercase tracking-wide text-fg-muted">
                  {exp.type}
                </span>
                {exp.current && (
                  <span className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-wide text-accent">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> En cours
                  </span>
                )}
              </div>

              <h3 className="mt-2 font-serif text-2xl text-fg">{exp.role}</h3>
              <p className="mt-1 font-sans text-sm text-fg-muted">
                {exp.company} — {exp.location}
              </p>

              <ul className="mt-4 flex flex-col gap-1.5">
                {exp.description.map((line) => (
                  <li
                    key={line}
                    className="flex gap-2 font-sans text-sm leading-relaxed text-fg-muted"
                  >
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-fg-muted" />
                    {line}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
