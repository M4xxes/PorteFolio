import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-10 ${className}`}>{children}</div>
}

/** Petite étiquette monospace, éventuellement numérotée : « 02 — Parcours ». */
export function Label({ index, children, className = '' }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`label flex items-center gap-3 ${className}`}>
      {index && <span className="text-orange-ink">{index}</span>}
      {index && <span aria-hidden className="h-px w-6 bg-current opacity-40" />}
      <span>{children}</span>
    </p>
  )
}

/**
 * En-tête de section éditorial : étiquette numérotée dans une colonne étroite,
 * titre fort dans la colonne large. La grille change d'une section à l'autre via `align`.
 */
export function SectionHeading({
  index,
  label,
  title,
  lead,
  action,
  id,
  tone = 'light',
}: {
  index: string
  label: string
  title: ReactNode
  lead?: ReactNode
  action?: ReactNode
  id?: string
  tone?: 'light' | 'dark'
}) {
  const muted = tone === 'dark' ? 'text-dark-muted' : 'text-muted'
  return (
    <Reveal className="mb-14 grid gap-6 sm:mb-20 lg:grid-cols-12 lg:gap-8">
      <Label index={index} className={`lg:col-span-3 lg:pt-3 ${muted}`}>
        {label}
      </Label>
      <div className="lg:col-span-9">
        <h2 id={id} className="display text-[clamp(2.75rem,6.4vw,6rem)] text-balance">
          {title}
        </h2>
        {(lead || action) && (
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {lead && <p className={`max-w-xl text-base leading-relaxed text-pretty sm:text-lg ${muted}`}>{lead}</p>}
            {action && <div className="shrink-0">{action}</div>}
          </div>
        )}
      </div>
    </Reveal>
  )
}

/** Technologies affichées comme une ligne typographique « React / TypeScript / Vite ». */
export function StackLine({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs ${className}`} aria-label="Technologies">
      {items.map((item, i) => (
        <li key={item} className="flex gap-2">
          {item}
          {i < items.length - 1 && <span aria-hidden className="opacity-40">/</span>}
        </li>
      ))}
    </ul>
  )
}
