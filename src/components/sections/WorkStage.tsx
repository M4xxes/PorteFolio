'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'
import { projects } from '@/lib/data/projects'
import { setActiveProject, ui, useUI } from '@/lib/store'
import { getLenis, scrollToTarget } from '@/components/shell/ScrollEngine'
import { STEP_VH, measure, metrics } from '@/components/three/heroTimeline'
import { openRoom } from '@/components/room/RoomController'
import { Tag } from '@/components/ui/Kit'
import { WorkCounter, WorkList } from './WorkList'

const N = projects.length
const num = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Sélection en version complète : la section reste fixée pendant ~4 hauteurs d'écran
 * et le scroll fait tourner le carrousel 3D (dessiné par le canvas, derrière).
 * Tout ce qui est lisible ou cliquable est ici, en HTML : liste, lien d'ouverture, compteur.
 */
export function WorkStage() {
  const active = useUI((s) => s.work.active)
  const project = projects[active]

  useEffect(() => {
    measure()
    let timer = 0

    // Aimantation douce : une fois le défilement arrêté, on se cale sur le projet le plus proche.
    const snap = () => {
      if (!metrics.ready) return
      const { top, range, step } = metrics.work
      const y = ui.getState().scroll.y
      if (y <= top || y >= top + range) return
      const target = top + Math.round((y - top) / step) * step
      if (Math.abs(target - y) > 1) getLenis()?.scrollTo(target, { duration: 0.55, easing: (t) => 1 - Math.pow(1 - t, 3) })
    }

    const unsubscribe = ui.subscribe((s, prev) => {
      if (s.scroll === prev.scroll || !metrics.ready) return
      const { top, range } = metrics.work
      const p = Math.min(1, Math.max(0, (s.scroll.y - top) / range))
      setActiveProject(Math.round(p * (N - 1)))
      if (Math.abs(s.scroll.velocity) > 0.3) {
        clearTimeout(timer)
        timer = window.setTimeout(snap, 180)
      }
    })
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  // Clic sur une ligne : on fait défiler jusqu'au projet. Sur le projet déjà actif, on entre dans sa salle.
  const pick = (index: number, e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || !metrics.ready) return
    e.preventDefault()
    if (index === ui.getState().work.active) openRoom(index)
    else scrollToTarget(metrics.work.top + index * metrics.work.step)
  }

  // Clic sur l'écran actif : la caméra avance et on entre dans la salle (l'URL devient /projects/[slug]).
  const enter = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    openRoom(ui.getState().work.active)
  }

  return (
    <div data-scene="carousel" data-pinned data-count={N} style={{ height: `${100 + (N - 1) * STEP_VH * 100}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Nom du projet en fond : très grand, flou, à 5 %. */}
        <p
          aria-hidden
          className="pixel pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[clamp(9rem,19vw,17.5rem)] opacity-5 blur-[5px]"
        >
          {project.short.split(' ')[0]}
        </p>

        <div className="absolute left-[var(--gutter)] top-[calc(var(--header-h)+1.5rem)] flex w-[min(20rem,24vw)] flex-col gap-6">
          <Tag index="01">Travaux</Tag>
          <h2 id="work-title" className="pixel text-[clamp(2.5rem,4.2vw,3.75rem)]">
            Sélec-
            <br />
            tion
          </h2>
          <WorkList onPick={pick} />
        </div>

        <Link
          href={`/projects/${project.id}`}
          data-cursor="OUVRIR"
          onClick={enter}
          aria-label={`Ouvrir le projet ${project.title}`}
          className="screen-rect block"
        >
          <Image
            key={project.id}
            src={project.cover.src}
            alt=""
            width={project.cover.width}
            height={project.cover.height}
            sizes="42vw"
            className="screen-fallback h-full w-full object-cover object-left-top transition-opacity duration-200"
          />
        </Link>

        <p className="ui absolute bottom-8 left-[58%] -translate-x-1/2 whitespace-nowrap">
          [{num(active)}] {project.short}
          {project.cover.kind === 'illustration' && <span className="text-fg-3"> · Visuel</span>}
        </p>

        <div className="absolute bottom-7 right-[var(--gutter)] text-right">
          <WorkCounter />
        </div>
      </div>
    </div>
  )
}
