/**
 * Script exécuté de façon synchrone pendant l'analyse du HTML, avant le premier rendu.
 * Côté client, le type `text/plain` évite l'avertissement de React sur les balises <script>.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
