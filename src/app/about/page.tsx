import Image from 'next/image'
import type { Metadata } from 'next'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { site } from '@/lib/constants'
import { education } from '@/lib/data/education'
import { experiences } from '@/lib/data/experience'
import { interests } from '@/lib/data/interests'
import { languages, otherLanguages, skillCategories, softSkills } from '@/lib/data/skills'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { MaskReveal } from '@/components/ui/MaskReveal'
import { PageIntro } from '@/components/ui/PageIntro'
import { PageTransition } from '@/components/ui/PageTransition'
import { Reveal } from '@/components/ui/Reveal'
import { Container, SectionHeading } from '@/components/ui/Section'

export const metadata: Metadata = {
  title: 'À propos',
  description:
    'Parcours, compétences et CV de Maxime Pero, développeur full-stack en Bachelor Informatique à Ynov Campus Lyon.',
  alternates: { canonical: '/about' },
}

const principles = [
  {
    title: 'Le détail compte',
    text: 'Une interface se juge à ses espacements, ses états de chargement et ses messages d’erreur autant qu’à sa maquette.',
  },
  {
    title: 'Du front au back',
    text: 'Comprendre toute la chaîne — interface, API, données — pour prendre les bonnes décisions de part et d’autre.',
  },
  {
    title: 'Autonomie & rigueur',
    text: 'Organisé et fiable, habitué à avancer seul comme en équipe, y compris sur des projets clients réels.',
  },
  {
    title: 'Curiosité',
    text: 'L’envie d’essayer : Vue, Electron, Flutter, canvas génératif… chaque projet en apprend un peu plus.',
  },
]

type Row = { period: string; title: string; place: string; badge?: string; current?: boolean; details?: string[] }

const path: { label: string; rows: Row[] }[] = [
  {
    label: 'Formation',
    rows: education.map((e) => ({
      period: e.period,
      title: e.degree,
      place: `${e.school} — ${e.location}`,
      current: e.current,
      details: [e.description, e.certification].filter(Boolean) as string[],
    })),
  },
  {
    label: 'Expériences',
    rows: experiences.map((e) => ({
      period: e.period,
      title: e.role,
      place: `${e.company} — ${e.location}`,
      badge: e.type,
      current: e.current,
      details: e.description,
    })),
  },
]

export default function AboutPage() {
  return (
    <PageTransition>
      <main id="main">
        <PageIntro
          index="02"
          label="À propos"
          meta={`${site.name} · ${site.location}`}
          title={
            <>
              Maxime Pero<span className="text-orange">.</span>
            </>
          }
          lead={
            <>
              Étudiant en Bachelor Informatique à Ynov Campus Lyon, je me spécialise dans le développement web
              full-stack. J’aime autant soigner une interface au pixel près que résoudre un problème côté serveur — avec
              une préférence pour les projets où le design et l’ingénierie se rencontrent.
            </>
          }
          aside={
            <div className="relative ml-auto max-w-[20rem]">
              <div aria-hidden className="absolute -right-3 -top-3 h-full w-full bg-orange" />
              <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                <Image src={site.photoUrl} alt={`Portrait de ${site.name}`} fill priority sizes="20rem" className="object-cover grayscale" />
              </div>
              <p className="label mt-3 text-[10px] text-muted">fig. — {site.name}, {site.location}</p>
            </div>
          }
        >
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <ButtonLink href="#cv" icon={<ArrowDown size={16} />}>
              Voir mon CV
            </ButtonLink>
            <ButtonLink href="/contact" variant="text">
              Me contacter
            </ButtonLink>
          </div>
        </PageIntro>

        {/* Parcours : tableau éditorial */}
        <section aria-labelledby="path-title" className="py-24 sm:py-32">
          <Container>
            <SectionHeading
              index="01"
              label="Parcours"
              id="path-title"
              title="Formation et expériences."
              lead="Une formation en développement et, en parallèle, des expériences professionnelles qui m’ont appris la rigueur, l’autonomie et la relation client."
            />
            {path.map((group) => (
              <div key={group.label} className="mb-16 last:mb-0">
                <p className="label mb-4 text-muted">{group.label}</p>
                <ul className="border-t-2 border-ink">
                  {group.rows.map((row) => (
                    <Reveal as="li" key={row.title + row.place} className="grid gap-x-8 gap-y-3 border-b border-line py-7 lg:grid-cols-12">
                      <p className="label flex items-center gap-2 text-muted lg:col-span-3">
                        {row.current && <span aria-hidden className="h-2 w-2 rounded-full bg-orange" />}
                        {row.period}
                      </p>
                      <div className="lg:col-span-4">
                        <h3 className="display text-[1.9rem]">{row.title}</h3>
                        <p className="mt-1 text-muted">
                          {row.place}
                          {row.badge && <span className="label ml-2 text-[10px] text-orange-ink">{row.badge}</span>}
                        </p>
                      </div>
                      {row.details && row.details.length > 0 && (
                        <ul className="flex flex-col gap-1 text-muted lg:col-span-5">
                          {row.details.map((d) => (
                            <li key={d} className="leading-relaxed">
                              {d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </Reveal>
                  ))}
                </ul>
              </div>
            ))}
          </Container>
        </section>

        {/* Compétences : sombre */}
        <section aria-labelledby="skills-title" className="bg-dark py-24 text-cream sm:py-32">
          <Container>
            <SectionHeading
              index="02"
              label="Compétences"
              id="skills-title"
              tone="dark"
              title="Les outils avec lesquels je travaille."
              lead="Technologies utilisées dans mes projets publics et professionnels."
            />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
              {skillCategories.map((cat, i) => (
                <Reveal key={cat.id} delay={i * 0.05} className="border-t-2 border-orange pt-5">
                  <h3 className="label text-dark-muted">{cat.label}</h3>
                  <ul className="mt-5 flex flex-col gap-1.5">
                    {cat.skills.map((s) => (
                      <li key={s} className="text-lg">
                        {s}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </div>
            <div className="mt-16 grid gap-8 border-t border-dark-line pt-8 sm:grid-cols-3">
              <div>
                <p className="label text-dark-muted">Aussi pratiqué en formation</p>
                <p className="mt-2">{otherLanguages.join(' · ')}</p>
              </div>
              <div>
                <p className="label text-dark-muted">Langues</p>
                <p className="mt-2">{languages.map((l) => `${l.label} (${l.level.toLowerCase()})`).join(' · ')}</p>
              </div>
              <div>
                <p className="label text-dark-muted">Qualités</p>
                <p className="mt-2">{softSkills.join(' · ')}</p>
              </div>
            </div>
          </Container>
        </section>

        {/* Façon de travailler */}
        <section aria-labelledby="approach-title" className="py-24 sm:py-32">
          <Container>
            <SectionHeading index="03" label="Méthode" id="approach-title" title="Ma façon de travailler." />
            <ol className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
              {principles.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.06}>
                  <span className="display block text-7xl text-orange">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="display mt-6 text-3xl">{p.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{p.text}</p>
                </Reveal>
              ))}
            </ol>
          </Container>
        </section>

        {/* CV */}
        <section id="cv" aria-labelledby="cv-title" className="bg-orange py-24 text-ink sm:py-32">
          <Container className="grid items-center gap-14 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <p className="label">04 — Curriculum vitæ</p>
              <h2 id="cv-title" className="display mt-8 text-[clamp(3rem,8vw,7.5rem)]">
                Le CV, en un clic.
              </h2>
              <p className="mt-8 max-w-md text-lg leading-relaxed">
                Formation, expériences, compétences et centres d’intérêt sur une page. Consultez-le dans le navigateur
                ou téléchargez le PDF.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <a
                  href={site.cvUrl}
                  download
                  className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-cream transition-colors hover:bg-cream hover:text-ink"
                >
                  Télécharger mon CV <ArrowDown size={16} aria-hidden className="transition-transform group-hover:translate-y-0.5" />
                </a>
                <a
                  href={site.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-ink px-6 text-sm font-medium transition-colors hover:bg-ink hover:text-cream"
                >
                  Consulter mon CV <ArrowUpRight size={16} aria-hidden />
                </a>
              </div>
              <p className="label mt-6 text-[10px]">PDF · 1 page · 177 Ko</p>
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <a
                href={site.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ouvrir le CV de Maxime Pero (PDF, nouvel onglet)"
                className="group block rotate-2 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0"
              >
                <MaskReveal className="shadow-[0_40px_80px_-30px_rgba(21,19,17,0.55)]">
                  <Image
                    src={site.cvPreviewUrl}
                    alt="Aperçu de la première page du CV"
                    width={900}
                    height={1273}
                    sizes="(min-width: 1024px) 28rem, 90vw"
                    className="h-auto w-full"
                  />
                </MaskReveal>
              </a>
            </div>
          </Container>
        </section>

        {/* Centres d'intérêt */}
        <section aria-labelledby="interests-title" className="py-24 sm:py-32">
          <Container>
            <SectionHeading index="05" label="En dehors du code" id="interests-title" title="Ce qui me fait avancer." />
            <ul className="border-t-2 border-ink">
              {interests.map((it, i) => (
                <Reveal as="li" key={it.id} className="group grid items-baseline gap-x-8 gap-y-2 border-b border-line py-6 sm:grid-cols-12">
                  <span className="font-mono text-xs text-orange-ink sm:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="display text-[clamp(2rem,4.5vw,4rem)] transition-transform duration-500 group-hover:translate-x-2 sm:col-span-6">
                    {it.label}
                  </h3>
                  <p className="text-muted sm:col-span-5">{it.description}</p>
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      </main>
    </PageTransition>
  )
}
