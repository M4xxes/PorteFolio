'use client'

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { site } from '@/lib/constants'
import { closeIntro, getIntroRun, isIntroOpen, subscribeIntro } from './introState'

declare global {
  interface Window {
    __introReady?: boolean
  }
}

// Deux mots, chacun découpé en lettres ; le point final porte l'orange.
const WORDS = [['M', 'A', 'X', 'I', 'M', 'E'], ['P', 'E', 'R', 'O', '.']]
const REVEAL_MS = 650
const EXIT_MS = 850

type Phase = 'idle' | 'reveal' | 'exit'

/**
 * Écran d'introduction plein format (première visite de l'accueil, une fois par session).
 * Une seule idée de transition : le bouton « Entrer » s'étend en disque orange jusqu'à couvrir
 * l'écran, puis le panneau remonte et révèle le Hero.
 */
export function Intro() {
  const open = useSyncExternalStore(subscribeIntro, isIntroOpen, () => false)
  const run = useSyncExternalStore(subscribeIntro, getIntroRun, () => 0)
  const [phase, setPhase] = useState<Phase>('idle')
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => {
    window.__introReady = true
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  // Pendant l'introduction : le reste du site est inerte et le focus va sur « Entrer ».
  useEffect(() => {
    if (!open) return
    const site = document.getElementById('site')
    site?.setAttribute('inert', '')
    buttonRef.current?.focus({ preventScroll: true })
    return () => site?.removeAttribute('inert')
  }, [open])

  // Les lettres s'épaississent et s'élargissent à l'approche du pointeur (axes variables wght / wdth).
  useEffect(() => {
    if (!open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const pointer = { x: -9999, y: -9999 }
    const update = () => {
      raf = 0
      lettersRef.current.forEach((el) => {
        if (!el) return
        const r = el.getBoundingClientRect()
        const d = Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2))
        const t = Math.max(0, 1 - d / Math.max(r.width * 2.2, 220))
        el.style.fontVariationSettings = `"wght" ${Math.round(500 + t * 300)}, "wdth" ${Math.round(78 + t * 22)}`
      })
    }
    const onMove = (e: PointerEvent) => {
      pointer.x = e.clientX
      pointer.y = e.clientY
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
    }
  }, [open])

  const enter = () => {
    if (phase !== 'idle') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      closeIntro()
      return
    }
    const rect = buttonRef.current?.getBoundingClientRect()
    const root = rootRef.current
    if (rect && root) {
      root.style.setProperty('--cx', `${rect.left + rect.width / 2}px`)
      root.style.setProperty('--cy', `${rect.top + rect.height / 2}px`)
    }
    setPhase('reveal')
    // Minuteries plutôt qu'événements d'animation : l'introduction se ferme toujours, même si une animation échoue.
    timers.current.push(
      window.setTimeout(() => setPhase('exit'), REVEAL_MS),
      window.setTimeout(() => {
        closeIntro()
        setPhase('idle')
      }, REVEAL_MS + EXIT_MS)
    )
  }

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-title"
      data-phase={phase}
      className="intro fixed inset-0 z-[200] flex-col overflow-hidden bg-cream text-ink transition-transform ease-[cubic-bezier(0.76,0,0.24,1)] data-[phase=exit]:-translate-y-full"
      style={{ transitionDuration: `${EXIT_MS}ms` }}
    >
      {/* Trame éditoriale */}
      <div aria-hidden className="pointer-events-none absolute inset-0 grid grid-cols-4 px-5 sm:grid-cols-6 sm:px-8 lg:px-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className={`border-l border-line ${i >= 4 ? 'hidden sm:block' : ''}`} />
        ))}
      </div>

      <div className="relative flex items-start justify-between gap-6 px-5 pt-6 sm:px-8 lg:px-10">
        <p className="label">Portfolio — 2026</p>
        <p className="label hidden text-muted sm:block">
          {site.name} · Développeur full-stack
        </p>
        <p className="label text-muted">Lyon, FR — 2026</p>
      </div>

      <div key={run} className="relative flex flex-1 flex-col justify-center px-5 sm:px-8 lg:px-10">
        <h2
          id="intro-title"
          aria-label={site.name}
          className="display flex select-none flex-wrap gap-x-[0.22em] text-[clamp(4rem,30vw,9rem)] leading-[0.84] sm:flex-nowrap sm:whitespace-nowrap sm:text-[clamp(5rem,22.5vw,26rem)]"
        >
          {WORDS.map((word, w) => (
            <span key={w} className="flex" aria-hidden>
              {word.map((letter, l) => {
                const i = w * WORDS[0].length + l
                return (
                  <span key={l} className="line-mask">
                    <span
                      ref={(el) => {
                        lettersRef.current[i] = el
                      }}
                      className={`transition-[font-variation-settings] duration-300 ${letter === '.' ? 'text-orange' : ''}`}
                      style={{ '--delay': `${120 + i * 55}ms`, fontVariationSettings: '"wght" 500, "wdth" 78' } as CSSProperties}
                    >
                      {letter}
                    </span>
                  </span>
                )
              })}
            </span>
          ))}
        </h2>
        <div className="animate-rise mt-6 grid gap-4 sm:mt-8 sm:grid-cols-6" style={{ '--delay': '650ms' } as CSSProperties}>
          <p className="max-w-sm text-base leading-snug text-ink sm:col-span-3 sm:text-lg lg:col-span-2">
            Développeur full-stack à Lyon. Interfaces, applications web et code soigné.
          </p>
        </div>
      </div>

      <div className="relative flex items-end justify-between gap-6 px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10">
        <p className="label hidden max-w-[16rem] leading-relaxed text-muted sm:block">
          Survolez les lettres. Cliquez sur « Entrer » ou appuyez sur Entrée.
        </p>
        <p className="label max-w-[10rem] leading-relaxed text-muted sm:hidden">Touchez « Entrer » pour découvrir le site.</p>

        <button
          ref={buttonRef}
          type="button"
          data-intro-enter
          onClick={enter}
          aria-label="Entrer dans le portfolio"
          className="group relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full sm:h-40 sm:w-40"
        >
          {/* Texte circulaire : indique que l'écran est interactif */}
          <svg aria-hidden viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-[spin_16s_linear_infinite]">
            <defs>
              <path id="intro-circle" d="M50,50 m-42,0 a42,42 0 1,1 84,0 a42,42 0 1,1 -84,0" />
            </defs>
            <text className="fill-ink font-mono text-[7.4px] uppercase tracking-[0.32em]">
              <textPath href="#intro-circle">Portfolio · Maxime Pero · 2026 ·</textPath>
            </text>
          </svg>
          <span className="relative flex h-[62%] w-[62%] items-center justify-center rounded-full bg-orange text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-active:scale-95">
            <span className="flex flex-col items-center gap-1">
              <span className="font-display text-sm font-bold tracking-[0.12em] sm:text-base">ENTRER</span>
              <ArrowRight size={16} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </span>
        </button>
      </div>

      {/* Disque orange qui s'étend depuis le bouton */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center bg-orange text-ink transition-[clip-path] ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{
          transitionDuration: `${REVEAL_MS}ms`,
          clipPath:
            phase === 'idle'
              ? 'circle(0px at var(--cx, 85%) var(--cy, 85%))'
              : 'circle(150vmax at var(--cx, 85%) var(--cy, 85%))',
        }}
      >
        <span className="display text-[clamp(3rem,12vw,10rem)]">Bienvenue.</span>
      </div>
    </div>
  )
}
