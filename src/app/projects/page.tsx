import type { Metadata } from 'next'
import { ArrowUpRight } from 'lucide-react'
import { projects } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { getOtherRepos, getPublicRepos } from '@/lib/github'
import { PageIntro } from '@/components/ui/PageIntro'
import { PageTransition } from '@/components/ui/PageTransition'
import { Container, SectionHeading } from '@/components/ui/Section'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ProjectsExplorer } from '@/components/projects/ProjectsExplorer'
import { RepoList } from '@/components/projects/RepoList'

export const metadata: Metadata = {
  title: 'Projets',
  description:
    'Projets de Maxime Pero : supervision industrielle, sites vitrines, API REST, applications Vue, Electron et Flutter — avec code source sur GitHub.',
  alternates: { canonical: '/projects' },
}

export default async function ProjectsPage() {
  const [allRepos, otherRepos] = await Promise.all([getPublicRepos(), getOtherRepos()])
  const languages = new Set(allRepos.map((r) => r.language).filter(Boolean))

  const stats = [
    { value: projects.length, label: 'Projets' },
    { value: allRepos.length || '—', label: 'Dépôts' },
    { value: languages.size || '—', label: 'Langages' },
  ]

  return (
    <PageTransition>
      <main id="main">
        <PageIntro
          index="01"
          label="Projets"
          meta="Web · Back-end · Desktop · Mobile"
          title={
            <>
              Travaux<span className="text-orange">.</span>
            </>
          }
          lead="Des projets clients, des travaux de formation et des expérimentations personnelles. Chaque fiche précise le contexte, ce que j’ai réalisé et la stack."
          aside={
            <dl className="grid grid-cols-3 border-t-2 border-ink">
              {stats.map((s) => (
                <div key={s.label} className="flex min-w-0 flex-col-reverse gap-1 pt-4 pr-3">
                  <dt className="label text-[10px] text-muted">{s.label}</dt>
                  <dd className="display text-5xl">{String(s.value).padStart(2, '0')}</dd>
                </div>
              ))}
            </dl>
          }
        />

        <section aria-label="Galerie des projets" className="py-20 sm:py-28">
          <Container>
            <ProjectsExplorer />
          </Container>
        </section>

        <section aria-labelledby="repos-title" className="bg-dark py-24 text-cream sm:py-32">
          <Container>
            <SectionHeading
              index="02"
              label="Depuis GitHub"
              id="repos-title"
              tone="dark"
              title="Les autres dépôts."
              lead="Liste mise à jour automatiquement depuis mon profil GitHub public : exercices de formation, hackathon et premiers projets."
              action={
                <ButtonLink href={site.github} external variant="outline-light" icon={<ArrowUpRight size={16} />}>
                  Profil GitHub
                </ButtonLink>
              }
            />
            <RepoList repos={otherRepos} />
          </Container>
        </section>
      </main>
    </PageTransition>
  )
}
