'use client'

import { useEffect, useRef } from 'react'
import { site } from '@/lib/constants'
import { projects } from '@/lib/data/projects'
import { ui } from '@/lib/store'
import { reducedMotionQuery } from '@/lib/motion'
import { scrollToTarget } from '@/components/shell/ScrollEngine'
import { EYE_VH } from '@/components/intro/timing'
import './hub.css'

const pad = (n: number) => String(n).padStart(2, '0')
const STACK = ['React · TypeScript · Next.js', 'Node.js · Express · API REST', 'SQL · MySQL · MongoDB', 'Tailwind CSS · Vite', 'Flutter · Electron', 'Git / GitHub · Netlify']

/**
 * Interface de l'accueil, par-dessus le nuage et la sphère : marque, compteur, colonne de texte.
 * Chaque bloc est positionné individuellement (pas de conteneur) pour que `mix-blend-mode: plus-lighter`
 * se mélange directement avec le canvas des particules, derrière.
 */
export function Hub() {
  const root = useRef<HTMLDivElement>(null)

  // Interactivité : l'interface ne répond que lorsque l'œil est entièrement dissous.
  useEffect(() => {
    const el = root.current!
    const pin = () => (EYE_VH - 0.05) * window.innerHeight
    let live = el.dataset.live === 'true'
    const sync = () => {
      const next = window.matchMedia(reducedMotionQuery).matches ? ui.getState().scroll.y >= window.innerHeight * 0.9 : ui.getState().scroll.y >= pin()
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

  return (
    <div ref={root} className="hub" data-live="false">
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
  )
}
