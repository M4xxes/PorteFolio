'use client'

import { useEffect, useState } from 'react'

const format = () =>
  new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }).format(new Date())

/** Heure de Lyon (affichée seulement côté client pour éviter un écart avec le rendu serveur). */
export function Clock({ className }: { className?: string }) {
  const [time, setTime] = useState<string | null>(null)
  useEffect(() => {
    const update = () => setTime(format())
    update()
    const id = setInterval(update, 15_000)
    return () => clearInterval(id)
  }, [])
  return (
    <span className={className}>
      LYON{' '}
      <time className="doto text-[1.2em] text-fg" suppressHydrationWarning>
        {time ?? '--:--'}
      </time>
    </span>
  )
}
