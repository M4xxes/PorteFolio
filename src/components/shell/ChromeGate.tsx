'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** L'accueil (œil + hub) a sa propre interface : l'en-tête, le pied de page et le curseur du reste du site n'y sont pas affichés. */
export function ChromeGate({ children }: { children: ReactNode }) {
  return usePathname() === '/' ? null : <>{children}</>
}
