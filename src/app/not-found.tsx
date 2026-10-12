import type { Metadata } from 'next'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container, Label } from '@/components/ui/Section'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-[90svh] flex-col overflow-hidden pt-[calc(var(--header-h)+2rem)]">
      <Container className="relative flex flex-1 flex-col">
        <Label index="404" className="border-b border-line pb-4 text-muted">
          Page introuvable
        </Label>
        <p aria-hidden className="display mt-8 select-none text-[clamp(8rem,34vw,32rem)] leading-[0.8]">
          4<span className="text-orange">0</span>4
        </p>
        <div className="mt-10 grid gap-8 pb-20 lg:grid-cols-12">
          <h1 className="display text-[clamp(2.25rem,4.5vw,4rem)] lg:col-span-6">Cette page a pris un autre chemin.</h1>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-lg text-muted">L’adresse est peut-être erronée, ou la page a été déplacée. Les projets, eux, sont toujours là.</p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
              <ButtonLink href="/projects" icon={<ArrowUpRight size={16} />}>
                Voir les projets
              </ButtonLink>
              <ButtonLink href="/" variant="text" icon={<ArrowLeft size={14} />}>
                Accueil
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </main>
  )
}
