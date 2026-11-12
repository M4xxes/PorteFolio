import type { Project, ProjectCategory } from '@/types'

/**
 * Projets sélectionnés pour le portfolio.
 * Contenu rédigé à partir des README et du code des dépôts publics github.com/M4xxes.
 * Les statistiques (étoiles, dernière mise à jour) sont ajoutées automatiquement côté serveur (src/lib/github.ts).
 */
export const projects: Project[] = [
  {
    id: 'mixer-hmi',
    short: 'SUPERVISION MULTI-MALAXEURS',
    tag: 'WEB · INDUSTRIEL · 2026',
    roleLine: 'Interface & front-end · intégration API',
    story:
      'Il fallait piloter six malaxeurs industriels depuis un seul écran. J’ai développé l’interface en React et TypeScript : vue d’ensemble, recettes éditables jusqu’à 32 étapes, alarmes à acquitter, historique des lots exportable en CSV. Je l’ai branchée sur l’API REST du projet ; un collaborateur s’est chargé de la base, de Node-RED et des automates.',
    tone: 'dark',
    title: 'Supervision multi-malaxeurs',
    tagline: 'Écran de contrôle industriel pour six malaxeurs',
    description:
      'Application web de supervision et de pilotage de six malaxeurs industriels : recettes, mode manuel, stocks, alarmes et historique des lots.',
    context:
      "Projet client réel : une interface web de supervision pour piloter plusieurs malaxeurs industriels depuis un seul écran, connectée aux données de production via une API REST. Le travail a été partagé avec un collaborateur.",
    contributions: [
      'Interface React / TypeScript : vue d’ensemble temps réel, détail par malaxeur, navigation par pages',
      'Conception des tableaux de bord de contrôle et des indicateurs visuels d’état',
      'Intégration de l’API REST Node.js / Express côté front',
      'La base de données, Node-RED, OPC-UA / Modbus et la partie automate ont été gérés par un collaborateur',
    ],
    features: [
      'Vue d’ensemble : malaxeurs en production, compteur et cartes des alarmes actives (avertissement / critique)',
      'Recettes et ingrédients : nombre de recettes par malaxeur, recettes récentes, copie d’une recette existante',
      'Recettes éditables étape par étape (jusqu’à 32 étapes)',
      'Alarmes : compteurs actives / critiques, filtres (malaxeur, niveau, statut, période), acquittement unitaire ou global',
      'Historique des lots : filtres par malaxeur, recette, statut et dates, détail de chaque lot et export CSV',
      'Maintenance : état de connexion des automates et gestion des utilisateurs (rôle, groupe de malaxeurs)',
      'Pages Balance manuelle et Production',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Recharts', 'Node.js', 'Express', 'MySQL', 'Docker'],
    category: 'web',
    year: '2026',
    role: 'Développement front-end & intégration API',
    repo: 'Industrial-Mixer-Control-Screen',
    featured: true,
    // Visuel de présentation (maquette stylisée) : signalé comme illustration, les captures réelles sont dans la galerie.
    cover: {
      src: '/projects/mixer-cover.webp',
      alt: 'Visuel de présentation : titre « Supervision Multi-Malaxeurs », chiffres clés et maquette du tableau de bord des six malaxeurs',
      width: 1600,
      height: 1000,
      kind: 'illustration',
    },
    gallery: [
      {
        src: '/projects/mixer-overview.webp',
        alt: 'Capture de la vue d’ensemble : malaxeurs en production, compteur et cartes des alarmes actives',
        width: 1600,
        height: 885,
        kind: 'screenshot',
      },
      {
        src: '/projects/mixer-recettes.webp',
        alt: 'Capture de la gestion des recettes et ingrédients : recettes par malaxeur et recettes récentes',
        width: 1600,
        height: 884,
        kind: 'screenshot',
      },
      {
        src: '/projects/mixer-alarmes.webp',
        alt: 'Capture de la page Alarmes : compteurs, filtres et liste avec acquittement',
        width: 1600,
        height: 885,
        kind: 'screenshot',
      },
      {
        src: '/projects/mixer-historique.webp',
        alt: 'Capture de l’historique des recettes : filtres, lots de production et export CSV',
        width: 1600,
        height: 887,
        kind: 'screenshot',
      },
      {
        src: '/projects/mixer-maintenance.webp',
        alt: 'Capture de la page Maintenance : état des communications automates et gestion des utilisateurs',
        width: 1600,
        height: 889,
        kind: 'screenshot',
      },
    ],
  },
  {
    id: 'animarah',
    short: 'ANIMARAH',
    tag: 'WEB · VITRINE · 2026',
    roleLine: 'Conception · développement · mise en ligne',
    story:
      'Une praticienne en massage équin voulait un site simple pour des propriétaires de chevaux pas toujours à l’aise avec le web. J’ai conçu et développé les cinq pages, de la maquette à la mise en ligne sur Netlify : massages, communication animale, formules avec leur grille tarifaire, contact. Les images sont optimisées pour une lecture confortable sur mobile.',
    tone: 'light',
    title: 'Animarah',
    tagline: 'Site vitrine pour une praticienne en massage équin',
    description:
      'Site vitrine multipage pour une activité de massage équin et de communication animale en région lyonnaise : présentation, prestations, formules et contact.',
    context:
      "Une praticienne avait besoin d'un site sobre et rassurant pour présenter son activité à une clientèle de propriétaires de chevaux, souvent peu technophile. Le site devait être rapide, lisible sur mobile et bien référencé localement.",
    contributions: [
      'Conception et développement complet du site, de la maquette à la mise en ligne',
      'Intégration responsive et typographie éditoriale adaptée à l’univers équestre',
      'Optimisation des images et des performances',
      'Déploiement et hébergement sur Netlify',
    ],
    features: [
      'Pages Accueil, Massages, Communication animale, Formules et Contact',
      'Grille tarifaire des formules (massages, suivis, concours)',
      'Galerie photo et mises en page éditoriales',
      'Navigation claire et adaptée au mobile',
    ],
    stack: ['TypeScript', 'Vite', 'HTML', 'CSS', 'Netlify'],
    category: 'web',
    year: '2026',
    role: 'Conception & développement',
    repo: 'SiteSarah',
    demoUrl: 'https://animarah.netlify.app',
    featured: true,
    cover: {
      src: '/projects/animarah.webp',
      alt: 'Capture de la page d’accueil d’Animarah : logo, navigation et bandeau « Accompagner votre cheval avec douceur et respect »',
      width: 1600,
      height: 1000,
      kind: 'screenshot',
    },
    gallery: [
      {
        src: '/projects/animarah-massages.webp',
        alt: 'Capture de la page Massages d’Animarah : « Prendre soin du cheval dans sa globalité »',
        width: 1600,
        height: 1000,
        kind: 'screenshot',
      },
      {
        src: '/projects/animarah-formules.webp',
        alt: 'Capture de la page Formules d’Animarah : « Accompagnements sur-mesure »',
        width: 1600,
        height: 1000,
        kind: 'screenshot',
      },
      {
        src: '/projects/animarah-mobile.webp',
        alt: 'Capture de la page d’accueil d’Animarah sur mobile',
        width: 780,
        height: 1688,
        kind: 'screenshot',
      },
    ],
  },
  {
    id: 'evastre',
    short: 'EVASTRE PHOTOGRAPHIE',
    tag: 'WEB · PORTFOLIO · 2026',
    roleLine: 'Conception · développement',
    story:
      'Le portfolio d’une photographe lyonnaise tenait sur une plateforme générique. Je l’ai refait sur mesure en React : une grille de projets filtrable (sport, événementiel, auto/moto, portrait) et une page par série. On parcourt les photos dans une visionneuse au clavier ou au swipe, et un script génère chaque photo en WebP en 640, 1280 et 1920 px.',
    tone: 'dark',
    title: 'Evastre Photographie',
    tagline: 'Portfolio sur mesure pour une photographe lyonnaise',
    description:
      'Refonte en React du portfolio d’une photographe : galeries par projet filtrables, visionneuse plein écran et images optimisées en plusieurs résolutions.',
    context:
      "Le portfolio d'origine reposait sur une plateforme générique. La refonte reprend son contenu éditorial dans un site sur mesure et plus personnel, où les photos restent au centre : sport, événementiel, portrait et univers auto / moto.",
    contributions: [
      'Développement complet du site en React avec Vite et Tailwind CSS',
      'Visionneuse plein écran : clavier, gestes tactiles, photos et vidéos',
      'Script de génération des images WebP en plusieurs tailles (640 / 1280 / 1920 px)',
      'Métadonnées SEO et Open Graph, mise en ligne sur Netlify',
    ],
    features: [
      'Accueil plein écran avec la photo de couverture d’un projet',
      'Grille des projets filtrable : Sport, Événementiel, Auto / Moto, Portrait',
      'Une page par projet avec sa galerie et la navigation projet précédent / suivant',
      'Visionneuse avec navigation au clavier et au swipe',
      'Images responsives chargées selon la taille de l’écran',
    ],
    challenges: [
      {
        title: 'Des photos lourdes, chargées vite',
        text: 'Un script shell génère chaque photo en WebP en trois largeurs (640, 1280 et 1920 px) ; le navigateur charge la taille adaptée à l’écran.',
      },
      {
        title: 'Une visionneuse utilisable partout',
        text: 'Navigation au clavier (flèches, Échap), au swipe sur mobile, et blocage du défilement de la page pendant l’affichage.',
      },
    ],
    stack: ['React', 'Vite', 'Tailwind CSS', 'JavaScript', 'Netlify'],
    category: 'web',
    year: '2026',
    role: 'Conception & développement',
    repo: 'Evasive',
    demoUrl: 'https://evastre.netlify.app',
    featured: true,
    cover: {
      src: '/projects/evastre.webp',
      alt: 'Capture de l’accueil d’Evastre Photographie : titre manuscrit « Evastre Photographie » sur une photo de moto vue du dessus',
      width: 1600,
      height: 1000,
      kind: 'screenshot',
    },
    video: {
      src: '/projects/evastre-tour.mp4',
      poster: '/projects/evastre-tour-poster.webp',
      width: 1280,
      height: 800,
      duration: 30,
    },
    gallery: [
      {
        src: '/projects/evastre-work.webp',
        alt: 'Capture de la section « Mon travail » : filtres par catégorie et grille de projets',
        width: 1600,
        height: 1000,
        kind: 'screenshot',
      },
      {
        src: '/projects/evastre-project.webp',
        alt: 'Capture de la page du projet « Emmy Shooting » et de sa galerie',
        width: 1600,
        height: 1000,
        kind: 'screenshot',
      },
      {
        src: '/projects/evastre-lightbox.webp',
        alt: 'Capture de la visionneuse plein écran avec navigation entre les photos',
        width: 1600,
        height: 1000,
        kind: 'screenshot',
      },
      {
        src: '/projects/evastre-mobile.webp',
        alt: 'Capture de l’accueil d’Evastre Photographie sur mobile',
        width: 780,
        height: 1688,
        kind: 'screenshot',
      },
    ],
  },
  {
    id: 'notchpack',
    short: 'NOTCHPACK',
    tag: 'DESKTOP · MACOS · 2026',
    roleLine: 'Co-création avec Quentin Contreau',
    story:
      'L’encoche des MacBook est un espace perdu. Avec Quentin Contreau, nous avons conçu NotchPack, une barre qui s’y installe sous macOS : lecture de la musique, volume, luminosité, batterie et prochains événements du calendrier à portée de clic. Le dépôt contient la page de présentation et le fichier d’installation.',
    tone: 'dark',
    title: 'NotchPack',
    tagline: 'Une barre dans l’encoche du MacBook',
    description:
      'Application macOS qui transforme l’encoche du MacBook en zone utile : contrôles musicaux, volume et luminosité, batterie, événements du calendrier.',
    context:
      'Projet réalisé à deux avec Quentin Contreau, développeur freelance. La vidéo montre la barre en fonctionnement sur macOS : lecteur musical dans l’encoche et indicateur de batterie.',
    contributions: [
      'Co-conception du projet avec Quentin Contreau',
      'Page de présentation du projet en React, TypeScript, Vite et Tailwind CSS, avec animations GSAP (dépôt public NotchPack)',
    ],
    features: [
      'Contrôles de la musique et pochette d’album dans l’encoche',
      'Volume et luminosité dans un affichage intégré en haut de l’écran',
      'État de la batterie',
      'Prochains événements du calendrier',
      'Installation par fichier DMG',
    ],
    stack: ['macOS', 'TypeScript', 'React', 'Vite', 'Tailwind CSS', 'GSAP'],
    category: 'desktop',
    year: '2026',
    role: 'Co-création, avec Quentin Contreau',
    repoUrl: 'https://github.com/Tokennn/NotchPack',
    demoUrl: 'https://notchpack.netlify.app',
    featured: true,
    cover: {
      src: '/projects/notch-demo-poster.webp',
      alt: 'Capture de NotchPack sous macOS : lecteur musical dans l’encoche en haut de l’écran, indicateur de batterie à gauche',
      width: 1280,
      height: 796,
      kind: 'screenshot',
    },
    video: {
      src: '/projects/notch-demo.mp4',
      poster: '/projects/notch-demo-poster.webp',
      width: 1280,
      height: 796,
      duration: 20,
      label: 'Démonstration de NotchPack sous macOS : lecteur musical affiché dans l’encoche et indicateur de batterie',
      caption: 'Démonstration filmée — 20 s, sans son',
    },
  },
]

export const categoryLabels: Record<ProjectCategory, string> = {
  web: 'Web',
  mobile: 'Mobile',
  desktop: 'Desktop',
  backend: 'Back-end',
}

export function getProject(id: string) {
  return projects.find((p) => p.id === id)
}

export const featuredProjects = projects.filter((p) => p.featured)

/**
 * Descriptions de repli pour les dépôts GitHub sans description,
 * rédigées à partir de leur README et de leur code.
 */
export const repoDescriptions: Record<string, string> = {
  BlogB2: 'Blog en React, TypeScript et Tailwind CSS retraçant une expérience de stage.',
  pokemon_like: 'Jeu de combat façon Pokémon en C# / WPF (MVVM) : comptes, monstres et sorts.',
  charityGift: 'Hackathon : site qui regroupe des associations caritatives lyonnaises pour faciliter les dons.',
  AnimeList: 'Application de bureau JavaFX pour gérer sa liste d’animés, avec stockage CSV.',
  HangmanPackage: 'Jeu du pendu en ligne de commande, écrit en Go.',
}
