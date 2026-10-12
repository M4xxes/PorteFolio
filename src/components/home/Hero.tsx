import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import type { GithubRepo } from '@/types'
import { site } from '@/lib/constants'
import { featuredProjects } from '@/lib/data/projects'
import { formatMonth } from '@/lib/format'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container, Label } from '@/components/ui/Section'
import { InkField } from './InkField'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

/** Tracé de route sous « route » : clin d'œil à la moto, dessiné à l'entrée. */
function RoadMark() {
  return (
    <svg aria-hidden viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-0 h-[0.14em] w-full overflow-visible">
      <path d="M2 14 C 80 4, 160 22, 298 8" fill="none" stroke="var(--orange)" strokeWidth="7" strokeLinecap="round" pathLength={1} className="road-draw" />
    </svg>
  )
}

export function Hero({ latest }: { latest: GithubRepo | null }) {
  const picks = featuredProjects.slice(0, 3)

  return (
    <section aria-labelledby="hero-title" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-[var(--header-h)]">
      <InkField className="absolute inset-0" />

      <Container className="relative flex flex-1 flex-col pb-8">
        <div className="animate-rise mt-4 grid grid-cols-2 gap-4 border-b border-line pb-4 text-muted sm:grid-cols-3">
          <Label index="00">Portfolio 2026</Label>
          <p className="label hidden text-center sm:block">
            {site.name} · {site.location}
          </p>
          <p className="label flex items-center justify-end gap-2 text-right">
            <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-orange" />
            Disponible
          </p>
        </div>

        <h1 id="hero-title" className="display mt-10 text-[clamp(2.9rem,12.6vw,4.75rem)] sm:mt-12 sm:text-[clamp(3rem,8.7vw,9.25rem)]">
          <span className="sr-only">
            {site.name}, développeur full-stack —{' '}
          </span>
          <span className="line-mask">
            <span style={delay(100)}>Des interfaces</span>
          </span>
          <span className="line-mask">
            <span className="lg:pl-[22%]" style={delay(180)}>
              soignées<span className="text-orange">,</span>
            </span>
          </span>
          <span className="line-mask">
            <span style={delay(260)}>un code qui</span>
          </span>
          <span className="line-mask">
            <span className="lg:pl-[9%]" style={delay(340)}>
              tient la <span className="relative inline-block">route<RoadMark /></span>.
            </span>
          </span>
        </h1>

        <div className="mt-auto grid gap-10 pt-14 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="animate-rise lg:col-span-4" style={delay(520)}>
            <p className="max-w-md text-base leading-relaxed text-pretty sm:text-lg">
              Je suis <span className="font-medium">{site.name}</span>, développeur full-stack en formation à
              Ynov Lyon. Je conçois des sites et des applications web en React,
              TypeScript et Node.js.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/projects" icon={<ArrowUpRight size={16} />}>
                Découvrir mes projets
              </ButtonLink>
              <ButtonLink href="/contact" variant="text">
                Me contacter
              </ButtonLink>
            </div>
          </div>

          <div className="animate-rise lg:col-span-7 lg:col-start-6" style={delay(640)}>
            <div className="flex items-baseline justify-between border-b border-line pb-3">
              <p className="label text-muted">Sélection</p>
              {latest && (
                <a href={latest.url} target="_blank" rel="noopener noreferrer" className="label link-draw hidden text-muted hover:text-ink sm:block">
                  Dernier commit : {latest.name} · {formatMonth(latest.pushedAt)}
                </a>
              )}
            </div>
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:gap-4">
              {picks.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="group block">
                    <span className="relative block aspect-[4/3] overflow-hidden bg-paper">
                      <Image
                        src={p.cover.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 14rem, 30vw"
                        className="object-cover object-left-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                      />
                      <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-orange/85 mix-blend-multiply transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100" />
                    </span>
                    <span className="mt-2 flex items-baseline gap-2 text-xs sm:text-sm">
                      <span className="font-mono text-[10px] text-orange-ink">0{i + 1}</span>
                      <span className="truncate transition-colors group-hover:text-orange-ink">{p.title}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href="#presentation"
          className="animate-rise label mt-10 inline-flex min-h-11 items-center gap-3 self-start text-muted transition-colors hover:text-ink"
          style={delay(760)}
        >
          <ArrowDown size={14} aria-hidden className="animate-bounce" /> Défiler pour explorer
        </a>
      </Container>
    </section>
  )
}
