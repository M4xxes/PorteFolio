'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY)
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

/**
 * Préférence « réduire les animations ».
 * Vaut `false` pendant l'hydratation (comme le rendu serveur) puis la vraie valeur :
 * pas de rendu divergent, donc pas d'erreur d'hydratation.
 */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false)
}
