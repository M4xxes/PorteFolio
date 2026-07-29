import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'animarah',
    title: 'Animarah',
    description:
      'Site web vitrine pour une entreprise de massage équin. Design épuré, animations fluides, optimisé performances et SEO.',
    longDescription:
      "Conception et développement complet d'un site vitrine pour une praticienne en massage équin. L'objectif : un site rapide, sobre et rassurant, qui met en confiance une clientèle non-technique tout en restant impeccable côté performance et référencement.",
    stack: ['TypeScript', 'Vite', 'CSS', 'Netlify'],
    demoUrl: 'https://animarah.netlify.app',
    githubUrl: 'https://github.com/M4xxes',
    status: 'completed',
    featured: true,
    mockupType: 'web',
    accentFrom: '#7C3AED',
    accentTo: '#312E81',
  },
  {
    id: 'mixer-hmi',
    title: 'Écran de contrôle industriel',
    description:
      'Interface de supervision pour mélangeur industriel. Frontend React/TypeScript connecté à une API REST Node.js/Express sur un projet client réel.',
    longDescription:
      "La partie base de données, Node-RED, OPC-UA/Modbus et PLC a été gérée par un collaborateur. Ma contribution : interface React en temps réel, design des dashboards de contrôle, intégration API.",
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'REST API'],
    status: 'completed',
    featured: true,
    mockupType: 'dashboard',
    accentFrom: '#A855F7',
    accentTo: '#1E1B4B',
  },
  {
    id: 'map-app',
    title: 'Map — App Mobile iOS',
    description:
      'Application iOS en Flutter intégrant Mapbox : globe rotatif animé, interaction tactile avancée, puck de localisation et coloration des pays visités.',
    longDescription:
      "Application mobile personnelle pour visualiser et colorer les pays visités sur un globe 3D interactif, avec géolocalisation en temps réel et gestes tactiles avancés (rotation, pinch-to-zoom, sélection de pays).",
    stack: ['Flutter', 'Dart', 'Mapbox', 'iOS'],
    githubUrl: 'https://github.com/M4xxes',
    status: 'completed',
    featured: true,
    mockupType: 'mobile',
    accentFrom: '#C084FC',
    accentTo: '#4C1D95',
  },
]
