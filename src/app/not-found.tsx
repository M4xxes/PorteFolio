import type { Metadata } from 'next'
import { Button, Container, Tag } from '@/components/ui/Kit'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false },
}

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-svh flex-col justify-center pt-[var(--header-h)]">
      <Container className="py-20">
        <Tag index="404">Page introuvable</Tag>
        <p aria-hidden className="doto mt-8 text-[clamp(7rem,26vw,22rem)] leading-[0.8]">
          404
        </p>
        <h1 className="pixel mt-10 text-[clamp(2rem,4.5vw,4rem)]">Signal perdu.</h1>
        <p className="mt-4 max-w-md text-fg-2">L’adresse est peut-être erronée, ou la page a été déplacée. Les projets, eux, sont toujours là.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <Button href="/#work">[→] Voir les projets</Button>
          <Button href="/" variant="text">
            Accueil
          </Button>
        </div>
      </Container>
    </main>
  )
}
