import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { Magnetic } from '@/components/shell/Magnetic'

/** Conteneur : gouttière commune et grille de 12 colonnes au besoin. */
export function Container({ className, children, as: Tag = 'div' }: { className?: string; children: ReactNode; as?: 'div' | 'section' | 'header' | 'footer' }) {
  return <Tag className={`mx-auto w-full max-w-[1600px] px-[var(--gutter)] ${className ?? ''}`}>{children}</Tag>
}

/** Étiquette indexée : « [02] MÉTHODE ». */
export function Tag({ index, children, className }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`ui text-fg-2 ${className ?? ''}`}>
      {index && <span aria-hidden>[{index}] </span>}
      {children}
    </p>
  )
}

/** Titre de section en Geist Pixel. */
export function Title({ children, className, as: H = 'h2' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' | 'h3' }) {
  return <H className={`pixel text-[clamp(2.5rem,7vw,6.5rem)] ${className ?? ''}`}>{children}</H>
}

/** En-tête de section : filet, étiquette, titre. */
export function SectionHead({ index, label, title, aside }: { index: string; label: string; title: ReactNode; aside?: ReactNode }) {
  return (
    <div className="border-t border-line pt-3">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <Tag index={index}>{label}</Tag>
        {aside}
      </div>
      <Title className="mt-8 sm:mt-12">{title}</Title>
    </div>
  )
}

type ButtonProps = { href: string; children: ReactNode; variant?: 'accent' | 'text' | 'outline'; external?: boolean; magnetic?: boolean } & Omit<
  ComponentProps<'a'>,
  'href' | 'children'
>

const variants = {
  accent: 'bg-accent text-accent-ink px-5 py-4',
  outline: 'border border-fg px-5 py-4 invert-hover',
  text: 'px-1 py-4 border-b border-fg invert-hover',
}

/** Bouton-lien d'interface (angles droits, capitales mono, `scale(0.97)` à l'appui). */
export function Button({ href, children, variant = 'accent', external, magnetic = variant === 'accent', className, ...rest }: ButtonProps) {
  const cls = `ui press inline-flex min-h-11 items-center gap-3 tracking-[0.1em] ${variants[variant]} ${className ?? ''}`
  const inner = external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls} {...rest}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  )
  return magnetic ? <Magnetic>{inner}</Magnetic> : inner
}
