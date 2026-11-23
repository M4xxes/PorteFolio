'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import { categoryLabels, projects } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { reducedMotionQuery } from '@/lib/motion'
import { scrollToTarget, setScrollGuard } from '@/components/shell/ScrollEngine'
import { EYE_VH } from '@/components/intro/timing'
import './hub.css'

// three n'est chargé qu'après le premier rendu, côté client.
const Particles = dynamic(() => import('@/components/particles/Particles'), { ssr: false })

const pad = (n: number) => String(n).padStart(2, '0')
const ALL = 'Tous'

/** Filtres : « Tous », les catégories présentes, puis les technos partagées par au moins deux projets. */
const FILTERS = (() => {
  const cats = [...new Set(projects.map((p) => p.category))].map((c) => ({ label: categoryLabels[c], test: (p: (typeof projects)[number]) => p.category === c }))
  const count = new Map<string, number>()
  for (const p of projects) for (const t of new Set(p.stack)) count.set(t, (count.get(t) ?? 0) + 1)
  const techs = [...count.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([t]) => ({ label: t, test: (p: (typeof projects)[number]) => p.stack.includes(t) }))
  return [{ label: ALL, test: () => true }, ...cats, ...techs]
})()

const STACK = ['React · TypeScript · Next.js', 'Node.js · Express · API REST', 'SQL · MySQL · MongoDB', 'Tailwind CSS · Vite', 'Flutter · Electron', 'Git / GitHub · Netlify']

export function Hub() {
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState(ALL)

  const shown = useMemo(() => {
    const f = FILTERS.find((x) => x.label === filter) ?? FILTERS[0]
    return projects.filter(f.test)
  }, [filter])

  // Interactivité : l'interface ne répond que lorsque l'œil est entièrement dissous.
  useEffect(() => {
    const el = root.current!
    const pin = () => (EYE_VH - 0.05) * window.innerHeight
    let live = el.dataset.live === 'true'
    const sync = () => {
      const next = window.matchMedia(reducedMotionQuery).matches || ui.getState().scroll.y >= pin()
      if (next !== live) {
        live = next
        el.dataset.live = String(next)
      }
    }
    sync()
    const unsub = ui.subscribe(sync)
    window.addEventListener('resize', sync)
    return () => {
      unsub()
      window.removeEventListener('resize', sync)
    }
  }, [])

  // Défilement fluide à inertie sur la liste (bureau) + passage de relais à l'œil quand elle est tout en haut.
  useEffect(() => {
    const el = list.current!
    const desktop = window.matchMedia('(min-width: 761px)')
    const reduced = window.matchMedia(reducedMotionQuery)
    let lenis: Lenis | null = null
    let stop = () => {}

    const scroller = () => (desktop.matches ? el : (el.closest('.hub-body') as HTMLElement))
    // Au-dessus de l'œil, la page défile. Une fois dessous : seule la remontée depuis le haut de la liste rend la main à la page.
    setScrollGuard((dy) => {
      if (ui.getState().scroll.y < (EYE_VH - 0.05) * window.innerHeight) return true
      return dy < 0 && scroller().scrollTop <= 1
    })

    const setup = () => {
      stop()
      lenis?.destroy()
      lenis = null
      if (!desktop.matches || reduced.matches) return
      lenis = new Lenis({ wrapper: el, content: el.firstElementChild as HTMLElement, eventsTarget: el, lerp: 0.1, autoRaf: false })
      stop = addFrame((t) => lenis?.raf(t), 1)
    }
    setup()
    desktop.addEventListener('change', setup)
    return () => {
      desktop.removeEventListener('change', setup)
      stop()
      lenis?.destroy()
      setScrollGuard(null)
    }
  }, [])

  const choose = (label: string) => {
    setFilter(label)
    const el = list.current
    if (el) el.scrollTop = 0
  }

  return (
    <div ref={root} className="hub" data-live="false">
      <Particles />
      <div className="hub-ui">
        <a
          className="brand"
          href="/#top"
          aria-label={`${site.name} — retour à l’introduction`}
          onClick={(e) => {
            e.preventDefault()
            scrollToTarget(0)
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
            <circle cx="20" cy="20" r="18.5" stroke="#fff" strokeWidth="1.6" />
            <path d="M8.5 20c3-5.2 6.8-7.8 11.5-7.8S28.5 14.8 31.5 20c-3 5.2-6.8 7.8-11.5 7.8S11.5 25.2 8.5 20Z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="3.4" fill="#fff" />
          </svg>
          <div>
            <div className="name">{site.name}</div>
            <div className="sub">Développeur web</div>
          </div>
        </a>

        <div className="counter" aria-label={`${projects.length} projets`}>
          {pad(projects.length)}
        </div>

        <div className="hub-body">
          <div className="tags" role="group" aria-label="Filtrer les projets">
            {FILTERS.map((f) => (
              <button key={f.label} type="button" className="chip" aria-pressed={f.label === filter} onClick={() => choose(f.label)}>
                {f.label}
              </button>
            ))}
          </div>

          <div ref={list} className="list">
            <div className="list-inner">
              {shown.map((p, i) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="card" aria-label={`Ouvrir le projet ${p.title}`}>
                  <div className="thumb">
                    {p.video ? (
                      <video src={p.video.src} poster={p.video.poster} autoPlay muted loop playsInline preload="metadata" aria-hidden />
                    ) : (
                      <Image src={p.cover.src} alt="" width={p.cover.width} height={p.cover.height} sizes="320px" priority={i === 0} />
                    )}
                  </div>
                  <div className="meta">
                    <span>{`${p.title}\n${categoryLabels[p.category]}`}</span>
                    <span>{`${p.stack[0]}\n${p.year}`}</span>
                  </div>
                </Link>
              ))}
              {shown.length === 0 && <p className="empty">Aucun projet</p>}
            </div>
          </div>

          <div className="about">
            <section>
              <h2>[info]</h2>
              <p>Étudiant en B3 Informatique (développement web) à YNOV Lyon. Je conçois et je développe des sites et des applications web, du site vitrine à l’écran de supervision industrielle.</p>
            </section>
            <section>
              <h2>[objectifs]</h2>
              <p>Ce que je fais : des interfaces React et TypeScript, des API Node.js, de l’intégration soignée.</p>
              <p>Ce que je cherche : {site.availability.toLowerCase()}, sur des produits web exigeants.</p>
            </section>
            <section>
              <h2>[stack]</h2>
              <ul>
                {STACK.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>[contact]</h2>
              <a href={site.github} target="_blank" rel="noreferrer">
                GitHub -&gt; github.com/{site.githubUser}
              </a>
              <a href={`mailto:${site.email}`}>Mail -&gt; {site.email}</a>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
