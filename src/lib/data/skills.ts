import type { SkillCategory } from '@/types'

export const skillCategories: SkillCategory[] = [
  { id: 'frontend', label: 'Front-end', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Vite', 'CSS'] },
  { id: 'backend', label: 'Back-end', skills: ['Node.js', 'Express', 'API REST'] },
  { id: 'data', label: 'Bases de données', skills: ['SQL', 'MySQL', 'MongoDB'] },
  { id: 'apps', label: 'Mobile & bureau', skills: ['Flutter', 'Dart', 'Electron'] },
  { id: 'industrial', label: 'Industriel', skills: ['Node-RED', 'OPC-UA / Modbus'] },
  { id: 'maps', label: 'Cartographie', skills: ['Mapbox'] },
  { id: 'network', label: 'Systèmes & réseaux', skills: ['Windows Server', 'Équipements réseau', 'Wi-Fi', 'Câblage cuivre & fibre'] },
  { id: 'tools', label: 'Outils', skills: ['Git / GitHub', 'Netlify'] },
]

export const skillCount = skillCategories.reduce((n, c) => n + c.skills.length, 0)
