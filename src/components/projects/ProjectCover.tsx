import Image from 'next/image'
import { ViewTransition } from 'react'
import type { Project } from '@/types'

/**
 * Visuel d'un projet. Le même `name` de ViewTransition dans la galerie et sur la page détail
 * fait « voyager » l'image d'une page à l'autre.
 */
export function ProjectCover({
  project,
  sizes,
  priority,
  className = '',
  natural,
}: {
  project: Project
  sizes: string
  priority?: boolean
  className?: string
  /** Respecte les proportions réelles de l'image au lieu du cadre imposé par `className`. */
  natural?: boolean
}) {
  const { cover } = project
  return (
    <ViewTransition name={`project-${project.id}`} share="morph">
      <div
        className={`relative overflow-hidden bg-paper ${className}`}
        style={natural ? { aspectRatio: `${cover.width} / ${cover.height}` } : undefined}
      >
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover object-left-top transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
        />
        {cover.kind === 'illustration' && (
          <span className="label absolute left-3 top-3 bg-cream px-2 py-1 text-[9px] text-ink">Illustration</span>
        )}
      </div>
    </ViewTransition>
  )
}
