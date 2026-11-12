# PROGRESS — refonte « arcade futuriste »

Mémoire commune entre les modèles. À relire au début de chaque phase, avec le prompt de travail.

## État

| Phase | Modèle | Statut |
| --- | --- | --- |
| 0 — Cadrage | Opus 5.5 | Terminée |
| 1 — Fondations de l'interface | Opus 5.5 | **Terminée** (commit `phase-1`) |
| 2 — Hero 3D | Fable 5.2 | **Terminée** (commit `phase-2`), à montrer à Maxime avant la phase 3 |
| 3 — Carrousel 3D + shader écran | Fable 5.2 | À faire |
| 4 — Salle de contrôle + caméra | Fable 5.2 | À faire |
| 5 — Secours, mobile, a11y | Opus 5.5 | À faire |
| 6 — Polish | Sonnet 5.5 | À faire |
| 7 — Vérification | Sonnet 5.5 | À faire |

Point de départ : commit `dc33fcd` (refonte crème / orange). Elle sera remplacée par l'identité arcade.

## Phase 1 — ce qui est fait

- **Polices** : Geist Pixel Square (`geist/font/pixel`), Departure Mono v1.500 (`src/app/fonts/`, licence OFL jointe ; dans `src/app` et non `public/fonts` car `next/font/local` l'auto-héberge), Doto (`next/font/google`, variable).
- **Tokens** : `src/app/globals.css` (`--accent` en une ligne). Classes `.pixel`, `.ui`, `.doto`, `.caret`, `.press`, `.nudge`, `.invert-hover`, `.screen-lines`, `.grain`, `.stagger`.
- **Boucle unique** : `src/lib/loop.ts` (`addFrame(cb, priorité)`). Lenis = 0, curseur = 10. **La 3D doit s'y brancher en priorité 20** (Canvas `frameloop="never"` + `advance(time)`).
- **Store** : `src/lib/store.ts` (`ui` vanilla zustand). `scroll {y, progress, velocity}` publié chaque frame par `ScrollEngine` ; `pointer {x, y, nx, ny}` par `Cursor` ; `work {active, mode}` ; `quality` ; `liteForced` ; `menuOpen`.
- **Shell** (`src/components/shell/`) : `ScrollEngine` (Lenis, `lockScroll`, `scrollToTarget`), `Header` + `ScrollBar` / `ScrollPercent` (mis à jour hors React), `MenuOverlay` (`<dialog>` modal : focus piégé, Échap, scroll bloqué), `BootScreen` + `bootScript`, `Cursor` (`data-cursor="OUVRIR"` pour l'étiquette), `Magnetic` (6 px, ressort), `DecodeText` (240 ms), `Clock`, `LiteToggle`, `Wordmark`.
- **Sections** (`src/components/sections/`) : `Hero`, `Work` (+ `WorkList`, `WorkCounter`), `Method` (fixée ≥ 768 px), `Skills` (cascade 40 ms, CSS, visible sans JS), `About`, `Contact`, `Footer` + `EasterEgg`.
- **Emplacements 3D** : `[data-scene="hero"]` (occupé par `fallback/DotSphere`, SVG statique) et `[data-scene="carousel"]` (occupé par `fallback/ProjectCards`, cartes 2D qui mettent à jour `work.active`).
- **Données** : `projects.ts` gagne `short`, `tag`, `roleLine`, `story` (textes de la phase 0). `lib/data/method.ts`. `skillCount`.
- **Routes** : une page + `/projects/[slug]` (page classique restylée). `/projects`, `/about`, `/contact` → redirections 307 vers les ancres. Anciennes pages et composants supprimés (récupérables via git, commit `dc33fcd`).
- **Icônes** : favicon « M » pixel + point accent, image Open Graph sombre.
- **Vérifié** (Playwright + Chrome, build de production) : démarrage (compteur 000 → 100 sur de vraies étapes, sortie ≤ 1,5 s, `#site` inerte pendant), menu (ouverture, focus sur FERMER, Échap, lien vers ancre), ancres sous l'en-tête, méthode fixée, easter egg, redirections, 375 px sans débordement, reduced motion (pas de boot ni de curseur), sans JS (pas de boot), 0 erreur console.

## Phase 2 — ce qui est fait

- **Dépendances** : `three`, `@react-three/fiber` (v9), `@types/three`. `drei`, `postprocessing` et `detect-gpu` ne sont pas encore installés : rien ne les utilise (à ajouter quand une phase en a besoin).
- **`three/SceneRoot.tsx`** (dans le layout) : monte la scène seulement sur `/`, écran ≥ 1024 px, WebGL dispo, hors reduced motion, hors « version légère ». `next/dynamic` + `ssr: false` : le chunk three (≈ 930 Ko bruts) n'est ni dans le HTML ni chargé sur mobile. Publie `ui.scene` (`loading` / `ready` / `off`) et `ui.quality`.
- **`three/Stage.tsx`** : le seul `<Canvas>` (fixe, `-z-10`, `pointer-events: none`, `aria-hidden`, `frameloop="never"`, `dpr [1, 1.5]`, alpha). Abonné à `addFrame(…, 20)` → `advance(time / 1000)` : une seule boucle, après Lenis. Rendu à la demande : arrêt après `T_END` (+ 2 frames pour vider). Synchronise aussi le HTML sur la même frame (titre du hero, `--handoff`).
- **`three/heroTimeline.ts`** : mesures DOM (`measure()` sur resize / ResizeObserver) et chronologie `heroT()` = `scroll.y / yEnd`. Caméra perspective `FOV 30`, `z = 10` ; `metrics.wpp` = unités monde par pixel dans le plan z = 0 (pour caler la 3D sur le DOM au pixel près).
- **`three/HeroParticles.tsx`** : `InstancedMesh` de 1 960 quads (56 × 35), tout le mouvement est dans le vertex shader (aucune matrice recalculée en JS). Sphère de Fibonacci, taille et opacité selon la profondeur, quelques points accent sur la face avant, rotation lente + ressort amorti vers le curseur. Au scroll : la sphère grossit et se disperse (0 → 0,5), puis les particules rejoignent une grille 16:10 posée exactement sur la capture du premier projet (0,4 → 1), en prenant les couleurs de la capture (mosaïque). De 0,97 à 1,08, la mosaïque s'efface et la vraie capture HTML apparaît (`--handoff`). La vitesse du scroll étire les particules en vol.
- **CSS** : le fond est sur `<html>` (plus sur `<body>`) pour que le canvas en z négatif reste visible. `html[data-scene="on"]` masque la sphère SVG et rend la cible transparente.
- **Écran de démarrage** : 3e ligne « SCÈNE 3D » (OK à la première image dessinée, « NON UTILISÉE » en version légère).
- **Vérifié** (Chrome, GPU Apple M2, build de production) : 60 images/s pendant le défilement (médiane et p95 à 16,7 ms), aller-retour du scroll (état du titre restauré), navigation vers un projet puis retour (canvas démonté puis remonté), passage sous 1024 px (retour à la sphère SVG), version légère, 0 erreur console. Seul avertissement : `THREE.Clock` déprécié, émis par R3F lui-même.

## Notes pour la phase 3 (Fable 5.2)

- La cible de la transition est `[data-scene-target="first-screen"]` (lien-image de la 1re carte, dans `fallback/ProjectCards`). Quand le carrousel existera, pointer la mosaïque vers l'écran actif du cylindre (mêmes `uPlane` + un éventuel `uPlaneRot`) et supprimer le relais `--handoff` en version complète.
- Ajouter le carrousel comme second enfant du `<Canvas>` de `Stage.tsx` ; étendre la condition de rendu à la demande (aujourd'hui `t < T_END`) à la section fixée.
- La liste `WorkList` doit rester la navigation ; en version complète, intercepter le clic pour faire défiler jusqu'au projet (`scrollToTarget`).
- Le shader écran (barillet, lignes, grain, RGB) lit `ui.getState().scroll.velocity` (déjà lissée, en px/frame).

## Direction (5 lignes)

1. Un écran de borne éteint en 2026 : fond presque noir, texte os, un seul vert phosphore, réservé aux signaux (disponible, actif, progression).
2. La grille fait le travail : 12 colonnes, filets de 1 px, angles droits, index `[01]`. Pas d'ombre, pas de dégradé, pas de verre.
3. Trois voix typographiques : Geist Pixel crie (titres), Departure Mono parle (interface), Doto compte (chiffres).
4. Le mouvement suit le geste : la vitesse du scroll et la position du curseur pilotent les effets, et tout redevient net à l'arrêt.
5. Le HTML d'abord : contenu, liens et navigation existent sans la 3D ; le WebGL est une couche ajoutée par-dessus.

## Revue des animations (à la place de find-animation-opportunities, non installée)

| Élément du plan | Avis | Décision proposée |
| --- | --- | --- |
| Écran de démarrage + `useProgress` | Le canvas est chargé en différé : au démarrage, `useProgress` ne voit rien. Un loader qui recouvre le hero retarde aussi le LCP. | Compteur alimenté par de vrais signaux (polices, chunk 3D, textures du hero). Plafond 1,5 s. Le hero est rendu dessous. Pas de loader en version légère, sur mobile, en reduced motion ni sur `/projects/[slug]`. |
| Sphère → particules → 1er écran du carrousel | La transition la plus coûteuse et la plus risquée du plan. | La garder, pilotée par le scroll (scrub, aucune durée propre), avec un fondu en repli si elle n'est pas prête en phase 2. |
| Skew lié à la vitesse | Sur du HTML, il gêne la lecture. | Seulement dans le WebGL (écrans). Le HTML reste droit. |
| Décodage des liens + `_` clignotant + grain + sons 8-bit | Quatre micro-effets « arcade » qui s'empilent. | Garder le décodage (≤ 250 ms, survol uniquement) et le `_` (3 fois). Grain = texture statique (pas d'animation plein écran). Sons reportés en phase 6, optionnels. |
| Salle de contrôle « industrielle » pour les 7 projets | Cohérente pour les malaxeurs, moins pour Animarah ou Map. Il manque aussi des captures (voir plus bas). | Partir directement sur la version simple (sol, mur, 3 écrans, voyants), présentée comme une « salle d'écrans » neutre. |
| Deux sections fixées (carrousel ~400 vh + méthode) | Long. Risque de « scroll bloqué ». | Carrousel : ~60 vh par projet, snap doux, liste HTML toujours cliquable. Méthode : 4 étapes sur ~200 vh. |
| Thème clair | Coûte autant que le reste (shader, textures). | Abandonné pour cette refonte. |

## Architecture proposée

```
src/
  app/
    layout.tsx              polices (Geist Pixel Square, Departure Mono local, Doto), Header, Cursor, Grain, BootScreen
    page.tsx                une seule page : hero → sélection → méthode → compétences → à propos → contact
    projects/[slug]/page.tsx  page projet classique (SEO, version légère) ; en version complète, la scène s'ouvre directement dans la salle
    about/, contact/        redirection 308 vers /#about et /#contact (anciens liens conservés)
  components/
    shell/                  Header, MenuOverlay, ScrollProgress, Clock, Cursor, Magnetic, DecodeText, Grain, BootScreen
    sections/               Hero, WorkList (vraie navigation), Method, Skills, About, Contact, Footer, EasterEgg
    fallback/               DotGrid (SVG statique), ProjectCards (2D)
    three/                  (phases 2–4) SceneRoot (dynamic, ssr:false), Stage (le seul <Canvas>), HeroSphere,
                            ProjectCarousel, ScreenMaterial (shader), ControlRoom, CameraRig
  lib/
    store.ts                zustand (vanilla) : scroll {progress, velocity}, pointer {x, y}, work {active, mode: carousel|room},
                            quality {full|lite}. La 3D lit getState() dans useFrame, sans re-render React.
    loop.ts                 une seule boucle rAF : lenis.raf(t) puis advance(t) de R3F (Canvas en frameloop="never"),
                            uniquement si quelque chose bouge (scroll, pointeur, transition) → équivalent de "demand".
    quality.ts              WebGL dispo, detect-gpu (tier < 2 → lite), FPS < 30 pendant 2 s → lite,
                            prefers-reduced-motion → lite, choix manuel « VERSION LÉGÈRE » (localStorage).
    data/projects.ts        contenu existant + champs story, roleLine, tag, screens[3]
```

- Le canvas est fixe, en plein écran, derrière le HTML, en `aria-hidden`. Les sections HTML réservent la place (blocs vides en phase 1) et publient leur position dans le store.
- Salle : au clic, `history.pushState('/projects/slug')`. Échap ou FERMER → retour à `/`, sur le même projet. En chargement direct, le serveur rend la page projet classique, puis la version complète monte la scène en mode salle sans animation d'entrée.
- Dépendances ajoutées en phase 1 : `geist`, `zustand`, Departure Mono (woff2 OFL dans `public/fonts`), Doto (`next/font/google`). Phase 2 : `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `detect-gpu`.

## Contenu : phrases-histoires et rôles (à valider)

Voir le message de fin de phase 0. Intégration en phase 1 une fois validées.

## Captures (3 par projet : accueil, détail, mobile)

| Projet | Accueil | Détail | Mobile |
| --- | --- | --- | --- |
| Supervision multi-malaxeurs | ✓ mixer-overview | ✓ recettes, alarmes, historique, maintenance | ✗ (écran d'atelier : 3e capture de bureau proposée à la place) |
| Animarah | ✓ | ✓ massages, formules | ✓ |
| Evastre | ✓ | ✓ projet, visionneuse | ✓ |
| API Marketplace | ✓ interface de test | ✗ | ✗ (sans objet : proposer réponse JSON / terminal) |
| Dashboard météo | ✗ (illustration seulement) | ✗ | ✗ |
| Soundboard Studio | ✓ thème sombre | ✓ thème clair | ✗ (desktop : proposer import / raccourcis) |
| Map | ✗ (illustration seulement) | ✗ | ✗ |

## Problèmes ouverts

- Evastre : le prompt cite le repo `EvaMassPF` et un espace admin. `EvaMassPF` est le portfolio d'Eva Masson (audiovisuel, Decap CMS sur `/admin`). `Evasive`, le repo d'evastre.netlify.app, n'a pas d'admin. À trancher.
- Malaxeurs : le texte dit « six malaxeurs », les captures en montrent B1 à B7.
- Map : pas de dépôt public, pas d'année. Année à confirmer.
- Skills `design-taste-frontend`, `/impeccable`, `find-animation-opportunities`, `emil-design-eng`, `animation-vocabulary` non installés : travail fait à la main. `PRODUCT.md` non créé.
- **Sécurité** : `next@16.4.0` est touché par des vulnérabilités critiques (GHSA-2464-fhr4-w9xw, GHSA-p3m5-59mp-jv5r, GHSA-673q-mjm6-r5xr). Correctif : `next@16.4.6` (+ `eslint-config-next@16.4.6`). Le build s'arrête une fois sur un avertissement, puis passe à la relance. Mise à jour en attente de l'accord de Maxime.
- Choix par défaut appliqués faute de réponse : Evastre sans espace admin (repo `Evasive`), « six malaxeurs » conservé, Map sans année.
- Formulaire de contact masqué tant que `RESEND_API_KEY` n'est pas configurée (l'e-mail direct reste proposé).
- Lighthouse ≥ 90 sur mobile vaut pour la version légère. En version complète, l'objectif est 60 fps sur un portable récent.
