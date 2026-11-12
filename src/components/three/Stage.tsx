'use client'

import { useEffect } from 'react'
import { Canvas, advance } from '@react-three/fiber'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { projects } from '@/lib/data/projects'
import { HeroParticles } from './HeroParticles'
import { CAMERA_Z, FOV, T_END, clamp01, heroT, measure, metrics, smooth } from './heroTimeline'

/**
 * Le seul <Canvas> du site : fixe, plein écran, derrière le HTML, sans événements.
 * `frameloop="never"` : c'est la boucle commune (`addFrame`, après Lenis) qui appelle `advance`,
 * et seulement quand la scène a quelque chose à montrer — l'équivalent de "demand".
 */
export default function Stage() {
  useEffect(() => {
    const html = document.documentElement
    const text = document.querySelector<HTMLElement>('[data-hero-text]')
    const target = document.querySelector<HTMLElement>('[data-scene-target="first-screen"]')
    let idleFrames = 0

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)

    const stop = addFrame((time) => {
      if (!metrics.ready) return
      const t = heroT()

      // Côté HTML, synchronisé sur la même frame : le titre monte et s'efface,
      // la vraie capture du premier projet prend le relais de la mosaïque.
      if (text) {
        const o = 1 - clamp01(t / 0.32)
        text.style.opacity = o.toFixed(3)
        text.style.transform = `translate3d(0, ${(-ui.getState().scroll.y * 0.28).toFixed(1)}px, 0)`
        text.style.visibility = o <= 0 ? 'hidden' : ''
      }
      target?.style.setProperty('--handoff', smooth(0.97, T_END, t).toFixed(3))

      // Rendu à la demande : tant que la chronologie est visible, puis deux frames pour vider l'écran.
      if (t < T_END) idleFrames = 0
      else if (idleFrames++ > 2) return
      advance(time / 1000)
    }, 20)

    return () => {
      stop()
      ro.disconnect()
      window.removeEventListener('resize', measure)
      html.removeAttribute('data-scene')
      if (text) text.style.cssText = ''
      target?.style.removeProperty('--handoff')
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        frameloop="never"
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 100 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <HeroParticles
          texture={projects[0].cover.src}
          onFirstFrame={() => {
            // La sphère statique (SVG) s'efface dès que la scène a réellement dessiné une image.
            document.documentElement.dataset.scene = 'on'
            ui.setState({ scene: 'ready', quality: 'full' })
          }}
        />
      </Canvas>
    </div>
  )
}
