/** Contenu de la page /a-propos : textes, parcours, projets mis en avant. */

/**
 * URLs à renseigner pour chaque projet. Vides par défaut : si une valeur est vide,
 * on utilise celle de `projects.ts` (démo / dépôt déjà connus) ; s'il n'y en a pas, aucun bouton n'est affiché.
 */
export const PROJECT_LINKS: Record<string, { github: string; demo: string }> = {
  'mixer-hmi': { github: '', demo: '' },
  evastre: { github: '', demo: '' },
  animarah: { github: '', demo: '' },
  notchpack: { github: '', demo: '' },
}

export const aboutProjects: { id: string; title: string; text?: string; tags?: string[] }[] = [
  {
    id: 'mixer-hmi',
    title: 'Écran de contrôle industriel',
    text: 'Interface de supervision de malaxeurs industriels pour un client réel. Front React/TypeScript connecté à une API REST Node.js/Express.',
    tags: ['React', 'TypeScript', 'Node.js', 'Express', 'Node-RED'],
  },
  {
    id: 'evastre',
    title: 'Portfolio d’Eva Masson',
    text: 'Refonte du portfolio d’une photographe et vidéaste, avec un espace admin pour qu’elle ajoute elle-même courts-métrages, images et descriptions.',
  },
  {
    id: 'animarah',
    title: 'Animarah',
    text: 'Site vitrine pour une entreprise de massage équin. Design épuré, animations fluides, optimisé pour la performance et le SEO.',
    tags: ['TypeScript', 'Vite', 'CSS', 'Netlify'],
  },
  { id: 'notchpack', title: 'NotchPack' },
]

export const parcours = [
  {
    date: 'en cours',
    title: 'Développeur web freelance (auto-entrepreneur)',
    text: 'Sites sur mesure (vitrine, portfolio avec espace admin), du recueil des besoins au suivi après livraison.',
  },
  {
    date: '2023 – 2026',
    title: 'Bachelor Informatique, spécialisation full-stack web',
    text: 'Titre RNCP Concepteur Développeur d’Applications Numériques (niveau 6).',
  },
  {
    date: 'Stage',
    title: 'Technicien informatique, Ambis (Brignais)',
    text: 'Support utilisateurs pour des TPE-PME, diagnostic, gestion de parc et maintenance.',
  },
  {
    date: '2020 – 2023',
    title: 'Bac Pro Systèmes Numériques, option RISC',
    text: 'Réseaux cuivre et fibre, Wi-Fi, Windows Server, maintenance et diagnostic.',
  },
]

export const infos: [string, string][] = [
  ['localisation', 'Lyon / remote'],
  ['statut', 'ouvert à un CDI & missions freelance'],
  ['formation', 'Bachelor Informatique Bac+3 (RNCP niv. 6)'],
  ['stack', 'React · TypeScript · Node.js · Flutter'],
  ['langues', 'français, anglais (intermédiaire)'],
  ['mobilité', 'permis B & A'],
]
