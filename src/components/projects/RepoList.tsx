import { ArrowUpRight, Star } from 'lucide-react'
import type { GithubRepo } from '@/types'
import { site } from '@/lib/constants'
import { formatMonth } from '@/lib/format'
import { repoDescriptions } from '@/lib/data/projects'

/**
 * Autres dépôts publics, chargés côté serveur depuis l'API GitHub.
 * En cas d'indisponibilité de l'API, un message explicite remplace la liste (pas d'échec silencieux).
 */
export function RepoList({ repos }: { repos: GithubRepo[] }) {
  if (repos.length === 0) {
    return (
      <div className="border border-dashed border-dark-line p-8 text-dark-muted">
        La liste des dépôts GitHub n’a pas pu être chargée pour le moment.{' '}
        <a href={site.github} target="_blank" rel="noopener noreferrer" className="text-cream underline decoration-orange underline-offset-4">
          Voir directement mon profil GitHub
        </a>
        .
      </div>
    )
  }

  return (
    <ul className="border-t border-dark-line">
      {repos.map((repo, i) => (
        <li key={repo.name} className="border-b border-dark-line">
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-2 py-6 sm:grid-cols-[3rem_minmax(0,16rem)_1fr_auto_auto]"
          >
            <span className="font-mono text-xs text-dark-muted">{String(i + 1).padStart(2, '0')}</span>
            <span className="display text-2xl transition-colors group-hover:text-orange sm:text-3xl">{repo.name}</span>
            <ArrowUpRight
              size={18}
              aria-hidden
              className="col-start-3 row-start-1 text-dark-muted transition-[color,rotate] group-hover:rotate-45 group-hover:text-orange sm:col-start-5"
            />
            <span className="col-span-2 col-start-2 text-sm text-dark-muted sm:col-span-1 sm:col-start-3 sm:row-start-1">
              {repo.description ?? repoDescriptions[repo.name] ?? `Dépôt ${repo.language ?? 'public'} sur GitHub.`}
            </span>
            <span className="label col-span-2 col-start-2 flex items-center gap-3 text-[10px] text-dark-muted sm:col-span-1 sm:col-start-4 sm:row-start-1">
              {repo.language && <span>{repo.language}</span>}
              {repo.stars > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star size={10} aria-hidden /> {repo.stars}
                </span>
              )}
              <span>{formatMonth(repo.pushedAt)}</span>
            </span>
            <span className="sr-only">(ouvre GitHub dans un nouvel onglet)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
