'use client'

import { useEffect, useRef } from 'react'
import { Canvas, advance } from '@react-three/fiber'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { projects } from '@/lib/data/projects'
import { HeroParticles } from './HeroParticles'
import { ProjectCarousel } from './ProjectCarousel'
import { CameraRig, ControlRoom } from './ControlRoom'
import { CAMERA_Z, FOV, T_END, clamp01, heroT, measure, metrics, poke, workState } from './heroTimeline'
import { ROOM_DURATION, room, roomEase, roomFlash } from './roomState'

/** Sans mouvement (scroll, curseur) pendant ce délai, la scène n'est plus redessinée. */
const IDLE_MS = 1500

function markDrawn() {
  if (document.documentElement.dataset.scene === 'on') return
  // Les versions statiques (sphère SVG, capture HTML) s'effacent dès que la scène a réellement dessiné.
  document.documentElement.dataset.scene = 'on'
  ui.setState({ scene: 'ready' })
}

/**
 * Le seul <Canvas> du site : fixe, plein écran, sans événements.
 * `frameloop="never"` : c'est la boucle commune (`addFrame`, après Lenis) qui appelle `advance`,
 * et seulement quand la scène a quelque chose à montrer — l'équivalent de "demand" :
 *   - hero : tant que sa chronologie est à l'écran (la sphère tourne en continu) ;
 *   - carrousel et salle : tant que ça bouge (scroll, curseur, transition), puis l'image reste figée.
 * Derrière le HTML en temps normal ; il passe devant (sous l'en-tête) dès qu'on entre dans la salle.
 */
export default function Stage() {
  const wrap = useRef<HTMLDivElement>(null)
  const flash = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const text = document.querySelector<HTMLElement>('[data-hero-text]')
    const el = wrap.current!
    const fl = flash.current!
    let cleared = 0
    let px = 0
    let py = 0
    let front = false

    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    window.addEventListener('resize', measure)

    const stop = addFrame((time, delta) => {
      const { scroll, pointer, work } = ui.getState()

      // Transition carrousel ↔ salle : progression linéaire vers la cible, donc réversible à tout moment.
      room.target = work.mode === 'room' ? 1 : 0
      if (room.t !== room.target) {
        const step = delta / 1000 / ROOM_DURATION
        room.t = room.target > room.t ? Math.min(1, room.t + step) : Math.max(0, room.t - step)
        poke()
      }
      const inRoom = room.t > 0
      if (inRoom !== front) {
        front = inRoom
        el.style.zIndex = inRoom ? '80' : ''
      }
      if (inRoom || fl.style.opacity !== '0') {
        el.style.backgroundColor = inRoom ? `rgba(12, 12, 14, ${Math.min(1, roomEase() * 5).toFixed(3)})` : ''
        fl.style.opacity = roomFlash().toFixed(3)
      }

      if (Math.abs(scroll.velocity) > 0.01 || pointer.x !== px || pointer.y !== py) poke()
      px = pointer.x
      py = pointer.y
      const idle = time - metrics.lastActivity > IDLE_MS

      if (inRoom) {
        if (idle && room.t === room.target && room.swap <= 0) return
        advance(time / 1000)
        markDrawn()
        return
      }

      let hero = false
      let carousel = false
      if (metrics.ready) {
        const t = heroT()
        hero = t < T_END
        carousel = workState().onScreen
        // Côté HTML, sur la même frame : le titre du hero monte et s'efface.
        if (text) {
          const o = 1 - clamp01(t / 0.32)
          text.style.opacity = o.toFixed(3)
          text.style.transform = `translate3d(0, ${(-scroll.y * 0.28).toFixed(1)}px, 0)`
          text.style.visibility = o <= 0 ? 'hidden' : ''
        }
      }
      if (!hero && !carousel) {
        // Plus rien à l'écran : deux frames pour vider le canvas, puis on s'arrête.
        if (cleared++ > 2) return
      } else {
        cleared = 0
        if (!hero && idle) return
      }
      advance(time / 1000)
    }, 20)

    return () => {
      stop()
      ro.disconnect()
      window.removeEventListener('resize', measure)
      html.removeAttribute('data-scene')
      if (text) text.style.cssText = ''
      room.t = 0
    }
  }, [])

  return (
    <div ref={wrap} aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        frameloop="never"
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        camera={{ fov: FOV, position: [0, 0, CAMERA_Z], near: 0.1, far: 100 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <CameraRig />
        <ProjectCarousel />
        <ControlRoom />
        <HeroParticles texture={projects[0].cover.src} onFirstFrame={markDrawn} />
      </Canvas>
      {/* Flash de grain au milieu de la transition : il masque le changement de décor. */}
      <div ref={flash} className="room-flash absolute inset-0" style={{ opacity: 0 }} />
    </div>
  )
}
