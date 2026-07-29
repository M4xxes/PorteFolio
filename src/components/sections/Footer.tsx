import Link from 'next/link'
import { Mail, ArrowUpRight, Download } from 'lucide-react'
import { site } from '@/lib/constants'
import { GithubMark, LinkedinMark } from '@/components/ui/BrandIcons'

const socials = [
  { label: 'GitHub', href: site.github, icon: GithubMark },
  { label: 'LinkedIn', href: site.linkedin, icon: LinkedinMark },
  { label: 'Email', href: `mailto:${site.email}`, icon: Mail },
]

export function Footer() {
  return (
    <footer className="relative z-20 overflow-hidden border-t border-border-soft bg-bg pt-16">
      <div className="overflow-hidden py-6">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] items-center gap-10 whitespace-nowrap">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="font-serif text-[12vw] leading-none text-fg/90 sm:text-[7vw]"
            >
              {site.name}
              <span className="mx-8 inline-block align-middle text-accent">•</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-20">
        <div className="flex flex-col gap-2">
          <p className="font-sans text-sm text-fg-muted">
            Disponible pour des opportunités en alternance et projets freelance.
          </p>
          <a
            href={site.cvUrl}
            download
            data-cursor-hover
            className="inline-flex w-fit items-center gap-1.5 font-sans text-sm text-fg underline underline-offset-4 transition-colors hover:text-accent"
          >
            Télécharger mon CV <Download size={14} />
          </a>
        </div>

        <div className="flex items-center gap-5">
          {socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              aria-label={s.label}
              data-cursor-hover
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border-soft text-fg-muted transition-colors hover:border-accent/50 hover:text-fg"
            >
              <s.icon size={16} />
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-border-soft px-6 py-6 font-sans text-xs text-fg-muted sm:px-10 lg:px-20">
        <span>© {new Date().getFullYear()} {site.name}</span>
        <Link href="#" data-cursor-hover className="inline-flex items-center gap-1 hover:text-fg">
          Haut de page <ArrowUpRight size={12} />
        </Link>
      </div>
    </footer>
  )
}
