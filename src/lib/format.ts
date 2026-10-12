const monthFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric', timeZone: 'Europe/Paris' })

/** « oct. 2026 » */
export function formatMonth(iso: string) {
  return monthFormatter.format(new Date(iso))
}
