/**
 * Signes décoratifs de l'identité arcade (« [→] », « ↗ », « [01] », « > FERMER < ») :
 * visibles à l'écran, ignorés par les lecteurs d'écran.
 */
export function G({ children }: { children: React.ReactNode }) {
  return <span aria-hidden>{children}</span>
}

/** Texte lu seulement par les lecteurs d'écran (ex. « nouvel onglet »). */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>
}

/** Fin de lien externe : flèche visible, mention « nouvel onglet » pour les lecteurs d'écran. */
export function Ext() {
  return (
    <>
      <G> ↗</G>
      <SrOnly> (nouvel onglet)</SrOnly>
    </>
  )
}
