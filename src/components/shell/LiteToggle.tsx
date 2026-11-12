'use client'

import { hardReasons, reasonLabels, setLiteMode } from '@/lib/quality'
import { useUI } from '@/lib/store'

/**
 * « VERSION LÉGÈRE » (pas de 3D) : état réel et bascule manuelle, mémorisée dans ce navigateur.
 * Quand la 3D est impossible (petit écran, animations réduites, pas de WebGL), on affiche simplement pourquoi.
 */
export function LiteToggle() {
  const quality = useUI((s) => s.quality)
  const reason = useUI((s) => s.liteReason)
  const lite = quality === 'lite'

  if (quality === 'pending' || reason === 'route') return null

  const why = reason ? reasonLabels[reason] : ''
  if (reason && hardReasons.includes(reason))
    return (
      <p className="ui">
        Version légère : ON{why && <span className="text-fg-2"> · {why}</span>}
      </p>
    )

  return (
    <button type="button" onClick={() => setLiteMode(lite ? 'off' : 'on')} aria-pressed={lite} className="ui press min-h-11 hover:text-fg">
      Version légère : <span className={lite ? 'text-accent' : ''}>{lite ? 'ON' : 'OFF'}</span>
      {lite && why && <span className="text-fg-2"> · {why}</span>}
    </button>
  )
}
