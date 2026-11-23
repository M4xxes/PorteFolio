import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { categoryLabels, getProject, projects } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { EscBack } from '@/components/hub/EscBack'
import '@/components/hub/hub.css'

type Params = { params: Promise<{ slug: string }> }

const pad = (n: number) => String(n + 1).padStart(2, '0')

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
    alternates: { canonical: `/projets/${project.id}` },
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.description,
      images: [{ url: project.cover.src, width: project.cover.width, height: project.cover.height, alt: project.cover.alt }],
    },
  }
}

/** Page projet épurée, par-dessus le nuage de particules (fond transparent). */
export default async function ProjectPage({ params }: Params) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const i = projects.findIndex((p) => p.id === slug)
  const prev = projects[(i - 1 + projects.length) % projects.length]
  const next = projects[(i + 1) % projects.length]
  const repoHref = project.repoUrl ?? (project.repo ? `${site.github}/${project.repo}` : undefined)
  const gallery = project.gallery ?? []
  const video = project.video

  return (
    <main id="main" className="proj">
      <EscBack />
      <div className="proj-top">
        <Link href="/#projets" className="proj-back">
          <span aria-hidden>←</span> Retour aux projets
        </Link>
        <span style={{ color: 'var(--muted)' }}>
          {pad(i)} / {String(projects.length).padStart(2, '0')}
        </span>
      </div>

      <div className="proj-wrap">
        <header>
          <h1 className="proj-title">{project.title}</h1>
          <p className="proj-meta">
            {categoryLabels[project.category]} · {project.year}
          </p>
        </header>

        <figure className="proj-media">
          <div style={{ aspectRatio: `${video?.width ?? project.cover.width} / ${video?.height ?? project.cover.height}` }}>
            {video ? (
              <video src={video.src} poster={video.poster} autoPlay muted loop playsInline preload="metadata" aria-label={video.label ?? `Visite filmée de ${project.title}`} />
            ) : (
              <Image src={project.cover.src} alt={project.cover.alt} width={project.cover.width} height={project.cover.height} priority sizes="(min-width: 1100px) 1100px, 100vw" />
            )}
          </div>
          <figcaption>
            {video
              ? (video.caption ?? `Visite filmée — ${video.duration} s, sans son`)
              : project.cover.kind === 'screenshot'
                ? 'Capture de l’interface réelle'
                : 'Visuel de présentation — pas une capture de l’application'}
          </figcaption>
        </figure>

        <div className="proj-body">
          <div>
            <section>
              <h2>[description]</h2>
              <p>{project.story}</p>
              <p>{project.context}</p>
            </section>
            <section>
              <h2>[mon rôle]</h2>
              <p style={{ color: '#fff' }}>{project.role}</p>
              <ul>
                {project.contributions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>[fonctionnalités]</h2>
              <ul>
                {project.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="proj-side">
            <section>
              <h2 style={{ fontSize: 13, fontWeight: 400, color: 'var(--accent)', margin: '0 0 1em' }}>[stack]</h2>
              <div className="proj-chips">
                {project.stack.map((s) => (
                  <span key={s}>{s}</span>
                ))}
              </div>
            </section>
            <section>
              <h2 style={{ fontSize: 13, fontWeight: 400, color: 'var(--accent)', margin: '0 0 1em' }}>[infos]</h2>
              <dl>
                <dt>Catégorie</dt>
                <dd>{categoryLabels[project.category]}</dd>
                <dt>Année</dt>
                <dd>{project.year}</dd>
                <dt>Repère</dt>
                <dd>{project.tag}</dd>
              </dl>
            </section>
            {(project.demoUrl || repoHref) && (
              <section className="proj-links">
                <h2 style={{ fontSize: 13, fontWeight: 400, color: 'var(--accent)', margin: '0 0 1em' }}>[liens]</h2>
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer">
                    Site en ligne -&gt;
                  </a>
                )}
                {repoHref && (
                  <a href={repoHref} target="_blank" rel="noreferrer">
                    GitHub -&gt;
                  </a>
                )}
              </section>
            )}
          </aside>
        </div>

        {gallery.length > 0 && (
          <div className="proj-gallery">
            {gallery.map((img) => (
              <figure key={img.src}>
                <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="(min-width: 860px) 548px, 100vw" />
                <figcaption>{img.alt}</figcaption>
              </figure>
            ))}
          </div>
        )}

        <nav className="proj-nav" aria-label="Projets voisins">
          <Link href={`/projets/${prev.id}`}>
            <small>← précédent</small>
            {prev.title}
          </Link>
          <Link href="/#projets">
            <small>retour</small>
            Aux projets
          </Link>
          <Link href={`/projets/${next.id}`}>
            <small>suivant →</small>
            {next.title}
          </Link>
        </nav>
      </div>
    </main>
  )
}
