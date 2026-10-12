'use client'

import { usePathname } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { site } from '@/lib/constants'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container, Label } from '@/components/ui/Section'

/** Appel à l'action de fin de page — masqué sur la page contact, qui joue déjà ce rôle. */
export function FooterCta() {
  const pathname = usePathname()
  if (pathname === '/contact') return null

  return (
    <section aria-label="Contact" className="border-t border-line bg-cream py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-9">
          <Label index="→" className="text-muted">
            Prochaine étape
          </Label>
          <p className="display mt-8 text-[clamp(3rem,9vw,8.5rem)]">
            Une alternance,
            <br />
            un projet<span className="text-orange">&nbsp;?</span>
          </p>
        </div>
        <div className="flex flex-col items-start gap-4 lg:col-span-3 lg:items-end">
          <ButtonLink href="/contact" variant="accent" icon={<ArrowUpRight size={16} />}>
            Parlons-en
          </ButtonLink>
          <a href={`mailto:${site.email}`} className="link-draw text-sm text-muted hover:text-ink">
            {site.email}
          </a>
        </div>
      </Container>
    </section>
  )
}
