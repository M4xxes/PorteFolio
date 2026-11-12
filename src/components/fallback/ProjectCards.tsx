'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { projects } from '@/lib/data/projects'
import { setActiveProject } from '@/lib/store'
import { G } from '@/components/ui/Glyph'

const num = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Projets en cartes 2D : capture, phrase-histoire, rôle, stack.
 * C'est la sélection sans 3D : version légère, tablette, et mobile (< 768 px), où les cartes
 * défilent horizontalement avec aimantation (scroll-snap).
 * La carte la plus visible devient le projet actif de la liste.
 */
export function ProjectCards() {
  const list = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const root = list.current!
    const items = [...root.querySelectorAll<HTMLElement>('[data-index]')]
    const mobile = window.matchMedia('(max-width: 767px)')
    let io: IntersectionObserver | null = null
    const observe = () => {
      io?.disconnect()
      const onEntries = (entries: IntersectionObserverEntry[]) => {
        for (const e of entries) if (e.isIntersecting) setActiveProject(Number((e.target as HTMLElement).dataset.index))
      }
      // Mobile : défilement horizontal dans la liste. Sinon : la carte qui passe au milieu de l'écran.
      io = mobile.matches
        ? new IntersectionObserver(onEntries, { root, threshold: 0.6 })
        : new IntersectionObserver(onEntries, { rootMargin: '-45% 0px -45% 0px' })
      items.forEach((el) => io!.observe(el))
    }
    observe()
    mobile.addEventListener('change', observe)
    return () => {
      io?.disconnect()
      mobile.removeEventListener('change', observe)
    }
  }, [])

  return (
    <ol
      ref={list}
      aria-label="Projets en détail"
      className="-mx-[var(--gutter)] flex snap-x snap-mandatory scroll-px-[var(--gutter)] gap-4 overflow-x-auto px-[var(--gutter)] pb-4 md:mx-0 md:snap-none md:flex-col md:gap-20 md:overflow-visible md:px-0 md:pb-0 lg:gap-28"
    >
      {projects.map((p, i) => (
        <li key={p.id} id={`projet-${p.id}`} data-index={i} className="w-[86%] shrink-0 snap-start md:w-auto">
          <article aria-labelledby={`card-${p.id}`}>
            <Link
              href={`/projects/${p.id}`}
              data-cursor="OUVRIR"
              tabIndex={-1}
              aria-hidden
              className="group relative block overflow-hidden bg-surface"
            >
              <Image
                src={p.cover.src}
                alt=""
                width={p.cover.width}
                height={p.cover.height}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="aspect-[16/10] w-full object-cover object-left-top"
              />
              {/* Désaturation par un calque (mix-blend) : au survol, seule l'opacité change. */}
              <span aria-hidden className="pointer-events-none absolute inset-0 bg-[#808080] opacity-35 mix-blend-saturation transition-opacity duration-200 group-hover:opacity-0" />
              <span aria-hidden className="screen-lines absolute inset-0" />
              {p.cover.kind === 'illustration' && <span className="ui absolute left-3 top-3 bg-bg px-2 py-1 text-fg-2">Visuel</span>}
            </Link>
            <div className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-[1fr_minmax(0,16rem)]">
              <div>
                <h3 id={`card-${p.id}`} className="ui flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <Link href={`/projects/${p.id}`} className="hover:text-accent">
                    <G>[{num(i)}]</G> {p.short}
                    <G> →</G>
                  </Link>
                  <span className="text-fg-2">{p.tag}</span>
                </h3>
                <p className="mt-4 max-w-[38rem] text-fg-2">{p.story}</p>
              </div>
              <dl className="ui flex flex-col gap-3 text-fg-2 md:border-l md:border-line md:pl-6">
                <div>
                  <dt className="text-fg-3">Rôle</dt>
                  <dd className="text-fg">{p.roleLine}</dd>
                </div>
                <div>
                  <dt className="text-fg-3">Stack</dt>
                  <dd>{p.stack.slice(0, 6).join(' / ')}</dd>
                </div>
              </dl>
            </div>
          </article>
        </li>
      ))}
    </ol>
  )
}
