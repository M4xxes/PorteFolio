import type { Education } from '../types'

export const education: Education[] = [
  {
    id: 'ynov',
    degree: 'Bachelor Informatique — 3ème année',
    school: 'Ynov Campus',
    location: 'Lyon, France',
    period: '2023 — Présent',
    current: true,
    description:
      'Spécialisation Full-Stack Web. Développement front-end et back-end, projets clients réels, travail en équipe Agile.',
    certification: "RNCP36463 — Concepteur Développeur d'Applications Numériques, Niveau 6",
  },
  {
    id: 'lamache',
    degree: 'Baccalauréat Professionnel',
    school: 'École La Mache',
    location: 'Lyon, France',
    period: '2020 — 2023',
    description: 'Obtention du Baccalauréat Professionnel.',
  },
]
