import type { Project } from '../types'

// Ajouter de nouveaux projets ici — ils s'afficheront automatiquement dans la grille
export const projects: Project[] = [
  {
    id: 'animarah',
    title: 'Animarah',
    description: 'Site web vitrine pour une entreprise de massage équin. Design épuré, animations fluides, optimisé performances et SEO.',
    stack: ['TypeScript', 'Vite', 'CSS', 'Netlify'],
    demoUrl: 'https://animarah.netlify.app',
    githubUrl: 'https://github.com/M4xxes',
    status: 'completed',
    featured: true,
  },
  {
    id: 'mixer-hmi',
    title: 'Écran de contrôle industriel',
    description: "Interface de supervision pour mélangeur industriel. Frontend React/TypeScript connecté à une API REST Node.js/Express sur un projet client réel.",
    longDescription: "La partie base de données, Node-RED, OPC-UA/Modbus et PLC a été gérée par un collaborateur. Ma contribution : interface React en temps réel, design des dashboards de contrôle, intégration API.",
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'REST API'],
    status: 'completed',
    featured: true,
  },
  {
    id: 'map-app',
    title: 'Map — App Mobile iOS',
    description: 'Application iOS en Flutter intégrant Mapbox : globe rotatif animé, interaction tactile avancée, puck de localisation et coloration des pays visités.',
    stack: ['Flutter', 'Dart', 'Mapbox', 'iOS'],
    githubUrl: 'https://github.com/M4xxes',
    status: 'completed',
    featured: true,
  },
]
