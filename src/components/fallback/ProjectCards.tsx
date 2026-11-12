'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { projects } from '@/lib/data/projects'
import { setActiveProject } from '@/lib/store'

const num = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Projets en cartes 2D : capture, phrase-histoire, rôle, stack.
 * C'est le contenu de la sélection sans 3D (et la version légère, phase 5).
 * La carte au centre de l'écran devient le projet actif de la liste.
 */
export function ProjectCards() {
  const list = useRef<HTMLOListElement>(null)

  useEffect(() => {
    const items = [...list.current!.querySelectorAll<HTMLElement>('[data-index]')]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActiveProject(Number((e.target as HTMLElement).dataset.index))
      },
      { rootMargin: '-45% 0px -45% 0px' }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <ol ref={list} className="flex flex-col gap-20 lg:gap-28">
      {projects.map((p, i) => (
        <li key={p.id} id={`projet-${p.id}`} data-index={i} className="scroll-mt-28">
          <article aria-labelledby={`card-${p.id}`}>
            <Link
              href={`/projects/${p.id}`}
              data-cursor="OUVRIR"
              data-scene-target={i === 0 ? 'first-screen' : undefined}
              tabIndex={-1}
              aria-hidden
              className="screen-card group relative block overflow-hidden bg-surface"
            >
              <Image
                src={p.cover.src}
                alt=""
                width={p.cover.width}
                height={p.cover.height}
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="aspect-[16/10] w-full object-cover object-left-top grayscale-[0.35] transition-[filter] duration-200 group-hover:grayscale-0"
              />
              <span aria-hidden className="screen-lines absolute inset-0" />
              {p.cover.kind === 'illustration' && <span className="ui absolute left-3 top-3 bg-bg px-2 py-1 text-fg-2">Visuel</span>}
            </Link>
            <div className="mt-4 grid gap-x-8 gap-y-4 md:grid-cols-[1fr_minmax(0,16rem)]">
              <div>
                <h3 id={`card-${p.id}`} className="ui flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <Link href={`/projects/${p.id}`} className="hover:text-accent">
                    [{num(i)}] {p.short} →
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
