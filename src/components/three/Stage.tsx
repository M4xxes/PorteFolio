'use client'

import { useEffect } from 'react'
import { Canvas, advance } from '@react-three/fiber'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { projects } from '@/lib/data/projects'
import { HeroParticles } from './HeroParticles'
import { ProjectCarousel } from './ProjectCarousel'
import { CAMERA_Z, FOV, T_END, clamp01, heroT, measure, metrics, poke, workState } from './heroTimeline'

/** Sans mouvement (scroll, curseur) pendant ce délai, le carrousel n'est plus redessiné. */
const IDLE_MS = 1500

/**
 * Le seul <Canvas> du site : fixe, plein écran, derrière le HTML, sans événements.
 * `frameloop="never"` : c'est la boucle commune (`addFrame`, après Lenis) qui appelle `advance`,
 * et seulement quand la scène a quelque chose à montrer — l'équivalent de "demand" :
 *   - hero : tant que sa chronologie est à l'écran (la sphère tourne en continu) ;
 *   - carrousel : tant que ça défile ou que le curseur bouge, puis l'image reste figée et nette.
 */
export default function Stage() {
  useEffect(() => {
    const html = document.documentElement
    const text = document.querySelector<HTMLElement>('[data-hero-text]')
    let cleared = 0
    let px = 0
    let py = 0

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)

    const stop = addFrame((time) => {
      if (!metrics.ready) return
      const t = heroT()
      const { scroll, pointer } = ui.getState()

      // Côté HTML, sur la même frame : le titre du hero monte et s'efface.
      if (text) {
        const o = 1 - clamp01(t / 0.32)
        text.style.opacity = o.toFixed(3)
        text.style.transform = `translate3d(0, ${(-scroll.y * 0.28).toFixed(1)}px, 0)`
        text.style.visibility = o <= 0 ? 'hidden' : ''
      }

      if (Math.abs(scroll.velocity) > 0.01 || pointer.x !== px || pointer.y !== py) poke()
      px = pointer.x
      py = pointer.y

      const hero = t < T_END
      const carousel = workState().onScreen
      if (!hero && !carousel) {
        // Plus rien à l'écran : deux frames pour vider le canvas, puis on s'arrête.
        if (cleared++ > 2) return
      } else {
        cleared = 0
        if (!hero && time - metrics.lastActivity > IDLE_MS) return
      }
      advance(time / 1000)
    }, 20)

    return () => {
      stop()
      ro.disconnect()
      window.removeEventListener('resize', measure)
      html.removeAttribute('data-scene')
      if (text) text.style.cssText = ''
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        frameloop="never"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 100 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ProjectCarousel />
        <HeroParticles
          texture={projects[0].cover.src}
          onFirstFrame={() => {
            // Les versions statiques (sphère SVG, capture HTML) s'effacent dès que la scène a réellement dessiné.
            document.documentElement.dataset.scene = 'on'
            ui.setState({ scene: 'ready' })
          }}
        />
      </Canvas>
    </div>
  )
}
