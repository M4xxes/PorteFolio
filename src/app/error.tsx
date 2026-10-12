'use client'

import { useEffect } from 'react'
import { RotateCcw } from 'lucide-react'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Container, Label } from '@/components/ui/Section'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main id="main" className="flex min-h-[80svh] items-center pt-[var(--header-h)]">
      <Container className="py-24">
        <Label index="!" className="text-muted">
          Erreur
        </Label>
        <h1 className="display mt-8 max-w-4xl text-[clamp(2.75rem,7vw,6rem)]">
          Quelque chose s’est mal passé<span className="text-orange">.</span>
        </h1>
        <p className="mt-6 max-w-md text-lg text-muted">
          Un problème inattendu a empêché l’affichage de la page. Vous pouvez réessayer ou revenir à l’accueil.
        </p>
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-cream transition-colors hover:bg-orange hover:text-ink"
          >
            Réessayer <RotateCcw size={16} aria-hidden />
          </button>
          <ButtonLink href="/" variant="text">
            Retour à l’accueil
          </ButtonLink>
        </div>
      </Container>
    </main>
  )
}
