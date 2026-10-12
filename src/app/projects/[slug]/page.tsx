import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ViewTransition, type CSSProperties } from 'react'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { categoryLabels, getProject, projects } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { getPublicRepos } from '@/lib/github'
import { formatMonth } from '@/lib/format'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { MaskReveal } from '@/components/ui/MaskReveal'
import { PageTransition } from '@/components/ui/PageTransition'
import { Reveal } from '@/components/ui/Reveal'
import { Container, Label, StackLine } from '@/components/ui/Section'
import { ProjectCover } from '@/components/projects/ProjectCover'
import { ProjectVideo } from '@/components/projects/ProjectVideo'

type Params = { params: Promise<{ slug: string }> }

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.description,
      images: [{ url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt }],
    },
  }
}

function Block({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal as="section" className="grid gap-6 border-t border-line py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
      <div className="lg:col-span-4">
        <Label index={index} className="text-muted">
          {title}
        </Label>
      </div>
      <div className="lg:col-span-8">{children}</div>
    </Reveal>
  )
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const position = projects.findIndex((p) => p.id === slug)
  const next = projects[(position + 1) % projects.length]
  const others = projects.filter((p) => p.id !== project.id && p.id !== next.id).slice(0, 3)
  const repo = project.repo ? (await getPublicRepos()).find((r) => r.name === project.repo) : undefined
  const repoHref = project.repo ? `${site.github}/${project.repo}` : undefined
  const dark = project.tone === 'dark'
  const wide = project.gallery?.filter((g) => g.width >= g.height) ?? []
  const tall = project.gallery?.filter((g) => g.height > g.width) ?? []

  const meta = [
    { label: 'Rôle', value: project.role },
    { label: 'Catégorie', value: categoryLabels[project.category] },
    { label: 'Année', value: project.year },
    { label: 'Mise à jour', value: repo ? formatMonth(repo.pushedAt) : '—' },
  ]

  let block = 0
  const nextIndex = () => String(++block).padStart(2, '0')

  return (
    <PageTransition>
      <main id="main">
        <article>
          <header className={`relative overflow-hidden pt-[calc(var(--header-h)+1.5rem)] ${dark ? 'bg-dark text-cream' : 'bg-paper'}`}>
            <Container className="relative">
              <div className={`animate-rise flex items-center justify-between gap-4 border-b pb-4 ${dark ? 'border-dark-line text-dark-muted' : 'border-line text-muted'}`}>
                <Link href="/projects" className="label group inline-flex min-h-11 items-center gap-2 transition-colors hover:text-orange">
                  <ArrowLeft size={14} aria-hidden className="transition-transform group-hover:-translate-x-1" /> Tous les projets
                </Link>
                <p className="label">
                  <span className={dark ? 'text-orange' : 'text-orange-ink'}>{String(position + 1).padStart(2, '0')}</span> /{' '}
                  {String(projects.length).padStart(2, '0')}
                </p>
              </div>

              <p className={`animate-rise label mt-10 ${dark ? 'text-orange' : 'text-orange-ink'}`} style={delay(60)}>
                {project.tagline}
              </p>
              <h1 className="display mt-5 text-[clamp(3.2rem,10.5vw,10rem)]">
                <span className="line-mask">
                  <span style={delay(120)}>{project.title}</span>
                </span>
              </h1>

              <div className="mt-12 grid gap-10 pb-14 lg:grid-cols-12 lg:gap-8">
                <p className="animate-rise text-lg leading-relaxed text-pretty lg:col-span-5 sm:text-xl" style={delay(240)}>
                  {project.description}
                </p>
                <dl className="animate-rise grid grid-cols-2 gap-x-6 gap-y-5 lg:col-span-4 lg:col-start-7" style={delay(320)}>
                  {meta.map((m) => (
                    <div key={m.label} className={`border-t pt-3 ${dark ? 'border-dark-line' : 'border-line-strong'}`}>
                      <dt className={`label text-[10px] ${dark ? 'text-dark-muted' : 'text-muted'}`}>{m.label}</dt>
                      <dd className="mt-1.5 text-sm">{m.value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="animate-rise flex flex-wrap gap-3 lg:col-span-2 lg:flex-col lg:items-end" style={delay(400)}>
                  {project.demoUrl && (
                    <ButtonLink href={project.demoUrl} external variant="accent" icon={<ArrowUpRight size={16} />}>
                      Voir le site
                    </ButtonLink>
                  )}
                  {repoHref && (
                    <ButtonLink href={repoHref} external variant={dark ? 'outline-light' : 'outline'} icon={<ArrowUpRight size={16} />}>
                      GitHub
                    </ButtonLink>
                  )}
                </div>
              </div>
            </Container>
            {/* L'image principale chevauche la limite entre l'en-tête et le contenu */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-24 bg-cream sm:h-40" />
            <Container className="relative">
              <figure>
                {project.video ? (
                  // Même nom de transition que la vignette : l'image de la galerie « devient » la vidéo.
                  <ViewTransition name={`project-${project.id}`} share="morph">
                    <div>
                      <ProjectVideo
                        video={project.video}
                        url={project.demoUrl}
                        label={`Visite filmée du site ${project.title} : accueil, grille des projets, page projet et visionneuse`}
                      />
                    </div>
                  </ViewTransition>
                ) : (
                  <ProjectCover project={project} priority natural sizes="(min-width: 1440px) 1360px, 100vw" />
                )}
                <figcaption className="label mt-3 text-[10px] text-muted">
                  {project.video
                    ? `Visite filmée du site en ligne — ${project.video.duration} s, sans son`
                    : project.cover.kind === 'screenshot'
                      ? 'Capture de l’interface réelle'
                      : 'Illustration de présentation — pas une capture de l’application'}
                </figcaption>
              </figure>
            </Container>
          </header>

          <Container className="pt-16 sm:pt-24">
            <Block index={nextIndex()} title="Objectif">
              <p className="font-display text-[clamp(1.5rem,2.6vw,2.4rem)] font-medium leading-[1.15] tracking-[-0.015em] text-pretty [font-stretch:92%]">
                {project.context}
              </p>
            </Block>

            <Block index={nextIndex()} title="Ce que j’ai fait">
              <ol className="flex flex-col">
                {project.contributions.map((item, i) => (
                  <li key={item} className="grid grid-cols-[2.5rem_1fr] gap-2 border-b border-line py-4 text-lg leading-snug last:border-0">
                    <span className="font-mono text-xs leading-7 text-orange-ink">{String(i + 1).padStart(2, '0')}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </Block>

            <Block index={nextIndex()} title="Fonctionnalités">
              <ul className="grid gap-x-8 sm:grid-cols-2">
                {project.features.map((item) => (
                  <li key={item} className="flex gap-3 border-b border-line py-4 leading-relaxed text-muted">
                    <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-orange" />
                    {item}
                  </li>
                ))}
              </ul>
            </Block>

            {project.challenges && project.challenges.length > 0 && (
              <Block index={nextIndex()} title="Défis techniques">
                <div className="grid gap-px bg-line sm:grid-cols-2">
                  {project.challenges.map((c) => (
                    <div key={c.title} className="bg-cream p-6 sm:first:pl-0">
                      <h3 className="display text-2xl">{c.title}</h3>
                      <p className="mt-3 leading-relaxed text-muted">{c.text}</p>
                    </div>
                  ))}
                </div>
              </Block>
            )}

            <Block index={nextIndex()} title="Stack technique">
              <StackLine items={project.stack} className="text-base sm:text-lg" />
            </Block>
          </Container>

          {(wide.length > 0 || tall.length > 0) && (
            <section aria-labelledby="gallery-title" className="mt-12 bg-paper py-20 sm:py-28">
              <Container>
                <div className="mb-12 flex items-baseline justify-between border-b border-line-strong pb-4">
                  <h2 id="gallery-title" className="display text-4xl sm:text-5xl">
                    Galerie
                  </h2>
                  <p className="label text-muted">Captures réelles · {wide.length + tall.length}</p>
                </div>
                <div className="grid gap-8 lg:grid-cols-12">
                  {wide.map((img, i) => (
                    <figure key={img.src} className={i % 2 === 0 ? 'lg:col-span-7' : 'lg:col-span-5 lg:mt-24'}>
                      <MaskReveal className="relative bg-cream">
                        <div style={{ aspectRatio: `${img.width} / ${img.height}` }} />
                        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-top" />
                      </MaskReveal>
                      <figcaption className="mt-3 text-sm text-muted">{img.alt}</figcaption>
                    </figure>
                  ))}
                  {tall.map((img) => (
                    <figure key={img.src} className="lg:col-span-4 lg:col-start-5">
                      <MaskReveal className="relative mx-auto max-w-[18rem] bg-cream" >
                        <div className="relative" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
                          <Image src={img.src} alt={img.alt} fill sizes="18rem" className="object-cover" />
                        </div>
                      </MaskReveal>
                      <figcaption className="mt-3 text-center text-sm text-muted">{img.alt}</figcaption>
                    </figure>
                  ))}
                </div>
              </Container>
            </section>
          )}
        </article>

        <nav aria-label="Autres projets" className="bg-dark text-cream">
          <Container>
            <Link href={`/projects/${next.id}`} className="group block border-b border-dark-line py-16 sm:py-24">
              <p className="label text-dark-muted">Projet suivant</p>
              <p className="mt-6 flex items-end justify-between gap-6">
                <span className="display text-[clamp(2.75rem,8vw,7.5rem)] transition-colors group-hover:text-orange">{next.title}</span>
                <span className="mb-3 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange text-ink transition-transform duration-500 group-hover:translate-x-2 sm:h-20 sm:w-20">
                  <ArrowRight size={24} aria-hidden />
                </span>
              </p>
            </Link>
            <ul className="grid gap-px py-10 sm:grid-cols-3">
              {others.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="group flex items-center gap-4 py-3 pr-4">
                    <span className="relative block aspect-[4/3] w-20 shrink-0 overflow-hidden bg-ink-soft">
                      <Image src={p.cover.src} alt="" fill sizes="5rem" className="object-cover object-left-top transition-transform duration-500 group-hover:scale-110" />
                    </span>
                    <span>
                      <span className="label block text-[10px] text-dark-muted">{categoryLabels[p.category]}</span>
                      <span className="mt-1 block transition-colors group-hover:text-orange">{p.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      </main>
    </PageTransition>
  )
}
