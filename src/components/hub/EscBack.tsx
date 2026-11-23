'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Échap sur une page projet : retour à la sphère (accueil, au niveau des projets). */
export function EscBack() {
  const router = useRouter()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.push('/#projets')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])
  return null
}
