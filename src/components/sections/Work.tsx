'use client'

import { ProjectCards } from '@/components/fallback/ProjectCards'
import { Container, Tag } from '@/components/ui/Kit'
import { useUI } from '@/lib/store'
import { WorkCounter, WorkList } from './WorkList'
import { WorkStage } from './WorkStage'

/**
 * Sélection de projets.
 * Version complète (3D) : section fixée + carrousel piloté par le scroll (`WorkStage`).
 * Sinon (rendu serveur, mobile, version légère) : liste fixée à gauche et cartes 2D.
 */
export function Work() {
  const full = useUI((s) => s.quality === 'full')

  if (full)
    return (
      // scroll-margin nul : l'ancre #work doit s'arrêter pile là où la section se fixe (fin de la transition du hero).
      <section id="work" aria-labelledby="work-title" style={{ scrollMarginTop: 0 }}>
        <WorkStage />
      </section>
    )

  return (
    <section id="work" aria-labelledby="work-title" className="py-28 lg:py-40">
      <Container className="grid gap-x-6 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="flex flex-col gap-8 border-t border-line pt-3 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <Tag index="01">Travaux</Tag>
            <h2 id="work-title" className="pixel text-[clamp(2.75rem,5vw,4.5rem)]">
              Sélec-
              <br />
              tion
            </h2>
            <WorkList />
            <div className="hidden lg:block">
              <WorkCounter />
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <ProjectCards />
        </div>
      </Container>
    </section>
  )
}
