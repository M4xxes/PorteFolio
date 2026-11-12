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
| 5 — Secours, mobile, a11y | Opus 5.5 | Terminée (commit `phase-5`) |
| 6 — Polish | Sonnet 5.5 | Terminée (commit `phase-6`) |
| 7 — Vérification | Sonnet 5.5 | **Terminée** (commit `phase-7`) |

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
  - Raisons souples : GPU faible (`gpu`, detect-gpu tier < 2 ou GPU sur liste noire), < 30 images/s pendant 4 s de rendu continu (`fps`), scène en erreur ou contexte WebGL perdu (`error`). Verdict mémorisé pour la session (`sessionStorage portfolio:perf`).
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

## Phase 6 — ce qui est fait

Les skills `emil-design-eng`, `animation-vocabulary`, `/impeccable` ne sont pas installées : audit fait à la main sur le code.

- **Audit des animations HTML** : toutes ≤ 280 ms (sauf transitions de caméra 3D), courbe `--ease-out` partout, `:active` à `scale(0.97)` sur les boutons (`.press`), survols limités aux pointeurs fins (variant `hover:` de Tailwind 4 + règles `@media (hover: hover)`). Corrigé : pixel de l'easter egg 300 → 240 ms ; survol des cartes 2D qui animait `filter` → calque `mix-blend-saturation` dont seule l'opacité change. Exception assumée : le curseur personnalisé anime `width/height` (élément fixe de 10–32 px, pas de reflow de page).
- **Typographie** : seules les trois familles prévues sont utilisées (Geist Pixel titres, Departure Mono interface et lecture, Doto chiffres), aucune police interdite ; `text-wrap: balance` sur les titres, `pretty` sur les paragraphes ; aucun `border-radius` hors des coins d'écran 3D.
- **Sons 8-bit optionnels** (`lib/sound.ts`, `shell/SoundToggle.tsx`) : « Son : OFF » par défaut dans le pied de page, choix mémorisé (`portfolio:sound`). Synthèse Web Audio (ondes carrées, volume 0,035), **aucun contexte audio créé tant que le son est OFF** (vérifié). Sons : menu (ouvrir/fermer), changement de projet dans le carrousel, entrée/sortie de la salle, easter egg, copie de l'e-mail. L'écran de démarrage affiche l'état réel (avant : « SON : OFF » figé).
- **Accessibilité** : titre « Sélec-tion » nommé « Sélection » (`aria-label`, la coupure est visuelle) ; focus des champs du formulaire renforcé (bordure + trait de 2 px accent).
- **Textes** : « À propos » rendu factuel (retrait d'une préférence non vérifiable, ajout des vrais projets cités et de la mention de ce qui revient à d'autres), étape « Livrer et suivre » rendue concrète (Netlify, documentation dans le dépôt). Les phrases-histoires de la phase 0 sont inchangées.
- **Vérifié** (Chrome, build de production) : son OFF = 0 oscillateur / 0 contexte, activation, persistance, easter egg sonore, nom accessible de la sélection, survol des cartes, régressions (salle, carrousel, ancres, 375 px, reduced motion) sans erreur console.

## Phase 7 — vérification (faite avec `playwright-core` + Chrome système, Lighthouse 12.8 ; Playwright MCP non disponible)

**Parcours navigateur : 41/41** sur le build de production (script de la session, non versionné) :
- Démarrage : compteur 000 → 100 sur de vraies étapes, fermé ≈ 1,5 s, une fois par session, Entrée l'enchaîne.
- Menu : atteignable au clavier, s'ouvre à Entrée, focus piégé (aucun élément de la page atteignable), scroll bloqué puis rétabli, Échap rend le focus au bouton.
- Défilement hero → contact à la molette : bas de page atteint, 100 %, toutes les sections présentes.
- Carrousel : « Voir les projets » arrive pile sur la section fixée, aimantation, clic sur la liste.
- Salle : clic, ← →, Échap, FERMER, retour arrière du navigateur, miniatures, retour sur le bon projet du carrousel.
- URL directe `/projects/[slug]` (200, salle ouverte sans animation, titre d'onglet, Échap → carrousel), URL inconnue (404).
- Sans WebGL (Chrome lancé sans 3D) : pas de canvas, 7 cartes 2D, raison affichée, page projet classique.
- 375 px : aucun débordement (accueil, 3 pages projet), menu au toucher. Reduced motion : ni démarrage, ni curseur, ni 3D, ni Lenis, contenu visible. Sans JavaScript : contenu complet.

**Formulaire : 14/14**, sans envoi réel : build avec une fausse clé `RESEND_API_KEY` (jamais committée), requête du navigateur interceptée (aucun appel à Resend). Validation à vide, saisie au clavier, focus visible, succès + champs vidés, erreur sans perte de saisie ; côté serveur : champ piège (succès silencieux sans envoi), e-mail invalide, champ vide, message trop long, corps invalide. La build normale (sans clé) ne rend pas le formulaire.

**Lighthouse** (accessibilité, bonnes pratiques, SEO : 100 partout) :

| Page | Profil | Performance | LCP simulé | TBT | CLS |
| --- | --- | --- | --- | --- | --- |
| `/` | mobile (version légère) | 96 | 2,8 s | 60 ms | 0 |
| `/projects/evastre` | mobile | 96 | 2,8 s | 10 ms | 0 |
| `/projects/mixer-hmi` | mobile | 96 | 2,8 s | 30 ms | 0 |
| `/projects/animarah` | mobile | 97 | 2,6 s | 10 ms | 0 |
| `/` | bureau (version complète 3D) | 99 | 0,5 s | 100 ms | 0 |
| `/projects/animarah` | bureau (salle 3D) | 99 | 0,6 s | 90 ms | 0 |

Objectif « Lighthouse ≥ 90 mobile » : **atteint**. Objectif « LCP < 2,5 s » : **non atteint en simulation mobile** (2,6–2,8 s, mesure Lighthouse avec 4G lente et CPU ralenti ×4) ; le LCP réellement observé en local est de 0,1–0,15 s. L'élément LCP est un paragraphe de texte : le texte s'affiche avant la 3D, comme demandé.

**Corrections faites pendant la vérification** (avant : perf 89 / 86 / 91, LCP 3,6–4,2 s) :
- `geist/font/pixel` déclarait et préchargeait les 5 variantes de Geist Pixel (130 Ko) → import ciblé `geist/font/pixel/square` : 3 polices préchargées au lieu de 7.
- Images des cartes sous le hero en `fetchPriority="low"`.
- `framer-motion` (42 Ko gzippés pour 3 usages) retiré : ressort des boutons magnétiques réécrit sur la boucle d'animation commune, cascade du menu en CSS, `MotionConfig` supprimé. Paquet désinstallé. Mesuré : décalage ≤ 6 px, retour à 0, cascade rejouée à chaque ouverture.
- Aperçu de la vidéo Evastre (151 Ko) demandé seulement à l'approche de l'écran.

**Non vérifié** : Safari, Firefox, vrai appareil mobile ou lent ; envoi réel d'un e-mail via Resend ; rendu sonore (le code est testé, pas l'écoute) ; Lighthouse en profil mobile *avec* 3D (la 3D est coupée sous 1024 px par conception).

## Après la phase 7

- **CV remplacé** : `public/assets/cv-maxime-pero.pdf` = `~/Downloads/CV_Maxime_Pero.pdf` (identique octet pour octet, 1 page) ; `public/assets/cv-preview.webp` régénéré depuis ce PDF. L'ancien CV reste dans l'historique git (`f6741f0` et avant). Servi en 200 `application/pdf`.
- **Vulnérabilités : `npm audit` = 0** (dev comprises). `next` 16.4.0 → **16.4.6** et `eslint-config-next` 16.4.6 (épinglés, sans `--force`) : corrige 2 failles d'exécution de code à distance et 1 déni de service ; `zod` mis à jour (`npm audit fix`) ; `minimatch` ≥ 11 imposé au seul `@typescript-eslint/typescript-estree` via `overrides` dans `package.json` (typescript-eslint 8.72.2, dernière version, fige minimatch 10 vulnérable). Lint, typecheck, build et les 41 vérifications navigateur passent. Le build ne s'arrête plus sur l'avertissement de sécurité.
- **Surveillance des images/s** : bascule en version légère seulement après **2 fenêtres lentes consécutives** (4 s) au lieu d'une seule. Constaté pendant ces vérifications : sous forte charge machine (charge 14–26, synchronisation iCloud du dossier `Documents` après `npm install` / build), une fenêtre de 2 s suffisait à passer en version légère. Le projet vit dans un dossier synchronisé par iCloud : le déplacer hors d'iCloud évite ce bruit.
- **Incohérences entre le CV fourni et le site** (la recherche a été alignée sur le CV : « CDI & freelance », plus d'alternance) ; le CV indique la 3ᵉ année validée (soutenance à venir), le site « Bachelor depuis 2023 » ; e-mail `maxime.pero@ynov.com` (CV) vs `maximepero12@gmail.com` (site) ; portfolio `maxportefolio.netlify.app` (CV) vs `m4xdev.netlify.app` (brief). Le CV contient l'adresse postale et le téléphone : il est téléchargeable publiquement depuis le site.

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
- **Sécurité** : corrigée après la phase 7 (voir « Après la phase 7 »).
- Choix par défaut appliqués faute de réponse : Evastre sans espace admin (repo `Evasive`), « six malaxeurs » conservé, Map sans année.
- Formulaire de contact masqué tant que `RESEND_API_KEY` n'est pas configurée (l'e-mail direct reste proposé).
- Passage cartes → section fixée : la hauteur de la page change quand `quality` devient `full` (sous l'écran de démarrage à la première visite, sous le hero ensuite : pas de saut visible constaté).
- Lighthouse : voir « Phase 7 ». En version complète, 60 images/s mesurées sur un Apple M2, pas sur un portable plus modeste.
- `lucide-react` n'est plus utilisé nulle part (aucun impact sur le bundle) : peut être désinstallé.
