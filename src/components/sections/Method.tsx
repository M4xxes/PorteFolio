'use client'

import { useEffect, useRef, useState } from 'react'
import { methodSteps } from '@/lib/data/method'
import { ui } from '@/lib/store'
import { Container, SectionHead } from '@/components/ui/Kit'
import { G } from '@/components/ui/Glyph'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Méthode en 4 étapes. À partir de 768 px, le bloc reste fixé pendant le défilement
 * et l'étape change avec la progression (01 / 04 → 04 / 04). En dessous : simple liste.
 */
export function Method() {
  const outer = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    let last = -1
    return ui.subscribe(() => {
      const el = outer.current
      if (!el || !mq.matches) return
      const r = el.getBoundingClientRect()
      const span = r.height - window.innerHeight
      const p = span > 0 ? Math.min(0.999, Math.max(0, -r.top / span)) : 0
      const s = Math.floor(p * methodSteps.length)
      if (s !== last) {
        last = s
        setStep(s)
      }
    })
  }, [])

  const total = pad(methodSteps.length)

  return (
    <section id="method" aria-labelledby="method-title">
      <Container>
        <SectionHead index="02" label="Méthode" title={<span id="method-title">Quatre étapes</span>} />
      </Container>

      {/* Mobile : liste visible. Desktop : la même liste, lue par les lecteurs d'écran (le bloc fixé est visuel). */}
      <Container className="md:sr-only">
        <ol className="mt-12 flex flex-col">
          {methodSteps.map((s, i) => (
            <li key={s.title} className="border-t border-line py-8">
              <p className="ui text-fg-2">
                <span className="doto text-xl text-fg">{pad(i + 1)}</span> / {total}
              </p>
              <h3 className="pixel mt-4 text-[2.5rem]">{s.title}</h3>
              <p className="mt-3 text-fg-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>

      {/* Desktop : étapes fixées pendant le défilement (une hauteur d'écran par étape). */}
      <div ref={outer} aria-hidden className="relative hidden md:block" style={{ height: `${methodSteps.length * 60 + 40}vh` }}>
        <div className="sticky top-0 flex h-svh flex-col justify-center">
          <Container className="grid grid-cols-12 gap-x-6">
            <div className="col-span-4 flex flex-col justify-between gap-12">
              <p className="ui text-fg-2" aria-hidden>
                <span className="doto text-[4.5rem] text-fg">{pad(step + 1)}</span> / {total}
              </p>
              <ol className="flex flex-col" aria-label="Étapes">
                {methodSteps.map((s, i) => (
                  <li key={s.title} aria-current={i === step ? 'step' : undefined} className={`ui flex items-center gap-2.5 py-1.5 ${i === step ? 'text-fg' : 'text-fg-3'}`}>
                    <span aria-hidden className={`size-[7px] ${i === step ? 'bg-accent' : ''}`} /><G>[{pad(i + 1)}]</G> {s.title}
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative col-span-8 min-h-[22rem]">
              {methodSteps.map((s, i) => (
                <div
                  key={s.title}
                  aria-hidden={i !== step}
                  className={`absolute inset-0 transition-[opacity,transform] duration-[260ms] ease-[var(--ease-out)] ${
                    i === step ? 'opacity-100' : i < step ? '-translate-y-3 opacity-0' : 'translate-y-3 opacity-0'
                  }`}
                >
                  <h3 className="pixel text-[clamp(3.5rem,8vw,8rem)]">{s.title}</h3>
                  <p className="mt-8 max-w-[34rem] text-base text-fg-2">{s.text}</p>
                </div>
              ))}
            </div>
          </Container>
        </div>
      </div>
    </section>
  )
}
