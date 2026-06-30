import type { SkillCategory } from '../types'

// iconName correspond aux noms d'icônes lucide-react utilisés dans SkillCategory.tsx
export const skillCategories: SkillCategory[] = [
  {
    id: 'frontend',
    label: 'Front-End',
    iconName: 'Monitor',
    skills: [
      { name: 'React', level: 'avancé' },
      { name: 'TypeScript', level: 'avancé' },
      { name: 'JavaScript', level: 'avancé' },
      { name: 'HTML / CSS', level: 'expert' },
      { name: 'Tailwind CSS', level: 'avancé' },
      { name: 'Vite', level: 'avancé' },
      { name: 'Framer Motion', level: 'intermédiaire' },
    ],
  },
  {
    id: 'backend',
    label: 'Back-End',
    iconName: 'Server',
    skills: [
      { name: 'Node.js', level: 'intermédiaire' },
      { name: 'Express', level: 'intermédiaire' },
      { name: 'REST API', level: 'intermédiaire' },
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    iconName: 'Smartphone',
    skills: [
      { name: 'Flutter', level: 'intermédiaire' },
      { name: 'Dart', level: 'intermédiaire' },
    ],
  },
  {
    id: 'databases',
    label: 'Bases de données',
    iconName: 'Database',
    skills: [
      { name: 'MongoDB', level: 'intermédiaire' },
      { name: 'Neo4j', level: 'débutant' },
      { name: 'SQL', level: 'intermédiaire' },
    ],
  },
  {
    id: 'tools',
    label: 'Outils & DevOps',
    iconName: 'Wrench',
    skills: [
      { name: 'Git / GitHub', level: 'avancé' },
      { name: 'Netlify', level: 'avancé' },
      { name: 'Node-RED', level: 'débutant' },
      { name: 'OPC-UA / Modbus', level: 'débutant' },
    ],
  },
  {
    id: 'softskills',
    label: 'Soft Skills',
    iconName: 'Users',
    skills: [
      { name: 'Adaptabilité & autonomie' },
      { name: 'Organisation & rigueur' },
      { name: 'Travail en équipe' },
      { name: 'Curiosité & veille tech' },
    ],
  },
]
