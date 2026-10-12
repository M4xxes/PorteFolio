import type { CSSProperties, ReactNode } from 'react'
import { Container, Label } from './Section'

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties

/**
 * Ouverture des pages internes : titre monumental révélé dans un masque,
 * puis une rangée asymétrique (chapeau à gauche, `aside` propre à chaque page à droite).
 */
export function PageIntro({
  index,
  label,
  meta,
  title,
  lead,
  aside,
  children,
  tone = 'light',
}: {
  index: string
  label: string
  meta?: ReactNode
  title: ReactNode
  lead: ReactNode
  aside?: ReactNode
  children?: ReactNode
  tone?: 'light' | 'dark'
}) {
  const dark = tone === 'dark'
  return (
    <section
      className={`relative overflow-hidden pt-[calc(var(--header-h)+2.5rem)] pb-16 sm:pb-24 ${
        dark ? 'bg-dark text-cream' : 'border-b border-line'
      }`}
    >
      <Container className="relative">
        <div className={`animate-rise flex items-center justify-between gap-4 border-b pb-4 ${dark ? 'border-dark-line text-dark-muted' : 'border-line text-muted'}`}>
          <Label index={index}>{label}</Label>
          {meta && <div className="label hidden sm:block">{meta}</div>}
        </div>

        <h1 className="display mt-10 text-[clamp(3.5rem,13vw,13rem)] sm:mt-14">
          <span className="line-mask">
            <span style={delay(80)}>{title}</span>
          </span>
        </h1>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="animate-rise lg:col-span-5 lg:col-start-4" style={delay(260)}>
            <p className={`text-lg leading-relaxed text-pretty sm:text-xl ${dark ? 'text-cream/85' : 'text-ink'}`}>{lead}</p>
            {children && <div className="mt-8">{children}</div>}
          </div>
          {aside && (
            <div className="animate-rise lg:col-span-4 lg:col-start-9" style={delay(340)}>
              {aside}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
