'use client'

import { useEffect } from 'react'

/** Échap sur une page projet : retour à la sphère (accueil, au niveau des projets). */
export function EscBack() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') window.location.assign('/#projets')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}
