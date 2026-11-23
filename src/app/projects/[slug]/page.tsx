import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProject, projects } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { Button, Container } from '@/components/ui/Kit'
import { PageTransition } from '@/components/ui/PageTransition'
import { ProjectVideo } from '@/components/projects/ProjectVideo'
import { Ext, G } from '@/components/ui/Glyph'

type Params = { params: Promise<{ slug: string }> }

const num = (i: number) => String(i + 1).padStart(2, '0')

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
    <section className="grid gap-6 border-t border-line py-12 lg:grid-cols-12 lg:gap-6 lg:py-16">
      <h2 className="ui text-fg-2 lg:col-span-4">
        <G>[{index}]</G> {title}
      </h2>
      <div className="lg:col-span-8">{children}</div>
    </section>
  )
}

/**
 * Page projet classique : chargement direct, SEO et version légère.
 * En version complète, la salle de contrôle 3D s'ouvrira par-dessus (phase 4).
 */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const i = projects.findIndex((p) => p.id === slug)
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]
  const prevIndex = (i - 1 + projects.length) % projects.length
  const nextIndex = (i + 1) % projects.length
  const repoHref = project.repoUrl ?? (project.repo ? `${site.github}/${project.repo}` : undefined)
  const gallery = project.gallery ?? []

  let block = 0
  const b = () => String(++block).padStart(2, '0')

  return (
    <PageTransition>
      <main id="main" className="pt-[var(--header-h)]">
        <article>
          <Container as="header" className="pt-3">
            <div className="ui flex flex-wrap items-center justify-between gap-4 text-fg-2">
              <Link href="/#projets" aria-label="Fermer : retour aux projets" className="nudge inline-flex min-h-11 items-center gap-[0.6em]">
                &gt; FERMER &lt;
              </Link>
              <p>
                PROJET <span className="doto text-xl text-fg">{num(i)}</span> / {String(projects.length).padStart(2, '0')}
              </p>
            </div>

            <h1 className="pixel mt-10 max-w-[14ch] text-[clamp(2.75rem,8.5vw,8rem)]">{project.title}</h1>

            <div className="mt-12 grid gap-x-6 gap-y-10 border-t border-line pt-6 pb-12 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="ui text-fg-3">Info</p>
                <p className="mt-3 text-base">{project.story}</p>
              </div>
              <dl className="ui flex flex-col gap-5 lg:col-span-3 lg:col-start-8">
                <div>
                  <dt className="text-fg-3">Rôle</dt>
                  <dd className="mt-1">{project.roleLine}</dd>
                </div>
                <div>
                  <dt className="text-fg-3">Stack</dt>
                  <dd className="mt-1 text-fg-2">{project.stack.join(' / ')}</dd>
                </div>
                <div>
                  <dt className="text-fg-3">Repère</dt>
                  <dd className="mt-1 text-fg-2">{project.tag}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap content-start gap-2 lg:col-span-2 lg:col-start-11 lg:flex-col">
                {project.demoUrl && (
                  <Button href={project.demoUrl} external>
                    <G>[→]</G> Voir le site<Ext />
                  </Button>
                )}
                {repoHref && (
                  <Button href={repoHref} external variant="outline">
                    GitHub<Ext />
                  </Button>
                )}
              </div>
            </div>
          </Container>

          <Container>
            <figure>
              {project.video ? (
                <ProjectVideo
                  video={project.video}
                  url={project.video.label ? undefined : project.demoUrl}
                  label={
                    project.video.label ??
                    `Visite filmée du site ${project.title} : accueil, grille des projets, page projet et visionneuse`
                  }
                />
              ) : (
                <div className="relative bg-surface">
                  <Image
                    src={project.cover.src}
                    alt={project.cover.alt}
                    width={project.cover.width}
                    height={project.cover.height}
                    priority
                    sizes="(min-width: 1600px) 1520px, 100vw"
                    className="h-auto w-full"
                  />
                </div>
              )}
              <figcaption className="ui mt-3 text-fg-3">
                {project.video
                  ? (project.video.caption ?? `Visite filmée du site en ligne — ${project.video.duration} s, sans son`)
                  : project.cover.kind === 'screenshot'
                    ? 'Capture de l’interface réelle'
                    : 'Visuel de présentation — pas une capture de l’application'}
              </figcaption>
            </figure>
          </Container>

          <Container className="pt-16 sm:pt-24">
            <Block index={b()} title="Objectif">
              <p className="text-base">{project.context}</p>
            </Block>
            <Block index={b()} title="Ce que j’ai fait">
              <ol className="flex flex-col">
                {project.contributions.map((item, k) => (
                  <li key={item} className="grid grid-cols-[3rem_1fr] border-b border-line py-4 last:border-0">
                    <span className="doto text-lg text-fg-2">{num(k)}</span>
                    {item}
                  </li>
                ))}
              </ol>
            </Block>
            <Block index={b()} title="Fonctionnalités">
              <ul className="grid gap-x-6 sm:grid-cols-2">
                {project.features.map((item) => (
                  <li key={item} className="flex gap-3 border-b border-line py-4 text-fg-2">
                    <span aria-hidden className="mt-2 size-[5px] shrink-0 bg-fg-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </Block>
            {project.challenges && project.challenges.length > 0 && (
              <Block index={b()} title="Défis techniques">
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
                  {project.challenges.map((c) => (
                    <div key={c.title} className="border-l border-line pl-5">
                      <h3 className="pixel text-2xl leading-none">{c.title}</h3>
                      <p className="mt-3 text-fg-2">{c.text}</p>
                    </div>
                  ))}
                </div>
              </Block>
            )}
          </Container>

          {gallery.length > 0 && (
            <section aria-labelledby="gallery-title" className="py-20 sm:py-28">
              <Container>
                <div className="mb-10 flex items-baseline justify-between border-t border-line pt-3">
                  <h2 id="gallery-title" className="ui text-fg-2">
                    <G>[{b()}]</G> Galerie
                  </h2>
                  <p className="ui text-fg-3">
                    Captures réelles · <span className="doto text-lg text-fg">{String(gallery.length).padStart(2, '0')}</span>
                  </p>
                </div>
                <div className="grid gap-x-6 gap-y-12 lg:grid-cols-12">
                  {gallery.map((img, k) => {
                    const tall = img.height > img.width
                    return (
                      <figure key={img.src} className={tall ? 'lg:col-span-4' : k % 3 === 0 ? 'lg:col-span-12' : 'lg:col-span-6'}>
                        <div className={`relative bg-surface ${tall ? 'mx-auto max-w-[20rem]' : ''}`}>
                          <Image
                            src={img.src}
                            alt={img.alt}
                            width={img.width}
                            height={img.height}
                            sizes={tall ? '20rem' : k % 3 === 0 ? '100vw' : '(min-width: 1024px) 50vw, 100vw'}
                            className="h-auto w-full"
                          />
                        </div>
                        <figcaption className="ui mt-3 text-fg-3">
                          <G>[{num(k)}]</G> {img.alt}
                        </figcaption>
                      </figure>
                    )
                  })}
                </div>
              </Container>
            </section>
          )}
        </article>

        <nav aria-label="Projets voisins" className="border-t border-line">
          <Container className="ui flex flex-wrap justify-between gap-4 py-8">
            <Link href={`/projects/${prev.id}`} className="nudge inline-flex min-h-11 items-center gap-[0.6em] hover:text-accent">
              <G>←</G>{num(prevIndex)} {prev.short}
            </Link>
            <Link href={`/projects/${next.id}`} className="nudge inline-flex min-h-11 items-center gap-[0.6em] text-right hover:text-accent">
              {num(nextIndex)} {next.short}<G>→</G>
            </Link>
          </Container>
        </nav>
      </main>
    </PageTransition>
  )
}
