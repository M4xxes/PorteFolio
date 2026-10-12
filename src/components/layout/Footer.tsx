import Link from 'next/link'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import { navLinks, site } from '@/lib/constants'
import { Container } from '@/components/ui/Section'
import { FooterCta } from './FooterCta'
import { Wordmark } from './Logo'
import { ReplayIntro } from './ReplayIntro'

const external = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
]

export function Footer() {
  return (
    <footer>
      <FooterCta />

      <div className="bg-dark text-cream">
        <Container className="grid gap-12 pt-20 pb-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label text-dark-muted">Portfolio — 2026</p>
            <p className="mt-6 max-w-sm text-lg leading-snug">
              {site.name}, développeur full-stack à {site.location.split(',')[0]}. {site.availability}.
            </p>
          </div>

          <nav aria-label="Plan du site" className="lg:col-span-2 lg:col-start-7">
            <p className="label text-dark-muted">Pages</p>
            <ul className="mt-5 flex flex-col gap-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-9 items-center gap-2 transition-colors hover:text-orange">
                    <span className="font-mono text-[10px] text-dark-muted">{link.index}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <p className="label text-dark-muted">Ailleurs</p>
            <ul className="mt-5 flex flex-col gap-2">
              {external.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 transition-colors hover:text-orange">
                    {l.label} <ArrowUpRight size={13} aria-hidden />
                  </a>
                </li>
              ))}
              <li>
                <a href={`mailto:${site.email}`} className="inline-flex min-h-9 items-center transition-colors hover:text-orange">
                  E-mail
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label text-dark-muted">Ressources</p>
            <ul className="mt-5 flex flex-col gap-2">
              <li>
                <a href={site.cvUrl} download className="inline-flex min-h-9 items-center transition-colors hover:text-orange">
                  CV (PDF)
                </a>
              </li>
              <li className="text-sm">
                <ReplayIntro />
              </li>
            </ul>
          </div>
        </Container>

        <Container className="overflow-hidden">
          <Wordmark className="block w-full pb-2 text-[clamp(3.5rem,21.5vw,26rem)] leading-[0.82] text-cream" />
        </Container>

        <Container>
          <div className="flex items-center justify-between gap-4 border-t border-dark-line py-5 font-mono text-[11px] text-dark-muted">
            <span>
              © {new Date().getFullYear()} {site.name}
            </span>
            <a href="#top" className="inline-flex min-h-11 items-center gap-1.5 transition-colors hover:text-cream">
              Haut de page <ArrowUp size={12} aria-hidden />
            </a>
          </div>
        </Container>
      </div>
    </footer>
  )
}
