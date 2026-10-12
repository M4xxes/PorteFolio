import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'
import { getProject, projects } from '@/lib/data/projects'
import { otherLanguages, skillCategories } from '@/lib/data/skills'
import { site } from '@/lib/constants'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { MaskReveal } from '@/components/ui/MaskReveal'
import { Reveal } from '@/components/ui/Reveal'
import { Container, Label, SectionHeading, StackLine } from '@/components/ui/Section'
import { ProjectIndex } from './ProjectIndex'
import { ScrollWords } from './ScrollWords'

/* ---------- 01 · Présentation ---------- */

export function Presentation() {
  return (
    <section id="presentation" aria-label="Présentation" className="py-24 sm:py-36">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <Label index="01" className="text-muted lg:col-span-3 lg:pt-3">
          Présentation
        </Label>
        <div className="lg:col-span-9">
          <ScrollWords
            className="font-display text-[clamp(1.75rem,3.7vw,3.5rem)] font-medium leading-[1.08] tracking-[-0.02em] [font-stretch:90%]"
            text="Étudiant en Bachelor Informatique à Ynov Campus Lyon, je développe des sites et des applications web — du site vitrine d’une praticienne à l’écran de supervision industrielle. J’aime soigner une interface au pixel près autant que résoudre un problème côté serveur."
          />
          <Reveal className="mt-14 grid gap-6 border-t border-line pt-6 sm:grid-cols-3">
            {[
              ['Formation', 'Bachelor Informatique — Ynov Lyon'],
              ['Spécialité', 'Développement web full-stack'],
              ['Base', site.location],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="label text-muted">{k}</p>
                <p className="mt-2 text-base">{v}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

/* ---------- 02 · Sélection éditoriale ---------- */

function portraitOf(project: Project) {
  return project.gallery?.find((img) => img.height > img.width)
}

function SelectedPiece({
  project,
  index,
  className,
  imageClass,
  portrait,
}: {
  project: Project
  index: number
  className: string
  imageClass: string
  portrait?: boolean
}) {
  const image = (portrait && portraitOf(project)) || project.cover
  return (
    <article className={`group ${className}`}>
      <Link href={`/projects/${project.id}`} className="block">
        <MaskReveal className={`relative bg-paper ${imageClass}`}>
          <div className="relative h-full w-full transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-top"
            />
          </div>
          {image.kind === 'illustration' && (
            <span className="label absolute left-3 top-3 bg-cream px-2 py-1 text-[9px]">Illustration</span>
          )}
        </MaskReveal>
        <div className="mt-5 flex items-start justify-between gap-6">
          <div>
            <p className="label text-muted">
              <span className="text-orange-ink">{String(index).padStart(2, '0')}</span> · {project.tagline}
            </p>
            <h3 className="display mt-3 text-[clamp(2rem,3.4vw,3.25rem)] transition-colors group-hover:text-orange-ink">
              {project.title}
            </h3>
          </div>
          <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-ink transition-[background-color,border-color,rotate] duration-500 group-hover:rotate-45 group-hover:border-orange group-hover:bg-orange">
            <ArrowUpRight size={18} aria-hidden />
          </span>
        </div>
        <StackLine items={project.stack.slice(0, 5)} className="mt-4 text-muted" />
      </Link>
    </article>
  )
}

export function SelectedWork() {
  const [a, b, c] = [getProject('mixer-hmi'), getProject('animarah'), getProject('evastre')].filter(Boolean) as Project[]
  return (
    <section aria-labelledby="selected-title" className="pb-24 sm:pb-36">
      <Container>
        <SectionHeading
          index="02"
          label="Sélection"
          id="selected-title"
          title={
            <>
              Trois projets, <span className="text-orange-ink">trois terrains.</span>
            </>
          }
          lead="Un écran de supervision industrielle, un site vitrine en ligne et le portfolio d’une photographe. Chaque fiche détaille le contexte, ma contribution et la stack."
        />
        <div className="grid gap-y-20 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-28">
          <SelectedPiece project={a} index={1} className="lg:col-span-8" imageClass="aspect-[16/10]" />
          <SelectedPiece project={b} index={2} portrait className="lg:col-span-4 lg:mt-[45%]" imageClass="aspect-[4/5]" />
          <SelectedPiece project={c} index={3} className="lg:col-span-7 lg:col-start-3" imageClass="aspect-[16/10]" />
        </div>
      </Container>
    </section>
  )
}

/* ---------- 03 · Index de tous les projets (sombre) ---------- */

export function IndexSection() {
  return (
    <section aria-labelledby="index-title" className="bg-dark py-24 text-cream sm:py-36">
      <Container>
        <SectionHeading
          index="03"
          label="Index"
          id="index-title"
          tone="dark"
          title={
            <>
              Tous les projets<span className="text-orange">.</span>
            </>
          }
          lead={`${projects.length} projets détaillés : web, back-end, desktop et mobile. Survolez une ligne pour voir le projet.`}
          action={
            <ButtonLink href="/projects" variant="outline-light" icon={<ArrowUpRight size={16} />}>
              Galerie complète
            </ButtonLink>
          }
        />
        <ProjectIndex projects={projects} />
      </Container>
    </section>
  )
}

/* ---------- 04 · Outils ---------- */

export function StackSection() {
  return (
    <section aria-labelledby="stack-title" className="bg-paper py-24 sm:py-36">
      <Container>
        <SectionHeading
          index="04"
          label="Outils"
          id="stack-title"
          title="Du front au back, avec la même exigence."
          action={
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/about" icon={<ArrowUpRight size={16} />}>
                Mon parcours
              </ButtonLink>
              <ButtonLink href={site.cvUrl} external variant="outline">
                Voir le CV
              </ButtonLink>
            </div>
          }
        />
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 0.05} className="border-t-2 border-ink pt-5">
              <p className="label flex justify-between text-muted">
                {cat.label}
                <span className="text-orange-ink">{String(cat.skills.length).padStart(2, '0')}</span>
              </p>
              <ul className="mt-5 flex flex-col gap-1.5">
                {cat.skills.map((s) => (
                  <li key={s} className="text-lg leading-snug">
                    {s}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
        <p className="label mt-14 text-muted">
          Aussi pratiqué en formation : {otherLanguages.join(' · ')}
        </p>
      </Container>
    </section>
  )
}

