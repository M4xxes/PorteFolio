import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'
import { categoryLabels } from '@/lib/data/projects'
import { site } from '@/lib/constants'
import { StackLine } from '@/components/ui/Section'
import { ProjectCover } from './ProjectCover'

/**
 * Pièce de la galerie. Le titre porte un lien « étiré » (toute la pièce est cliquable),
 * les liens GitHub / démo restent accessibles séparément.
 */
export function ProjectCard({
  project,
  index,
  aspect = 'aspect-[16/10]',
  priority,
}: {
  project: Project
  index: number
  aspect?: string
  priority?: boolean
}) {
  return (
    <article className="group relative">
      <div className="relative overflow-hidden">
        <ProjectCover project={project} priority={priority} sizes="(min-width: 1024px) 58vw, 100vw" className={aspect} />
        {/* Bandeau orange qui monte au survol */}
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 flex h-12 translate-y-full items-center justify-between bg-orange px-4 text-sm text-ink transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0"
        >
          Voir le projet <ArrowUpRight size={16} />
        </span>
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-[1fr_auto]">
        <p className="label text-muted sm:col-span-2">
          <span className="text-orange-ink">{String(index).padStart(2, '0')}</span> · {categoryLabels[project.category]}
          {project.year !== '—' && <> · {project.year}</>}
        </p>
        <h3 className="display text-[clamp(2rem,3vw,2.9rem)] transition-colors group-hover:text-orange-ink">
          <Link
            href={`/projects/${project.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-orange-ink"
          >
            {project.title}
          </Link>
        </h3>
        <div className="relative z-10 flex items-start gap-4 text-sm sm:justify-end sm:pt-2">
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-8 items-center gap-1">
              Démo <ArrowUpRight size={13} aria-hidden />
              <span className="sr-only">de {project.title} (nouvel onglet)</span>
            </a>
          )}
          {project.repo && (
            <a href={`${site.github}/${project.repo}`} target="_blank" rel="noopener noreferrer" className="link-draw inline-flex min-h-8 items-center gap-1">
              GitHub <ArrowUpRight size={13} aria-hidden />
              <span className="sr-only">: code source de {project.title} (nouvel onglet)</span>
            </a>
          )}
        </div>
        <p className="max-w-xl text-pretty leading-relaxed text-muted sm:col-span-2">{project.description}</p>
        <StackLine items={project.stack} className="text-ink sm:col-span-2" />
      </div>
    </article>
  )
}
