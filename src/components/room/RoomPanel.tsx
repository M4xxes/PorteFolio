'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { projects } from '@/lib/data/projects'
import { roomScreens } from '@/lib/data/roomScreens'
import { site } from '@/lib/constants'
import { ui, useUI } from '@/lib/store'
import { poke } from '@/components/three/heroTimeline'
import { room, roomActions } from '@/components/three/roomState'
import { Ext, G } from '@/components/ui/Glyph'

const N = projects.length
const num = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Panneau d'infos de la salle, en HTML par-dessus le canvas :
 * PROJET · INFO · RÔLE · miniatures (elles font glisser la caméra vers l'écran choisi) · projets voisins.
 */
export function RoomPanel({ index }: { index: number }) {
  const focus = useUI((s) => s.roomFocus)
  const ref = useRef<HTMLElement>(null)

  // La caméra cadre la salle au-dessus du panneau : on lui transmet sa hauteur.
  useEffect(() => {
    const el = ref.current!
    const ro = new ResizeObserver(() => {
      room.panelH = el.offsetHeight
      poke()
    })
    ro.observe(el)
    return () => {
      ro.disconnect()
      room.panelH = 0
    }
  }, [])
  const project = projects[index]
  const screens = roomScreens(project)
  const prev = (index - 1 + N) % N
  const next = (index + 1) % N
  const repoHref = project.repo ? `${site.github}/${project.repo}` : undefined

  const look = (i: number) => {
    ui.setState({ roomFocus: focus === i ? -1 : i })
    poke()
  }
  const go = (delta: number) => (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    roomActions.go(delta)
  }

  return (
    <section
      ref={ref}
      aria-label={`Projet ${project.title}`}
      data-instant={room.instant}
      data-lenis-prevent
      className="room-panel fixed inset-x-0 bottom-0 z-[85] max-h-[46svh] overflow-y-auto border-t border-line bg-bg/95 px-[var(--gutter)] pb-6 pt-5"
    >
      <div className="grid gap-x-6 gap-y-6 lg:grid-cols-12">
        <div className="lg:col-span-3">
          <p className="ui text-fg-3">
            Projet <span className="doto text-base text-fg">{num(index)}</span> / {String(N).padStart(2, '0')}
          </p>
          <h1 key={project.id} className="pixel mt-3 text-[clamp(1.75rem,2.6vw,2.75rem)]">
            {project.title}
          </h1>
        </div>

        <div className="lg:col-span-4">
          <p className="ui text-fg-3">Info</p>
          <p className="mt-3 text-[0.8125rem] leading-[1.6] text-fg-2">{project.story}</p>
          <p className="ui mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                <G>[</G>Voir le site<Ext />
                <G>]</G>
              </a>
            )}
            {repoHref && (
              <a href={repoHref} target="_blank" rel="noreferrer" className="hover:text-accent">
                GitHub<Ext />
              </a>
            )}
          </p>
        </div>

        <div className="lg:col-span-2">
          <p className="ui text-fg-3">Rôle</p>
          <p className="ui mt-3">{project.roleLine}</p>
          <p className="ui mt-3 text-fg-2">{project.stack.slice(0, 6).join(' / ')}</p>
        </div>

        <div className="flex flex-col justify-between gap-5 lg:col-span-3">
          <ul className="flex gap-2" aria-label="Écrans de la salle">
            {screens.map((s, i) =>
              s.image ? (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => look(i)}
                    aria-pressed={focus === i}
                    aria-label={`Regarder l’écran « ${s.label} »`}
                    className={`press block border ${focus === i ? 'border-accent' : 'border-line-strong opacity-70 hover:opacity-100'}`}
                  >
                    <Image
                      src={s.image.src}
                      alt=""
                      width={s.image.width}
                      height={s.image.height}
                      sizes="96px"
                      className="h-14 w-[5.5rem] object-cover object-left-top grayscale"
                    />
                    <span className="ui block px-1.5 py-1 text-left text-[0.625rem] text-fg-2">{s.label}</span>
                  </button>
                </li>
              ) : null
            )}
          </ul>
          <p className="ui flex justify-between gap-4">
            <a href={`/projects/${projects[prev].id}`} onClick={go(-1)} className="nudge inline-flex min-h-11 items-center gap-[0.6em] hover:text-accent">
              <G>←</G>{num(prev)} {projects[prev].short.split(' ')[0]}
            </a>
            <a href={`/projects/${projects[next].id}`} onClick={go(1)} className="nudge inline-flex min-h-11 items-center gap-[0.6em] text-right hover:text-accent">
              {num(next)} {projects[next].short.split(' ')[0]}<G>→</G>
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
