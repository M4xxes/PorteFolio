# Portfolio — Maxime Pero

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion et Lenis.

## Identité

- Palette : crème `#f1ece2`, encre `#151311`, orange brûlé `#e0602a` (texte orange sur crème : `#b54a17`), surfaces sombres `#1b1916`. Tokens dans `src/app/globals.css`.
- Typographies (SIL OFL, auto-hébergées par `next/font`) : Bricolage Grotesque (titres), Geist (texte), Geist Mono (détails).
- Interactions signature : introduction « Entrer » (`src/components/intro`), champ génératif du Hero (`InkField`, canvas 2D), index de projets avec aperçu qui suit le curseur (`ProjectIndex`). Transitions de page : React `<ViewTransition>` (`globals.css`, section « Transitions de page »).

## Introduction

Affichée à la première visite de `/` (une fois par session, `sessionStorage`). Un script en ligne pose `data-intro="on"` sur `<html>` avant le premier rendu ; sans JavaScript, l'introduction reste masquée. Elle peut être rejouée depuis le pied de page.

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
| `/` | Hero, projets sélectionnés, savoir-faire, aperçu « À propos » |
| `/projects` | Tous les projets (filtres) + autres dépôts GitHub chargés automatiquement |
| `/projects/[slug]` | Fiche projet : contexte, contribution, fonctionnalités, stack, liens |
| `/about` | Parcours, compétences, façon de travailler, CV (aperçu, consultation, téléchargement) |
| `/contact` | E-mail, profils, formulaire (uniquement si l'envoi est configuré) |

## Variables d'environnement (toutes facultatives)

| Variable | Rôle |
| --- | --- |
| `RESEND_API_KEY` | Active le formulaire de contact (sinon la page propose l'e-mail direct). |
| `CONTACT_FROM_EMAIL` | Expéditeur vérifié chez Resend, ex. `Portfolio <contact@mon-domaine.fr>`. |
| `GITHUB_TOKEN` | Augmente la limite de l'API GitHub. Lu côté serveur uniquement. |
| `NEXT_PUBLIC_SITE_URL` | URL publique (canonical, Open Graph, sitemap). Sur Netlify, `URL` est utilisée par défaut. |

## Ajouter un projet

1. Ajouter une entrée dans `src/lib/data/projects.ts` (le champ `repo` relie le projet à son dépôt GitHub).
2. Déposer l'image dans `public/projects/` (WebP, 1600 × 1000) et préciser `kind: 'screenshot'` (capture réelle) ou `'illustration'` (visuel de présentation, signalé comme tel sur le site).

Les dépôts publics non présentés en détail apparaissent automatiquement sur `/projects` (données GitHub régénérées toutes les 24 h).
