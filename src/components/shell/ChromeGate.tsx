'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** L'accueil (œil + sphère) et les pages projet ont leur propre interface : l'en-tête, le pied de page et le curseur du reste du site n'y sont pas affichés. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return pathname === '/' || pathname.startsWith('/projets') || pathname.startsWith('/a-propos') ? null : <>{children}</>
}
