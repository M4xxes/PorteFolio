import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight, CodeXml } from 'lucide-react'
import { projects } from '@/lib/data/projects'
import { ProjectMockup } from '@/components/ui/ProjectMockup'
import { site } from '@/lib/constants'

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project) return {}
  return {
    title: `${project.title} — ${site.name}`,
    description: project.description,
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projects.find((p) => p.id === slug)
  if (!project) notFound()

  const index = projects.findIndex((p) => p.id === slug)
  const next = projects[(index + 1) % projects.length]

  return (
    <main className="min-h-screen bg-bg px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#projects"
          data-cursor-hover
          className="inline-flex items-center gap-2 font-sans text-sm text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft size={16} /> Retour aux projets
        </Link>

        <div className="mt-10 aspect-[16/9] overflow-hidden rounded-lg border border-border-soft">
          <ProjectMockup project={project} />
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div>
            <span className="font-sans text-xs uppercase tracking-[0.4em] text-accent">
              {project.status === 'completed' ? 'Projet terminé' : project.status}
            </span>
            <h1 className="mt-4 font-serif text-4xl text-fg sm:text-5xl">{project.title}</h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-relaxed text-fg-muted">
              {project.longDescription ?? project.description}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-fg-muted">
                Stack technique
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-border-soft px-3 py-1 font-sans text-xs text-fg-muted"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {(project.demoUrl || project.githubUrl) && (
              <div className="flex flex-col gap-3">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-hover
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-medium text-bg transition-opacity hover:opacity-90"
                  >
                    Voir le site <ArrowUpRight size={16} />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cursor-hover
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-soft px-5 py-2.5 font-sans text-sm text-fg transition-colors hover:border-accent/50"
                  >
                    <CodeXml size={16} /> Code source
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {projects.length > 1 && (
          <Link
            href={`/projects/${next.id}`}
            data-cursor-hover
            className="mt-24 flex items-center justify-between border-t border-border-soft pt-8 transition-colors hover:border-accent/40"
          >
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-fg-muted">
                Projet suivant
              </p>
              <p className="mt-2 font-serif text-3xl text-fg">{next.title}</p>
            </div>
            <ArrowUpRight size={28} className="text-fg-muted" />
          </Link>
        )}
      </div>
    </main>
  )
}
