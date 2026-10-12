import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'accent' | 'outline' | 'text' | 'outline-light'

const base =
  'group/btn relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden px-6 text-sm font-medium tracking-tight transition-[color,border-color,transform] duration-300 active:scale-[0.98]'

// Le fond orange « monte » dans le bouton au survol (pseudo-élément), le texte reste au-dessus.
const fill =
  'before:absolute before:inset-0 before:-z-0 before:origin-bottom before:scale-y-0 before:bg-orange before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.16,1,0.3,1)] hover:before:scale-y-100 focus-visible:before:scale-y-100'

const variants: Record<Variant, string> = {
  primary: `rounded-full bg-ink text-cream hover:text-ink ${fill}`,
  accent: 'rounded-full bg-orange text-ink hover:bg-ink hover:text-cream',
  outline: `rounded-full border border-ink text-ink hover:border-orange ${fill}`,
  'outline-light': `rounded-full border border-cream/40 text-cream hover:border-orange hover:text-ink ${fill}`,
  text: 'min-h-11 px-0 text-ink link-draw',
}

export function buttonClasses(variant: Variant = 'primary', className = '') {
  return `${base} ${variants[variant]} ${className}`
}

type Props = {
  href: string
  variant?: Variant
  icon?: ReactNode
  className?: string
  children: ReactNode
  /** Lien externe : ouvre un nouvel onglet. */
  external?: boolean
  download?: boolean
} & Omit<ComponentProps<'a'>, 'href' | 'className' | 'children'>

export function ButtonLink({ href, variant = 'primary', icon, className, children, external, download, ...rest }: Props) {
  const content = (
    <>
      <span className="relative">{children}</span>
      {icon && (
        <span aria-hidden className="relative inline-flex transition-transform duration-300 group-hover/btn:translate-x-0.5">
          {icon}
        </span>
      )}
    </>
  )

  if (external || download || /^(mailto|tel):/.test(href)) {
    return (
      <a
        href={href}
        className={buttonClasses(variant, className)}
        {...(download ? { download: true } : {})}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        {...rest}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className={buttonClasses(variant, className)} {...rest}>
      {content}
    </Link>
  )
}
