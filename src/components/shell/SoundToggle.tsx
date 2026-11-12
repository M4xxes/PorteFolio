'use client'

import { setSound } from '@/lib/sound'
import { useUI } from '@/lib/store'

/** « SON : OFF » par défaut. Les sons 8-bit ne se jouent qu'une fois activés ici. */
export function SoundToggle() {
  const on = useUI((s) => s.sound)
  return (
    <button type="button" onClick={() => setSound(!on)} aria-pressed={on} className="ui press min-h-11 hover:text-fg">
      Son : <span className={on ? 'text-accent' : ''}>{on ? 'ON' : 'OFF'}</span>
    </button>
  )
}
