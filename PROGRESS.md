# PROGRESS — refonte « arcade futuriste »

Mémoire commune entre les modèles. À relire au début de chaque phase, avec le prompt de travail.

## État

| Phase | Modèle | Statut |
| --- | --- | --- |
| 0 — Cadrage | Opus 5.5 | Terminée |
| 1 — Fondations de l'interface | Opus 5.5 | **Terminée** (commit `phase-1`) |
| 2 — Hero 3D | Fable 5.2 | Terminée (commit `phase-2`) |
| 3 — Carrousel 3D + shader écran | Fable 5.2 | Terminée (commit `phase-3`) |
| 4 — Salle de contrôle + caméra | Fable 5.2 | Terminée (commit `phase-4`) |
| 5 — Secours, mobile, a11y | Opus 5.5 | **Terminée** (commit `phase-5`) |
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

## Phase 3 — ce qui est fait

- **`sections/Work.tsx`** (client) : deux rendus selon `ui.quality`. `full` → `WorkStage` (section fixée) ; sinon (rendu serveur, mobile, version légère) → liste + `fallback/ProjectCards`. `SceneRoot` passe `quality` à `full` dès sa décision (avant le chargement de three) ; une `SceneBoundary` repasse en `lite` si la scène plante.
- **`sections/WorkStage.tsx`** : bloc `[data-scene="carousel"][data-pinned]` de `100 + 6 × 60` svh, contenu `sticky`. HTML : nom fantôme (Geist Pixel, flou, 5 %), `WorkList`, lien « Ouvrir le projet … » posé sur l'écran actif (`.screen-rect`, `data-cursor="OUVRIR"`, contient la capture HTML tant que la scène n'a pas dessiné), libellé `[03] NOM` (+ « · Visuel » si la couverture est une illustration), `WorkCounter`. Calcule le projet actif depuis le scroll et fait l'aimantation douce (180 ms après l'arrêt, `lenis.scrollTo` 0,55 s, annulable par l'utilisateur).
- **Liste** : toujours des liens vers `/projects/[slug]`. En version complète, un clic fait défiler jusqu'au projet ; un clic sur le projet déjà actif (ou Cmd/Ctrl-clic) ouvre la page.
- **`three/heroTimeline.ts`** : mesures communes HTML/3D (n'importe pas three). `metrics.screen` = rectangle de l'écran actif (`screenRect()`, même formule que `.screen-rect` en CSS), `metrics.work` = `{top, range, step, count}`, `workState()` = `{p, offset, onScreen}`, `poke()` pour demander un rendu. `heroT()` vaut 1 quand la section se fixe (`T_END = 1`).
- **`three/ProjectCarousel.tsx`** : 7 `Mesh` (un `PlaneGeometry` partagé, un `ShaderMaterial` par écran) sur un cylindre (`RADIUS` 1,15 × largeur, pas de 360° / 7), diagonale `DIAGONAL` 0,62 (précédent vers le bas-gauche, suivant depuis le haut-droit), opacité selon le cosinus, inclinaison du groupe vers le curseur (ressort). Textures via l'optimiseur Next (`/_next/image?…&w=1200&q=75`, repli sur le fichier d'origine), libérées au démontage.
- **Shader écran** : barillet (`k` 0,07 → 0,18 avec la vitesse), coins arrondis, lignes de balayage (1 toutes les 4 px), grain, vignettage, niveaux de gris + assombrissement des voisins (`uActive` lissé), séparation rouge/bleu dans l'image **uniquement en mouvement**, franges accent (gauche) et `#5AC8FA` (droite) sur les bords de l'écran actif, élargies par la vitesse, inclinaison (`uSkew`) liée à la vitesse. À l'arrêt, l'image est nette.
- **Hero → carrousel** : la mosaïque de particules vise maintenant l'écran actif du carrousel (0,4 → 0,9), puis s'efface (0,92 → 1) pendant que le carrousel apparaît (0,9 → 1). Le relais `--handoff` de la phase 2 est supprimé.
- **Rendu à la demande** (`three/Stage.tsx`) : hero tant que `t < 1` ; carrousel seulement s'il y a eu du scroll ou un mouvement de curseur depuis moins de 1,5 s ; mesuré : 0 appel de dessin par seconde au repos.
- **Vérifié** (Chrome, GPU Apple M2, build de production, 1440 × 900 et 1024 × 768) : passage hero → carrousel, rotation au scroll, aimantation (arrêt entre 2 projets → cran entier), clic sur la liste, lien d'ouverture (URL et focus clavier), bouton « Voir les projets » (arrive pile sur le projet 01), sortie vers la méthode, bascule version légère ↔ complète, reduced motion (cartes 2D), 60 images/s en défilement, 0 erreur console.

## Phase 4 — ce qui est fait

- **L'URL est la source de vérité** (`room/RoomController.tsx`, dans le layout) : `/projects/[slug]` + `quality === 'full'` = salle ouverte sur ce projet.
  - Depuis le carrousel : `openRoom(index)` = `history.pushState` (pas de navigation, la page d'accueil reste montée) ; clic sur l'écran actif ou sur la ligne du projet actif.
  - Chargement direct : la page projet classique est rendue par le serveur (SEO, version légère), puis la salle s'ouvre par-dessus sans animation d'entrée (`room.t = 1`).
  - Fermeture (Échap, `> FERMER <` dans l'en-tête, retour arrière) : `history.back()` si on venait du carrousel, sinon `router.push('/')` ; dans les deux cas le carrousel est recalé sur le projet quitté (`history.scrollRestoration = 'manual'` pendant la salle, sinon le navigateur écrase la position).
  - `← →` (ou les liens du panneau) : `history.replaceState` vers le projet voisin, calculé depuis l'URL (appuis rapides sûrs).
  - Pendant la salle : scroll bloqué (`lockScroll(true, 'room')`, les verrous ont maintenant une clé par demandeur), `main` et `footer` inertes, focus sur FERMER, titre de l'onglet = nom du projet ; à la sortie, focus rendu au lien de l'écran.
- **`three/roomState.ts`** : `room.t` avance linéairement vers `room.target` (1,1 s, `roomEase()` cubique) : inverser la cible inverse le mouvement, la transition est interruptible à tout moment. `roomFlash()` = flash de grain autour de t = 0,5 (et à chaque changement de projet, `room.swap`).
- **`three/ControlRoom.tsx`** : `CameraRig` (une seule caméra : fixe FOV 30 pour le carrousel ; avancée vers l'écran actif ; puis salle en FOV 40, glissement exponentiel vers la vue choisie, parallax curseur à ressort) et `ControlRoom` (sol et mur quadrillés opaques, 3 écrans muraux avec le shader écran en noir et blanc, cadres filaires, 3 pupitres filaires, voyants accent). Sans lumière : matériaux non éclairés.
- **Écrans** (`lib/data/roomScreens.ts`) : centre = couverture, gauche = 1re capture large, droite = capture mobile (format portrait) ou 2e capture large. Un écran sans capture reste éteint (voyant gris, pas de miniature). L'écran visé par une miniature retrouve sa couleur et ses franges.
- **`room/RoomPanel.tsx`** : PROJET (Geist Pixel) · INFO (phrase-histoire + liens) · RÔLE + stack · miniatures (`aria-pressed`, re-clic = vue d'ensemble) · voisins `← 02 … / 04 … →`.
- **`three/Stage.tsx`** : fait avancer `room.t`, passe le canvas devant le HTML (`z-index: 80`, sous l'en-tête) avec un fond qui s'opacifie, pilote le flash, et étend le rendu à la demande à la salle (0 dessin par seconde au repos, mesuré). `SceneRoot` monte aussi la scène sur `/projects/*`.
- **`three/screenMaterial.ts`** : shader écran partagé carrousel / salle (`uMono`, `uFringe` ajoutés).
- **Vérifié** (Chrome, GPU Apple M2, build de production) : entrée au clic (URL, focus, titre), miniatures, ← → (y compris appuis rapides), Échap, interruption à mi-course, retour arrière du navigateur, FERMER, sortie sur le bon projet du carrousel, chargement direct puis fermeture vers le carrousel, menu par-dessus la salle (Échap ne ferme que le menu), reduced motion (page classique, pas de salle), 0 erreur console.

## Phase 5 — ce qui est fait

- **`lib/quality.ts`** : toutes les règles version complète / légère.
  - Raisons dures (non contournables) : page sans scène (`route`), écran < 1024 px (`small`), `prefers-reduced-motion` (`motion`), pas de WebGL (`webgl`).
  - Raisons souples : GPU faible (`gpu`, detect-gpu tier < 2 ou GPU sur liste noire), < 30 images/s pendant 2 s de rendu continu (`fps`), scène en erreur ou contexte WebGL perdu (`error`). Verdict mémorisé pour la session (`sessionStorage portfolio:perf`).
  - Choix du visiteur (`localStorage portfolio:lite`) : `1` = forcée, `0` = désactivée (ignore les raisons souples et efface le verdict), absent = auto.
- **detect-gpu** chargé à la demande, seulement quand la 3D est envisageable ; données de référence **auto-hébergées** dans `public/detect-gpu/` (aucune requête vers unpkg). À recopier si la version de detect-gpu change (voir README). Délai max 2,5 s ; en cas de doute, la surveillance des images/s prend le relais.
- **Store** : `liteForced` remplacé par `liteMode` (`auto` / `on` / `off`), `liteReason`, `perf`.
- **`three/Stage.tsx`** : surveillance des images/s (ignorée pendant 1,5 s au démarrage, fenêtres de 2 s, frames consécutives seulement, mode auto uniquement) ; perte de contexte WebGL → `error` (sauf celle que R3F provoque lui-même au démontage).
- **Pied de page** (`LiteToggle`) : état réel + raison (« Version légère : ON · GPU limité »). Bouton si la raison est souple ou manuelle, simple texte si elle est dure.
- **Mobile < 768 px** : les cartes deviennent un carrousel horizontal à aimantation (scroll-snap, 86 % de largeur), la carte la plus visible devient active dans la liste, compteur « 02 / 07 » + « Glisser ← → » en dessous. Correction d'un débordement de page (colonne de grille sans `min-w-0`). La salle reste la page projet classique sur mobile (pas de 3D).
- **Lecteurs d'écran** : signes décoratifs masqués (`ui/Glyph.tsx` : `G`, `Ext`, `SrOnly`) ; liens externes annoncés « (nouvel onglet) » ; « > FERMER < » étiquetés (« Fermer le menu », « Fermer le projet et revenir aux projets », « Fermer : retour aux projets ») ; annonce `role="status"` à l'ouverture de la salle et à chaque ← → ; les 4 étapes de la méthode sont lues sur desktop (liste `md:sr-only`, bloc fixé `aria-hidden`).
- **Contrastes** (WCAG, calculés) : `--fg-3` passe de `#7C7C77` à `#848480` (4,7:1 sur la surface, 5,2:1 sur le fond ; avant 4,2:1 sur la surface) ; `--line-strong` à 42 % (bordure des champs 3,6:1, ≥ 3:1 requis) ; panneau de la salle à 95 % d'opacité. `fg` 16,6:1, `fg-2` 6,9:1, accent 16,9:1, erreur 8,5:1.
- **Reduced motion** : effet magnétique coupé (en plus de Lenis, curseur, démarrage, 3D, cascades déjà coupés).
- **Salle** : la caméra cadre la salle dans l'espace entre l'en-tête et le panneau (`setViewOffset` + recul selon la hauteur utile) : plus d'écran caché derrière le panneau sur une fenêtre basse. Sortie de la salle vers une ancre (PARLONS-EN, menu) : la page va bien à l'ancre ; sortie par Échap / FERMER : recalage sur le projet quitté. Espaces des liens « ← 01 … » rétablis.
- **Vérifié** (Chrome, build de production) : détection auto (requête `/detect-gpu/d-apple.json` servie par le site), GPU faible simulé → version légère avec raison, bascule manuelle dans les deux sens, perte de contexte simulée → version légère « erreur 3D », reduced motion, 900 px, 375 px sans débordement (accueil, 2 pages projet, 404), carrousel mobile au doigt, parcours Tab complet avec focus visible, salle (ouverture, ← →, Échap, retour arrière, FERMER, chargement direct, ancres), méthode lue en entier, régressions des phases 1 à 4, 0 erreur console.

## Notes pour la phase 6 (Sonnet 5.5)

- Les skills `emil-design-eng`, `animation-vocabulary`, `/impeccable` ne sont pas installés : travail à faire à la main, ou les installer avant.
- Textes à relire : phrases-histoires (`lib/data/projects.ts`), méthode (`lib/data/method.ts`), à propos (`sections/About.tsx`), hero.
- Points de polish repérés : moiré possible des lignes de balayage sur les captures très claires (Animarah) ; « Glisser ← → » sur mobile ; la page projet classique apparaît un court instant avant la salle au chargement direct.
- Sons 8-bit (optionnels) : non faits ; « SON : OFF » est affiché sur l'écran de démarrage.

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
- Passage cartes → section fixée : la hauteur de la page change quand `quality` devient `full` (sous l'écran de démarrage à la première visite, sous le hero ensuite : pas de saut visible constaté).
- Lighthouse ≥ 90 sur mobile vaut pour la version légère. En version complète, l'objectif est 60 fps sur un portable récent.
