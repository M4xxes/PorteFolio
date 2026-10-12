import { ViewTransition, type ReactNode } from 'react'

/** Fondu + légère montée du contenu lors d'une navigation entre pages (aucun effet au premier chargement). */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page" exit="page" default="none">
      {children}
    </ViewTransition>
  )
}
