import type { SkillCategory } from '@/types'

export const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    label: 'Front-end',
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML / CSS', 'Tailwind CSS', 'Next.js', 'Vue 3', 'Framer Motion'],
  },
  {
    id: 'backend',
    label: 'Back-end',
    skills: ['Node.js', 'Express', 'API REST', 'Prisma', 'JWT'],
  },
  {
    id: 'data',
    label: 'Bases de données',
    skills: ['SQL', 'MySQL', 'SQLite', 'MongoDB', 'Neo4j'],
  },
  {
    id: 'apps',
    label: 'Mobile & desktop',
    skills: ['Flutter', 'Dart', 'Electron'],
  },
  {
    id: 'tools',
    label: 'Outils',
    skills: ['Git / GitHub', 'Vite', 'Netlify', 'Node-RED', 'OPC-UA / Modbus'],
  },
]

/** Langages pratiqués en formation (projets publics sur GitHub). */
export const otherLanguages = ['C# / WPF', 'Java / JavaFX', 'Go']

export const softSkills = ['Adaptabilité & autonomie', 'Organisation & rigueur', 'Travail en équipe', 'Curiosité & veille technique']

export const languages = [
  { label: 'Français', level: 'Courant' },
  { label: 'Anglais', level: 'Intermédiaire' },
]
