'use client'

import { useEffect } from 'react'
import { Button, Container, Tag } from '@/components/ui/Kit'
import { G } from '@/components/ui/Glyph'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main" className="flex min-h-svh items-center pt-[var(--header-h)]">
      <Container className="py-24">
        <Tag index="!">Erreur</Tag>
        <h1 className="pixel mt-8 text-[clamp(2.5rem,7vw,6rem)]">
          Quelque chose a planté<span className="text-accent">.</span>
        </h1>
        <p className="mt-6 max-w-md text-fg-2">Un problème inattendu a empêché l’affichage de la page. Vous pouvez réessayer ou revenir à l’accueil.</p>
        <div className="mt-10 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="ui press inline-flex min-h-11 items-center bg-accent px-5 py-4 tracking-[0.1em] text-accent-ink">
            <G>[↻]</G> Réessayer
          </button>
          <Button href="/" variant="text">
            Accueil
          </Button>
        </div>
      </Container>
    </main>
  )
}
