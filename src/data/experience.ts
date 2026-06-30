import type { Experience } from '../types'

export const experiences: Experience[] = [
  {
    id: 'eni',
    role: 'Employé de station-service',
    company: 'ENI',
    location: 'Vourles, France',
    period: 'Août 2023 — Présent',
    type: 'CDI',
    current: true,
    description: [
      'Accueil et orientation de la clientèle',
      'Encaissement et gestion de caisse',
      'Tenue du point de vente (réassort, hygiène, organisation)',
    ],
  },
  {
    id: 'ambis',
    role: 'Technicien informatique',
    company: 'Ambis',
    location: 'Brignais, France',
    period: 'Stage — 8 semaines',
    type: 'Stage',
    description: [
      'Assistance informatique auprès de TPE-PME',
      'Gestion et inventaire du parc informatique',
      'Maintenance, dépannage et remplacement matériel',
      'Installation et configuration de postes de travail',
    ],
  },
  {
    id: 'uniferme',
    role: 'Employé commercial',
    company: 'Uniferme',
    location: 'Beauvallon, France',
    period: 'Stage — 8 semaines',
    type: 'Stage',
    description: [
      'Mise en rayon et gestion des stocks',
      'Tenue de caisse',
      'Relation et conseil client',
    ],
  },
]
