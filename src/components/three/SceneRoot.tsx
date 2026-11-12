'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Component, useEffect, useState, type ReactNode } from 'react'
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

/** Si la scène plante (contexte WebGL perdu, shader refusé…), on repasse en version légère sans casser la page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Scène 3D désactivée :', error)
    document.documentElement.removeAttribute('data-scene')
    ui.setState({ scene: 'off', quality: 'lite' })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Décide si la scène 3D est montée. Pour l'instant : accueil et pages projet (salle de contrôle), écran ≥ 1024 px, WebGL disponible,
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
      const ok = (pathname === '/' || pathname.startsWith('/projects/')) && !liteForced && wide.matches && !reduced.matches && webglAvailable()
      if (!ok) {
        setMount(false)
        ui.setState({ scene: 'off', quality: 'lite' })
        return
      }
      // `quality: 'full'` dès la décision : la mise en page fixée du carrousel s'installe tout de suite,
      // avec la capture HTML du projet actif en attendant que la scène dessine.
      ui.setState({ scene: 'loading', quality: 'full' })
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

  return mount ? (
    <SceneBoundary>
      <Stage />
    </SceneBoundary>
  ) : null
}
