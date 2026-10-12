import type { Project, ProjectCategory } from '@/types'

/**
 * Projets sélectionnés pour le portfolio.
 * Contenu rédigé à partir des README et du code des dépôts publics github.com/M4xxes.
 * Les statistiques (étoiles, dernière mise à jour) sont ajoutées automatiquement côté serveur (src/lib/github.ts).
 */
export const projects: Project[] = [
  {
    id: 'mixer-hmi',
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
    id: 'api-marketplace',
    tone: 'dark',
    title: 'API Marketplace',
    tagline: 'API REST avec authentification JWT et rotation des tokens',
    description:
      'API de marketplace en Express et TypeScript : catalogue avec pagination, tri, filtres et projection, authentification par access token et refresh token.',
    context:
      "Travail pratique de fin de module consacré aux API. Le but : construire une API proche des standards de production, avec une interface web minimale pour tester tous les cas d'usage.",
    contributions: [
      'Modélisation des données avec Prisma (produits, catégories, utilisateurs, types de produit)',
      'Authentification : access tokens courts et refresh tokens persistés, avec rotation',
      'Routes protégées par middleware et hachage des mots de passe avec bcrypt',
      'Interface de test HTML pour exercer chaque route',
    ],
    features: [
      'Pagination, tri, filtres par catégorie et prix, projection des champs',
      'Inclusion de la relation catégorie à la demande',
      'Création de produits réservée aux utilisateurs authentifiés',
      'Migrations et jeu de données de démonstration (seed)',
    ],
    challenges: [
      {
        title: 'Rotation des refresh tokens',
        text: 'Access tokens à durée courte et refresh tokens persistés en base, renouvelés à chaque rafraîchissement pour limiter l’impact d’un vol de token.',
      },
      {
        title: 'Une route catalogue flexible',
        text: 'Pagination, tri, filtres, projection des champs et inclusion de la catégorie combinables sur la même route /products.',
      },
    ],
    stack: ['Node.js', 'Express', 'TypeScript', 'Prisma', 'SQLite', 'JWT'],
    category: 'backend',
    year: '2025',
    role: 'Développement back-end',
    repo: 'API-TP-FINAL',
    featured: true,
    cover: {
      src: '/projects/api-marketplace.webp',
      alt: 'Capture de l’interface de test de l’API : authentification, tokens, requête /products et création de produit',
      width: 1600,
      height: 1000,
      kind: 'screenshot',
    },
  },
  {
    id: 'dashboard-meteo',
    tone: 'light',
    title: 'Dashboard météo',
    tagline: 'Application météo en Vue 3 avec villes favorites',
    description:
      'Application météo en Vue 3 : recherche par ville, conditions actuelles, prévisions sur cinq jours et favoris sauvegardés, avec l’API Open-Meteo.',
    context:
      "Une application Vue 3 (Composition API) construite avec une contrainte : aucune clé d'API à configurer, pour que le projet se lance immédiatement.",
    contributions: [
      'Architecture Vue 3 : composants, routeur et stores Pinia',
      'Service d’accès à Open-Meteo (géocodage et prévisions) avec Axios',
      'Persistance de la dernière ville et des favoris dans le localStorage',
      'États de chargement et gestion des erreurs (ville introuvable)',
    ],
    features: [
      'Météo actuelle : température, ressenti, humidité, vent',
      'Prévisions sur cinq jours',
      'Onglets Météo et Favoris',
      'Fond dynamique selon la météo',
    ],
    challenges: [
      {
        title: 'Zéro configuration',
        text: 'L’API Open-Meteo sert à la fois au géocodage des villes et aux prévisions, sans clé d’API à fournir.',
      },
    ],
    stack: ['Vue 3', 'Pinia', 'Vue Router', 'Axios', 'Vite'],
    category: 'web',
    year: '2026',
    role: 'Développement',
    repo: 'Dashboard-meteo-Vue',
    featured: true,
    cover: {
      src: '/projects/meteo.webp',
      alt: 'Illustration : trajectoire du soleil et barres de températures sur cinq jours',
      width: 1600,
      height: 1000,
      kind: 'illustration',
    },
  },
  {
    id: 'soundboard-studio',
    tone: 'dark',
    title: 'Soundboard Studio',
    tagline: 'Application de bureau Electron pour le streaming',
    description:
      'Soundboard de bureau : import de sons, raccourcis clavier globaux, enregistrement au micro et choix de la sortie audio pour Discord ou OBS.',
    context:
      "Une application pensée pour les streamers : déclencher des sons depuis n'importe quelle application et les envoyer dans un câble audio virtuel pour qu'ils passent dans Discord ou OBS.",
    contributions: [
      'Architecture Electron : processus principal, preload et renderer isolés',
      'Bridge IPC sécurisé via contextBridge, avec liste blanche de canaux',
      'Gestion de la bibliothèque, des raccourcis globaux et du stockage local',
      'Interface avec recherche, catégories et thème clair / sombre',
    ],
    features: [
      'Import par bouton ou glisser-déposer (mp3, wav, ogg, m4a…)',
      'Raccourcis clavier globaux, actifs même en arrière-plan',
      'Enregistrement depuis le micro au choix',
      'Sélection de la sortie audio (câble virtuel pour Discord, OBS)',
    ],
    challenges: [
      {
        title: 'Isoler l’interface du système',
        text: 'Le renderer n’a aucun accès direct à Node.js ni au disque : un preload expose une API limitée via contextBridge, avec une liste blanche de canaux IPC.',
      },
      {
        title: 'Des sons déclenchables de partout',
        text: 'Raccourcis clavier globaux enregistrés côté processus principal, actifs même quand l’application est en arrière-plan.',
      },
    ],
    stack: ['Electron', 'JavaScript', 'Node.js', 'HTML', 'CSS'],
    category: 'desktop',
    year: '2026',
    role: 'Développement',
    repo: 'Electron',
    featured: true,
    cover: {
      src: '/projects/soundboard.webp',
      alt: 'Capture de Soundboard Studio : barre d’outils (volume, sortie, micro, enregistrement) et cartes des sons par défaut',
      width: 1600,
      height: 1000,
      kind: 'screenshot',
    },
    gallery: [
      {
        src: '/projects/soundboard-light.webp',
        alt: 'Capture de Soundboard Studio en thème clair',
        width: 1600,
        height: 1000,
        kind: 'screenshot',
      },
    ],
  },
  {
    id: 'map-app',
    tone: 'dark',
    title: 'Map — app mobile iOS',
    tagline: 'Globe interactif des pays visités',
    description:
      'Application iOS en Flutter avec Mapbox : globe rotatif animé, gestes tactiles avancés, localisation en temps réel et coloration des pays visités.',
    context:
      'Projet personnel pour visualiser ses voyages : on fait tourner le globe, on zoome et on colore les pays déjà visités.',
    contributions: [
      'Intégration de Mapbox dans une application Flutter',
      'Gestes tactiles : rotation, pinch-to-zoom, sélection de pays',
      'Puck de géolocalisation en temps réel',
    ],
    features: [
      'Globe 3D rotatif et animé',
      'Coloration des pays visités',
      'Géolocalisation de l’utilisateur',
    ],
    stack: ['Flutter', 'Dart', 'Mapbox', 'iOS'],
    category: 'mobile',
    year: '—',
    role: 'Projet personnel',
    cover: {
      src: '/projects/map.webp',
      alt: 'Illustration : globe filaire avec plusieurs pays colorés et un point de localisation',
      width: 1600,
      height: 1000,
      kind: 'illustration',
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
