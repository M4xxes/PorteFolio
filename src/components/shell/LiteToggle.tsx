'use client'

import { useEffect } from 'react'
import { LITE_STORAGE_KEY } from '@/lib/motion'
import { ui, useUI } from '@/lib/store'

/**
 * Bascule manuelle « VERSION LÉGÈRE » (pas de 3D). Le choix est mémorisé dans ce navigateur.
 * La détection automatique (WebGL, GPU, FPS, reduced motion) arrive en phase 5.
 */
export function LiteToggle() {
  const forced = useUI((s) => s.liteForced)

  useEffect(() => {
    try {
      if (localStorage.getItem(LITE_STORAGE_KEY) === '1') ui.setState({ liteForced: true, quality: 'lite' })
    } catch {}
  }, [])

  const toggle = () => {
    const next = !forced
    ui.setState({ liteForced: next, quality: next ? 'lite' : 'pending' })
    try {
      if (next) localStorage.setItem(LITE_STORAGE_KEY, '1')
      else localStorage.removeItem(LITE_STORAGE_KEY)
    } catch {}
  }

  return (
    <button type="button" onClick={toggle} aria-pressed={forced} className="ui press min-h-11 hover:text-fg">
      VERSION LÉGÈRE : <span className={forced ? 'text-accent' : ''}>{forced ? 'ON' : 'OFF'}</span>
    </button>
  )
}
