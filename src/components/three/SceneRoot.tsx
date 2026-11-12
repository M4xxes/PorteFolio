'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { reducedMotionQuery } from '@/lib/motion'
import { ui, useUI } from '@/lib/store'

// three + R3F ne sont jamais dans le bundle initial : chargés après le premier rendu, côté client seulement.
const Stage = dynamic(() => import('./Stage'), { ssr: false })

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Décide si la scène 3D est montée. Pour l'instant : accueil, écran ≥ 1024 px, WebGL disponible,
 * hors reduced motion et hors « version légère ». La détection fine (GPU, FPS) arrive en phase 5.
 * Sinon, les versions statiques restent en place (sphère SVG, cartes 2D).
 */
export function SceneRoot() {
  const pathname = usePathname()
  const liteForced = useUI((s) => s.liteForced)
  const [mount, setMount] = useState(false)

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)')
    const reduced = window.matchMedia(reducedMotionQuery)
    let idle = 0

    const decide = () => {
      const ok = pathname === '/' && !liteForced && wide.matches && !reduced.matches && webglAvailable()
      if (!ok) {
        setMount(false)
        ui.setState({ scene: 'off', quality: 'lite' })
        return
      }
      ui.setState({ scene: 'loading' })
      // Après le premier rendu : le texte s'affiche avant que la 3D ne soit téléchargée.
      idle = window.setTimeout(() => setMount(true), 60)
    }
    decide()
    wide.addEventListener('change', decide)
    reduced.addEventListener('change', decide)
    return () => {
      clearTimeout(idle)
      wide.removeEventListener('change', decide)
      reduced.removeEventListener('change', decide)
    }
  }, [pathname, liteForced])

  return mount ? <Stage /> : null
}
