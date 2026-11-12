'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { Component, useEffect, useState, type ReactNode } from 'react'
import { reducedMotionQuery } from '@/lib/motion'
import { gpuIsCapable, readLiteMode, readPerf, reportPerf, webglAvailable } from '@/lib/quality'
import { readSound } from '@/lib/sound'
import { ui, useUI, type LiteReason } from '@/lib/store'

// three + R3F ne sont jamais dans le bundle initial : chargés après le premier rendu, côté client seulement.
const Stage = dynamic(() => import('./Stage'), { ssr: false })

/** Si la scène plante (shader refusé, contexte WebGL perdu…), on repasse en version légère sans casser la page. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Scène 3D désactivée :', error)
    document.documentElement.removeAttribute('data-scene')
    reportPerf('error')
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * Décide si la scène 3D est montée (règles dans `lib/quality.ts`).
 * Sinon, les versions statiques restent en place : sphère SVG, cartes 2D, page projet classique.
 */
export function SceneRoot() {
  const pathname = usePathname()
  const liteMode = useUI((s) => s.liteMode)
  const perf = useUI((s) => s.perf)
  const [mount, setMount] = useState(false)

  // Préférences mémorisées : lues une fois, après l'hydratation.
  useEffect(() => {
    ui.setState({ liteMode: readLiteMode(), perf: readPerf(), sound: readSound() })
  }, [])

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 1024px)')
    const reduced = window.matchMedia(reducedMotionQuery)
    let timer = 0
    let cancelled = false

    const lite = (reason: LiteReason) => {
      setMount(false)
      ui.setState({ scene: 'off', quality: 'lite', liteReason: reason })
    }
    const full = () => {
      // `quality: 'full'` dès la décision : la mise en page fixée du carrousel s'installe tout de suite,
      // avec la capture HTML du projet actif en attendant que la scène dessine.
      ui.setState({ scene: 'loading', quality: 'full', liteReason: null })
      // Après le premier rendu : le texte s'affiche avant que la 3D ne soit téléchargée.
      timer = window.setTimeout(() => !cancelled && setMount(true), 60)
    }

    const decide = () => {
      clearTimeout(timer)
      const mode = readLiteMode()
      if (pathname !== '/' && !pathname.startsWith('/projects/')) return lite('route')
      if (reduced.matches) return lite('motion')
      if (!wide.matches) return lite('small')
      if (!webglAvailable()) return lite('webgl')
      if (mode === 'on') return lite('manual')
      if (perf === 'error') return lite('error')
      if (mode === 'auto' && (perf === 'gpu' || perf === 'fps')) return lite(perf)
      if (mode === 'off' || perf === 'ok') return full()
      // Premier passage de la session : test du GPU (quelques dizaines de ms, données servies par le site).
      gpuIsCapable().then((ok) => {
        if (cancelled) return
        reportPerf(ok ? 'ok' : 'gpu')
      })
    }
    decide()
    wide.addEventListener('change', decide)
    reduced.addEventListener('change', decide)
    return () => {
      cancelled = true
      clearTimeout(timer)
      wide.removeEventListener('change', decide)
      reduced.removeEventListener('change', decide)
    }
  }, [pathname, liteMode, perf])

  return mount ? (
    <SceneBoundary>
      <Stage />
    </SceneBoundary>
  ) : null
}
