import type { GithubRepo } from '@/types'
import { site } from '@/lib/constants'
import { projects } from '@/lib/data/projects'

const REVALIDATE_SECONDS = 60 * 60 * 24

// Dépôts publics à ne pas lister automatiquement (le portfolio lui-même).
const EXCLUDED = new Set(['PorteFolio'])

interface ApiRepo {
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  pushed_at: string
  fork: boolean
  archived: boolean
  private: boolean
  size: number
}

/**
 * Dépôts publics de l'utilisateur, récupérés côté serveur et mis en cache 24 h (ISR).
 * GITHUB_TOKEN est facultatif : il n'augmente que la limite de requêtes et ne quitte jamais le serveur.
 * En cas d'erreur réseau ou de quota, renvoie une liste vide : les pages restent fonctionnelles.
 */
export async function getPublicRepos(): Promise<GithubRepo[]> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    const res = await fetch(
      `https://api.github.com/users/${site.githubUser}/repos?per_page=100&sort=pushed&type=owner`,
      { headers, next: { revalidate: REVALIDATE_SECONDS } }
    )
    if (!res.ok) return []
    const data = (await res.json()) as ApiRepo[]
    return data
      .filter((r) => !r.fork && !r.private && !r.archived && r.size > 0 && !EXCLUDED.has(r.name))
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        homepage: r.homepage || null,
        language: r.language,
        stars: r.stargazers_count,
        pushedAt: r.pushed_at,
      }))
  } catch {
    return []
  }
}

/** Dépôts publics qui ne sont pas déjà présentés comme projets détaillés. */
export async function getOtherRepos() {
  const featured = new Set(projects.map((p) => p.repo).filter(Boolean))
  const repos = await getPublicRepos()
  return repos.filter((r) => !featured.has(r.name))
}

/** Dépôt le plus récemment mis à jour (affiché dans le Hero). */
export async function getLatestActivity() {
  const repos = await getPublicRepos()
  return repos[0] ?? null
}
