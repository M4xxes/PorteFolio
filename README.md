# Portfolio — Maxime Pero

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Lenis, three / React Three Fiber (3D).

## Identité

Arcade futuriste, épurée, sombre par défaut. Suivi de la refonte : `PROGRESS.md`.

- Couleurs : fond `#0C0C0E`, surface `#18181B`, texte `#EDEDE8`, secondaire `#9A9A94`, accent unique `--accent: #D4FF3A` (à changer en une ligne dans `src/app/globals.css`).
- Typographies (SIL OFL, auto-hébergées par `next/font`) : Geist Pixel Square (titres, paquet `geist`), Departure Mono (interface et lecture, `src/app/fonts`), Doto (chiffres).
- Une seule boucle d'animation (`src/lib/loop.ts`) : Lenis puis le curseur (et la scène 3D à partir de la phase 2). Le défilement et le pointeur sont publiés dans un store `zustand` (`src/lib/store.ts`), lu sans re-render.
- Écran de démarrage : accueil uniquement, une fois par session, écran ≥ 768 px à pointeur fin, hors reduced motion et hors version légère. Décidé par un script en ligne avant le premier rendu ; sans JavaScript, il ne s'affiche jamais.

## Version complète (3D) ou légère

Règles dans `src/lib/quality.ts`. La 3D n'est montée que sur `/` et `/projects/[slug]`, écran ≥ 1024 px, WebGL disponible, hors `prefers-reduced-motion`. Elle se coupe d'elle-même si le GPU est trop faible (detect-gpu), si les images/s restent sous 30, ou en cas d'erreur. Bascule manuelle « Version légère » dans le pied de page.

Les données de référence de detect-gpu sont servies par le site (`public/detect-gpu/`). Après une mise à jour du paquet :

```bash
cp node_modules/detect-gpu/dist/benchmarks/*.json public/detect-gpu/
```

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm run build && npm start
```

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Hero, sélection de projets, méthode, compétences, à propos, contact |
| `/projects/[slug]` | Fiche projet : phrase-histoire, rôle, stack, liens, captures |
| `/projects`, `/about`, `/contact` | Redirections temporaires vers `/#work`, `/#about`, `/#contact` |

## Variables d'environnement (toutes facultatives)

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Active le formulaire de contact (sinon la page propose l'e-mail direct). |
| `CONTACT_FROM_EMAIL` | Expéditeur vérifié chez Resend, ex. `Portfolio <contact@mon-domaine.fr>`. |
| `GITHUB_TOKEN` | Augmente la limite de l'API GitHub. Lu côté serveur uniquement. |
| `NEXT_PUBLIC_SITE_URL` | URL publique (canonical, Open Graph, sitemap). Sur Netlify, `URL` est utilisée par défaut. |

## Ajouter un projet

1. Ajouter une entrée dans `src/lib/data/projects.ts` (le champ `repo` relie le projet à son dépôt GitHub).
2. Renseigner `short`, `tag`, `roleLine` et `story` (phrase-histoire à la première personne).
3. Déposer l'image dans `public/projects/` (WebP, 1600 × 1000) et préciser `kind: 'screenshot'` (capture réelle) ou `'illustration'` (visuel de présentation, signalé comme tel sur le site).
