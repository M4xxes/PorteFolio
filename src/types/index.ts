// Interfaces TypeScript centralisées pour toutes les données du portfolio

export interface Project {
  id: string
  title: string
  description: string
  longDescription?: string
  stack: string[]
  image?: string
  githubUrl?: string
  demoUrl?: string
  featured?: boolean
  status: 'completed' | 'in-progress' | 'concept'
}

export interface SkillCategory {
  id: string
  label: string
  iconName: string
  skills: Skill[]
}

export interface Skill {
  name: string
  level?: 'débutant' | 'intermédiaire' | 'avancé' | 'expert'
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
  iconName: string
  description?: string
}
