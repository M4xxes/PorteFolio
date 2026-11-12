'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '@/lib/data/projects'
import { ui } from '@/lib/store'
import { heroT, metrics, poke, smooth, workState } from './heroTimeline'
import { room, roomEase } from './roomState'
import { PAD, createScreenMaterial, loadScreenTexture, screenColors } from './screenMaterial'

const N = projects.length
const STEP = (Math.PI * 2) / N
/** Rayon du cylindre et pente de la diagonale, en largeurs d'écran. */
const RADIUS = 1.15
const DIAGONAL = 0.62

/**
 * Carrousel : les projets sont des écrans posés sur un cylindre que le scroll fait tourner.
 * L'écran actif est de face ; les voisins arrivent et repartent en diagonale, plus petits et gris.
 */
export function ProjectCarousel() {
  const group = useRef<THREE.Group>(null)
  const meshes = useRef<(THREE.Mesh | null)[]>([])
  const anim = useRef({ rx: 0, ry: 0, vx: 0, vy: 0, active: projects.map((_, i) => (i === 0 ? 1 : 0)) })

  const { geometry, materials } = useMemo(() => {
    const colors = screenColors()
    return { geometry: new THREE.PlaneGeometry(1, 1), materials: projects.map(() => createScreenMaterial(colors)) }
  }, [])

  // Textures : une par projet, libérées au démontage.
  useEffect(() => {
    let disposed = false
    const loaded: THREE.Texture[] = []
    projects.forEach((p, i) => {
      loadScreenTexture(p.cover.src, 1200, (t) => {
        if (disposed) return t.dispose()
        loaded.push(t)
        const u = (meshes.current[i]?.material as THREE.ShaderMaterial | undefined)?.uniforms
        if (!u) return
        u.uTex.value = t
        u.uReady.value = 1
        poke()
      })
    })
    return () => {
      disposed = true
      loaded.forEach((t) => t.dispose())
    }
  }, [])

  useEffect(
    () => () => {
      geometry.dispose()
      materials.forEach((m) => m.dispose())
    },
    [geometry, materials]
  )

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const { p, offset, onScreen } = workState()
    const intro = smooth(0.9, 1, heroT())
    // Dans la salle de contrôle (seconde moitié de la transition), le carrousel n'est plus dessiné.
    g.visible = onScreen && intro > 0 && roomEase() < 0.5
    if (!g.visible) return

    const { scroll, pointer } = ui.getState()
    const dt = Math.min(delta, 0.05)
    const { wpp, vw, vh, screen } = metrics
    const a = anim.current

    // Inclinaison vers le curseur, avec ressort ; nulle tant que la mosaïque du hero n'a pas fini.
    const on = intro >= 1 && room.target === 0 && room.t === 0 ? 1 : 0
    const k = 30
    const c = 9
    a.vy += (-k * (a.ry - pointer.nx * 0.15 * on) - c * a.vy) * dt
    a.vx += (-k * (a.rx - pointer.ny * 0.1 * on) - c * a.vx) * dt
    a.ry += a.vy * dt
    a.rx += a.vx * dt

    g.position.set((screen.cx - vw / 2) * wpp, -(offset + screen.cy - vh / 2) * wpp, 0)
    g.rotation.set(a.rx, a.ry, 0)

    const w = screen.w * wpp
    const h = screen.h * wpp
    const radius = w * RADIUS
    const angle = p * (N - 1) * STEP
    const activeIndex = Math.round(p * (N - 1))
    const vel = scroll.velocity
    const time = state.clock.elapsedTime

    for (let i = 0; i < N; i++) {
      const mesh = meshes.current[i]
      if (!mesh) continue
      let rel = i * STEP - angle
      rel = ((((rel + Math.PI) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) - Math.PI
      const cos = Math.cos(rel)
      const sin = Math.sin(rel)
      const opacity = cos > 0 ? 0.2 + 0.8 * cos : 0
      mesh.visible = cos > -0.05 && opacity > 0
      if (!mesh.visible) continue

      // Le précédent descend vers le coin bas-gauche, le suivant arrive du coin haut-droit.
      mesh.position.set(sin * radius, sin * DIAGONAL * w, cos * radius - radius)
      mesh.rotation.y = rel
      mesh.scale.set(w * PAD, h * PAD, 1)
      mesh.renderOrder = cos

      a.active[i] += ((i === activeIndex ? 1 : 0) - a.active[i]) * Math.min(1, dt * 10)
      const u = (mesh.material as THREE.ShaderMaterial).uniforms
      u.uActive.value = a.active[i]
      u.uFringe.value = a.active[i]
      u.uOpacity.value = opacity * intro
      u.uVel.value = vel
      u.uTime.value = time
      u.uPx.value = 1 / screen.w
      u.uLines.value = screen.h / 4
      u.uSkew.value = Math.max(-60, Math.min(60, vel)) * 0.0012
    }
  })

  return (
    <group ref={group} visible={false}>
      {projects.map((p, i) => (
        <mesh
          key={p.id}
          ref={(el) => {
            meshes.current[i] = el
          }}
          geometry={geometry}
          material={materials[i]}
          frustumCulled={false}
        />
      ))}
    </group>
  )
}
