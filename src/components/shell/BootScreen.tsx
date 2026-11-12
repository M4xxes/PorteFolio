'use client'

import { useEffect, useRef, useState } from 'react'
import { projects } from '@/lib/data/projects'
import { BOOT_STORAGE_KEY } from '@/lib/motion'

const MAX_MS = 1500
const BLOCKS = 20

declare global {
  interface Window {
    __bootReady?: boolean
  }
}

type Task = { label: string; done: number; total: number }

/**
 * Écran de démarrage (≤ 1,5 s, une fois par session).
 * Le compteur suit de vraies étapes : polices chargées, captures des projets téléchargées.
 * La scène 3D s'y ajoutera en phase 2. Clic, Entrée ou défilement : on entre tout de suite.
 */
export function BootScreen() {
  const [on, setOn] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    { label: 'INTERFACE', done: 0, total: 1 },
    { label: `${String(projects.length).padStart(3, '0')} PROJETS`, done: 0, total: projects.length },
  ])
  const [shown, setShown] = useState(0)
  const left = useRef(false)

  useEffect(() => {
    window.__bootReady = true
    const html = document.documentElement
    if (html.dataset.boot !== 'on') return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- l'état dépend d'un attribut posé avant l'hydratation
    setOn(true)
    const site = document.getElementById('site')
    if (site) site.inert = true

    const mark = (i: number, n = 1) =>
      setTasks((t) => t.map((task, k) => (k === i ? { ...task, done: Math.min(task.total, task.done + n) } : task)))

    document.fonts.ready.then(() => mark(0))
    for (const p of projects) {
      const img = new Image()
      img.onload = img.onerror = () => mark(1)
      img.src = p.cover.src
    }

    const leave = () => {
      if (left.current) return
      left.current = true
      setLeaving(true)
      try {
        sessionStorage.setItem(BOOT_STORAGE_KEY, '1')
      } catch {}
      setTimeout(() => {
        html.removeAttribute('data-boot')
        if (site) site.inert = false
        setOn(false)
      }, 280)
    }
    const timer = setTimeout(leave, Math.max(0, MAX_MS - performance.now()))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') leave()
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', leave, { passive: true })
    window.addEventListener('touchmove', leave, { passive: true })
    window.addEventListener('pointerdown', leave)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('wheel', leave)
      window.removeEventListener('touchmove', leave)
      window.removeEventListener('pointerdown', leave)
    }
  }, [])

  const target = Math.round((tasks.reduce((a, t) => a + t.done / t.total, 0) / tasks.length) * 100)

  // Le chiffre affiché rattrape la vraie progression, sans jamais la dépasser.
  useEffect(() => {
    if (!on || shown >= target) return
    const id = requestAnimationFrame(() => setShown((v) => Math.min(target, v + Math.max(1, Math.ceil((target - v) / 6)))))
    return () => cancelAnimationFrame(id)
  }, [on, shown, target])

  if (!on) return <div className="boot" hidden />

  const lit = Math.round((shown / 100) * BLOCKS)

  return (
    <div
      className="boot fixed inset-0 z-[300] flex-col justify-between bg-bg px-[var(--gutter)] py-7"
      data-leaving={leaving}
      aria-label="Démarrage du portfolio"
      role="region"
    >
      <div className="ui flex justify-between">
        <p>MAXIME PERO — PORTFOLIO 2026</p>
        <p className="text-fg-2">LYON, FR</p>
      </div>

      <div className="flex flex-col items-center gap-7">
        <p className="ui tracking-[0.2em] text-fg-2">CHARGEMENT</p>
        <p className="doto text-[clamp(7rem,15vw,13.75rem)] leading-[0.8]" aria-live="off">
          {String(shown).padStart(3, '0')}
        </p>
        <div aria-hidden className="grid w-[min(520px,80vw)] grid-cols-[repeat(20,minmax(0,1fr))] gap-1">
          {Array.from({ length: BLOCKS }, (_, i) => (
            <span key={i} className={`block h-3.5 ${i < lit ? (i === lit - 1 ? 'bg-accent' : 'bg-fg') : 'bg-line'}`} />
          ))}
        </div>
        <p className="ui flex items-center gap-3">
          <button type="button" className="press border border-fg px-4.5 py-3.5 tracking-[0.14em] hover:bg-fg hover:text-bg">
            [ ENTRÉE ]
          </button>
          <span>
            POUR COMMENCER<span className="caret">_</span>
          </span>
        </p>
      </div>

      <div className="ui flex items-end justify-between gap-6 leading-[1.9] text-fg-2">
        <ul>
          {tasks.map((t) => (
            <li key={t.label}>
              &gt; {t.label.padEnd(14, '.')}{' '}
              <span className="text-fg">
                {t.done >= t.total ? 'OK' : t.total > 1 ? `${String(t.done).padStart(2, '0')}/${String(t.total).padStart(2, '0')}` : 'EN COURS'}
              </span>
            </li>
          ))}
        </ul>
        <p>SON : OFF</p>
      </div>
    </div>
  )
}
