import { DotSphere } from '@/components/fallback/DotSphere'
import { Button } from '@/components/ui/Kit'
import { projects } from '@/lib/data/projects'
import { skillCount } from '@/lib/data/skills'
import { G } from '@/components/ui/Glyph'

const pad = (n: number) => String(n).padStart(3, '0')

/**
 * Hero (100vh). Le texte est en HTML ; à droite, l'emplacement de la scène 3D (phase 2),
 * occupé pour l'instant par la sphère de points statique, qui reste la version de secours.
 */
export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative flex min-h-svh flex-col pt-[var(--header-h)]">
      <div className="ui mx-[var(--gutter)] flex flex-wrap justify-between gap-x-6 gap-y-2 pt-3">
        <p>
          [00] PORTFOLIO 2026 — DÉVELOPPEUR FULL-STACK — LYON<span className="caret">_</span>
        </p>
        <p className="flex items-center gap-2">
          <span aria-hidden className="size-[7px] bg-accent" />
          DISPONIBLE — ALTERNANCE &amp; FREELANCE
        </p>
      </div>

      <div className="relative grid flex-1 grid-cols-12 gap-x-6 px-[var(--gutter)]">
        {/* Emplacement de la scène 3D du hero (phase 2). */}
        <div
          data-scene="hero"
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-[var(--gutter)] flex w-[min(92vw,640px)] items-center opacity-20 lg:static lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:w-auto lg:opacity-100"
        >
          <DotSphere className="w-full" />
        </div>

        <div data-hero-text className="relative col-span-12 flex flex-col justify-center gap-10 py-16 will-change-transform lg:col-span-8 lg:col-start-1 lg:row-start-1">
          <h1 id="hero-title" className="pixel text-[clamp(2.3rem,9.4vw,8.5rem)] lg:text-[clamp(3rem,7vw,8.5rem)]">
            <span className="block">Des interfaces</span>
            <span className="block pl-[1.6em]">soignées,</span>
            <span className="block">un code qui</span>
            <span className="block pl-[0.8em]">
              tient la{' '}
              <span className="relative inline-block">
                route
                <span aria-hidden className="absolute -inset-x-[2%] -bottom-[0.12em] h-[0.09em] bg-accent" />
              </span>
              .
            </span>
          </h1>
          <div className="flex flex-wrap items-end gap-x-12 gap-y-8">
            <p className="max-w-[24rem] text-fg-2">
              Je conçois et je développe des sites, des applis web et des écrans industriels, en React, TypeScript et
              Node.js. En Bachelor Informatique à Ynov Lyon.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button href="/#work"><G>[→]</G> Voir les projets</Button>
              <Button href="/#contact" variant="text">
                M’écrire
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="ui flex flex-wrap items-end justify-between gap-4 px-[var(--gutter)] pb-7">
        <p className="text-fg-2">Défiler ↓</p>
        <p className="flex items-baseline gap-2.5">
          <span className="doto text-[1.75rem]">{pad(projects.length)}</span> projets ·{' '}
          <span className="doto text-[1.75rem]">{pad(skillCount)}</span> technos
        </p>
      </div>
    </section>
  )
}
