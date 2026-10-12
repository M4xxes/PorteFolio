export type ProjectCategory = 'web' | 'mobile' | 'desktop' | 'backend'

export interface ProjectImage {
  src: string
  alt: string
  width: number
  height: number
  /**
   * `screenshot` : capture réelle de l'interface.
   * `illustration` : visuel de présentation original (le projet n'a pas de démo exécutable publique).
   */
  kind: 'screenshot' | 'illustration'
}

export interface Project {
  id: string
  title: string
  tagline: string
  description: string
  context: string
  /** Ce que j'ai concrètement réalisé sur le projet. */
  contributions: string[]
  features: string[]
  /** Défis techniques confirmés par le code ou la documentation du dépôt. */
  challenges?: { title: string; text: string }[]
  stack: string[]
  category: ProjectCategory
  year: string
  role: string
  /** Nom du dépôt public sur GitHub (sert aussi à l'enrichissement automatique). */
  repo?: string
  demoUrl?: string
  featured?: boolean
  /** Ambiance de l'en-tête de la page projet. */
  tone: 'light' | 'dark'
  cover: ProjectImage
  gallery?: ProjectImage[]
  /** Visite filmée du site en ligne (MP4 H.264, sans son). */
  video?: { src: string; poster: string; width: number; height: number; duration: number }
}

export interface SkillCategory {
  id: string
  label: string
  skills: string[]
}

export interface Experience {
  id: string
  role: string
  company: string
  location: string
  period: string
  type: 'CDI' | 'Stage' | 'Alternance' | 'Freelance'
  current?: boolean
  description: string[]
}

export interface Education {
  id: string
  degree: string
  school: string
  location: string
  period: string
  current?: boolean
  description?: string
  certification?: string
}

export interface Interest {
  id: string
  label: string
  description: string
}

export interface GithubRepo {
  name: string
  description: string | null
  url: string
  homepage: string | null
  language: string | null
  stars: number
  pushedAt: string
}
