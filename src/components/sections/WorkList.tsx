'use client'

import Link from 'next/link'
import { projects } from '@/lib/data/projects'
import { useUI } from '@/lib/store'

const num = (i: number) => String(i + 1).padStart(2, '0')

/**
 * Liste des projets : la vraie navigation de la sélection (liens accessibles).
 * Le projet actif (celui à l'écran) porte la puce accent ; les autres sont en gris.
 */
export function WorkList() {
  const active = useUI((s) => s.work.active)
  return (
    <nav aria-label="Projets">
      <ol className="flex flex-col">
        {projects.map((p, i) => {
          const on = i === active
          return (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                aria-current={on ? 'true' : undefined}
                className={`ui nudge flex min-h-9 items-center gap-2.5 py-1.5 ${on ? 'text-fg' : 'text-fg-3'}`}
              >
                <span aria-hidden className={`size-[7px] shrink-0 ${on ? 'bg-accent' : 'bg-transparent'}`} />
                [{num(i)}] {p.short}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Compteur « 03 / 07 » et étiquette du projet actif. */
export function WorkCounter() {
  const active = useUI((s) => s.work.active)
  const p = projects[active]
  return (
    <div aria-hidden className="flex flex-col gap-2">
      <p className="ui text-fg-2">{p.tag}</p>
      <p className="doto text-[2.75rem]">
        {num(active)}
        <span className="text-fg-3"> / {String(projects.length).padStart(2, '0')}</span>
      </p>
    </div>
  )
}
