'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { site } from '@/lib/constants'
import { easing } from '@/lib/constants'

const HeroScene = dynamic(() => import('@/components/3d/HeroScene').then((m) => m.HeroScene), {
  ssr: false,
})

const letterVariants = {
  hidden: { y: '110%' },
  visible: (i: number) => ({
    y: '0%',
    transition: { delay: 0.06 * i, duration: 1, ease: easing.smooth },
  }),
}

function RevealText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`flex w-full flex-wrap justify-center overflow-hidden ${className ?? ''}`}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={letterVariants}
          initial="hidden"
          animate="visible"
          className="inline-block"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </span>
  )
}

export function Hero({ ready }: { ready: boolean }) {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="sticky top-0 h-screen w-full">
        {ready && <HeroScene />}

        <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          {ready && (
            <>
              <p className="mb-4 font-sans text-xs uppercase tracking-[0.4em] text-fg-muted">
                {site.role} — {site.location}
              </p>
              <h1
                className="w-full font-serif text-[clamp(2.5rem,10vw,6.5rem)] leading-[0.95] text-fg"
                style={{ textShadow: '0 4px 40px rgba(0,0,0,0.55)' }}
              >
                <RevealText text={site.name} />
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: easing.smooth }}
                className="mt-6 max-w-md font-sans text-sm text-fg-muted sm:text-base"
              >
                Je conçois et développe des expériences web sur-mesure, du prototype au produit final.
              </motion.p>
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
        >
          <div className="flex flex-col items-center gap-2 text-fg-muted">
            <span className="font-sans text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <span className="h-10 w-px animate-pulse bg-fg-muted" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
