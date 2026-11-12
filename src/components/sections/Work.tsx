import { ProjectCards } from '@/components/fallback/ProjectCards'
import { Container, Tag } from '@/components/ui/Kit'
import { WorkCounter, WorkList } from './WorkList'

/**
 * Sélection de projets. À gauche, la liste fixée (vraie navigation) ;
 * à droite, l'emplacement du carrousel 3D (phase 3), occupé par les cartes 2D.
 */
export function Work() {
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
        <div data-scene="carousel" className="lg:col-span-8">
          <ProjectCards />
        </div>
      </Container>
    </section>
  )
}
