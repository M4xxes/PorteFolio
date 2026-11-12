'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { projects } from '@/lib/data/projects'
import { roomScreens } from '@/lib/data/roomScreens'
import { ui, useUI } from '@/lib/store'
import { CAMERA_Z, FOV, metrics, poke, workState } from './heroTimeline'
import { room, roomEase } from './roomState'
import { PAD, createScreenMaterial, cssColor, loadScreenTexture, screenColors } from './screenMaterial'

/**
 * Salle de contrôle, version simple : sol quadrillé, mur, trois écrans muraux, trois pupitres.
 * Rendu sans lumière (matériaux non éclairés), en noir et blanc ; l'accent ne sert qu'aux voyants.
 * Unités : mètres. Le mur est en z = 0, la caméra regarde vers -z.
 */
const ROOM_FOV = 40
const SLOTS = [
  { x: 0, y: 2.15, z: 0.02, rot: 0, w: 4.6 },
  { x: -4.45, y: 2.05, z: 0.75, rot: 0.42, w: 3.5 },
  { x: 4.45, y: 2.05, z: 0.75, rot: -0.42, w: 3.5 },
] as const
const TALL_H = 3.0
const CONSOLES = [-3.9, 0, 3.9]

const gridVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
const gridFragment = /* glsl */ `
  uniform vec2 uCells;
  uniform vec3 uBg;
  uniform vec3 uLine;
  uniform float uStrength;
  varying vec2 vUv;
  varying vec3 vWorld;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  void main() {
    vec2 p = vUv * uCells;
    vec2 a = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line = 1.0 - min(min(a.x, a.y), 1.0);
    // Les lignes se perdent dans le noir en s'éloignant du centre de la salle.
    float fade = 1.0 - smoothstep(5.0, 17.0, length(vWorld.xz - vec2(0.0, 3.0)));
    vec3 col = uBg + uLine * line * uStrength * fade;
    col += (hash(gl_FragCoord.xy) - 0.5) * 0.035;
    gl_FragColor = vec4(col, 1.0);
  }
`

function gridMaterial(cells: [number, number], strength: number) {
  return new THREE.ShaderMaterial({
    vertexShader: gridVertex,
    fragmentShader: gridFragment,
    // Opaque : sol et mur sont dessinés avant les écrans (transparents), qui ne peuvent donc pas être recouverts.
    uniforms: {
      uCells: { value: new THREE.Vector2(...cells) },
      uBg: { value: cssColor('--bg', '#0c0c0e') },
      uLine: { value: cssColor('--fg', '#edede8') },
      uStrength: { value: strength },
    },
  })
}

const toColor = (v: THREE.Vector3) => new THREE.Color().setRGB(v.x, v.y, v.z, THREE.SRGBColorSpace)

export function ControlRoom() {
  const active = useUI((s) => s.work.active)
  const group = useRef<THREE.Group>(null)
  const screens = useRef<(THREE.Mesh | null)[]>([])
  const frames = useRef<(THREE.LineLoop | null)[]>([])
  const leds = useRef<(THREE.Mesh | null)[]>([])
  const sizes = useRef<[number, number][]>(SLOTS.map((s) => [s.w, s.w * 0.625]))

  const res = useMemo(() => {
    const colors = screenColors()
    const fg = toColor(colors.fg)
    const accent = toColor(colors.accent)
    const plane = new THREE.PlaneGeometry(1, 1)
    const box = new THREE.BoxGeometry(3.3, 0.92, 1.1)
    const edges = new THREE.EdgesGeometry(box)
    const outline = new THREE.BufferGeometry().setFromPoints(
      [
        [-0.5, -0.5],
        [0.5, -0.5],
        [0.5, 0.5],
        [-0.5, 0.5],
      ].map(([x, y]) => new THREE.Vector3(x, y, 0))
    )
    return {
      plane,
      box,
      edges,
      outline,
      floor: gridMaterial([40, 40], 0.2),
      wall: gridMaterial([16, 3], 0.09),
      screenMats: SLOTS.map(() => createScreenMaterial(colors, true)),
      body: new THREE.MeshBasicMaterial({ color: 0x131316 }),
      line: new THREE.LineBasicMaterial({ color: fg, transparent: true, opacity: 0.28 }),
      ledOn: new THREE.MeshBasicMaterial({ color: accent }),
      ledOff: new THREE.MeshBasicMaterial({ color: fg, transparent: true, opacity: 0.25 }),
    }
  }, [])

  useEffect(
    () => () => {
      Object.values(res).forEach((r) => (Array.isArray(r) ? r.forEach((m) => m.dispose()) : r.dispose()))
    },
    [res]
  )

  // Captures du projet affiché : chargées à l'entrée dans la salle, libérées au changement de projet.
  useEffect(() => {
    let disposed = false
    const loaded: THREE.Texture[] = []
    roomScreens(projects[active]).forEach(({ image }, i) => {
      const mesh = screens.current[i]
      const u = (mesh?.material as THREE.ShaderMaterial | undefined)?.uniforms
      if (u) {
        u.uReady.value = 0
        u.uTex.value = null
      }
      const tall = image ? image.height > image.width : false
      sizes.current[i] = tall && image ? [(TALL_H * image.width) / image.height, TALL_H] : [SLOTS[i].w, SLOTS[i].w * 0.625]
      const led = leds.current[i]
      if (led) led.material = image ? res.ledOn : res.ledOff
      if (!image) return
      loadScreenTexture(image.src, tall ? 750 : 1200, (t) => {
        if (disposed) return t.dispose()
        loaded.push(t)
        const uniforms = (screens.current[i]?.material as THREE.ShaderMaterial | undefined)?.uniforms
        if (!uniforms) return
        uniforms.uTex.value = t
        uniforms.uReady.value = 1
        poke()
      })
    })
    poke()
    return () => {
      disposed = true
      loaded.forEach((t) => t.dispose())
    }
  }, [active, res])

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    g.visible = roomEase() >= 0.5
    if (!g.visible) return
    room.swap = Math.max(0, room.swap - delta / 0.45)
    const focus = ui.getState().roomFocus
    const time = state.clock.elapsedTime
    for (let i = 0; i < SLOTS.length; i++) {
      const mesh = screens.current[i]
      if (!mesh) continue
      const [w, h] = sizes.current[i]
      mesh.scale.set(w * PAD, h * PAD, 1)
      frames.current[i]?.scale.set(w * 1.02, h * 1.03, 1)
      leds.current[i]?.position.set(-w / 2 + 0.06, -h / 2 - 0.16, 0.01)
      const u = (mesh.material as THREE.ShaderMaterial).uniforms
      const on = u.uReady.value > 0
      const focused = focus === i ? 1 : 0
      u.uActive.value = on ? 1 : 0.5
      // Noir et blanc ; l'écran visé par la caméra retrouve un peu de couleur.
      u.uMono.value += ((focused ? 0.25 : 1) - u.uMono.value) * Math.min(1, delta * 6)
      u.uFringe.value = focused
      u.uOpacity.value = 1 - room.swap
      u.uTime.value = time
      u.uVel.value = room.swap * 30
      u.uPx.value = 1 / (w * 130)
      u.uLines.value = h * 26 // lignes plus larges que dans le carrousel : moins de moiré vu de loin
    }
  })

  return (
    <group ref={group} visible={false}>
      <mesh geometry={res.plane} material={res.floor} rotation-x={-Math.PI / 2} position={[0, 0, 4]} scale={[40, 40, 1]} />
      <mesh geometry={res.plane} material={res.wall} position={[0, 4.5, -0.05]} scale={[40, 9, 1]} />
      {SLOTS.map((s, i) => (
        <group key={i} position={[s.x, s.y, s.z]} rotation-y={s.rot}>
          <mesh
            ref={(el) => {
              screens.current[i] = el
            }}
            geometry={res.plane}
            material={res.screenMats[i]}
            renderOrder={2}
          />
          <lineLoop
            ref={(el) => {
              frames.current[i] = el
            }}
            geometry={res.outline}
            material={res.line}
          />
          <mesh
            ref={(el) => {
              leds.current[i] = el
            }}
            geometry={res.plane}
            material={res.ledOff}
            scale={[0.09, 0.09, 1]}
          />
        </group>
      ))}
      {CONSOLES.map((x) => (
        <group key={x} position={[x, 0.46, 3.7]}>
          <mesh geometry={res.box} material={res.body} />
          <lineSegments geometry={res.edges} material={res.line} />
          {[-1.2, -1.0, -0.8].map((lx, k) => (
            <mesh key={lx} geometry={res.plane} material={k === 0 ? res.ledOn : res.ledOff} position={[lx, 0.25, 0.556]} scale={[0.07, 0.07, 1]} />
          ))}
        </group>
      ))}
    </group>
  )
}

// --- Caméra -----------------------------------------------------------------

const v = {
  pos: new THREE.Vector3(),
  look: new THREE.Vector3(),
  a: new THREE.Vector3(),
  b: new THREE.Vector3(),
}

/** Pose de la caméra dans la salle : vue d'ensemble, ou face à l'un des trois écrans. */
function roomPose(focus: number, aspect: number, pos: THREE.Vector3, look: THREE.Vector3) {
  if (focus < 0 || focus >= SLOTS.length) {
    // Assez de recul pour voir les trois écrans, quelle que soit la forme de la fenêtre.
    const z = Math.max(9.2, 7.7 / (Math.tan((ROOM_FOV * Math.PI) / 360) * aspect))
    pos.set(0, 1.75, z)
    look.set(0, 1.25, 0)
    return
  }
  const s = SLOTS[focus]
  const d = focus === 0 ? 6.4 : 5.6
  pos.set(s.x + Math.sin(s.rot) * d, 1.95, s.z + Math.cos(s.rot) * d)
  look.set(s.x, s.y - 0.7, s.z)
}

/**
 * Une seule caméra pour les deux décors.
 *  - Carrousel : fixe, calée sur le DOM (FOV 30, z = 10).
 *  - Première moitié de la transition : elle avance vers l'écran actif jusqu'à ce qu'il déborde du cadre.
 *  - Seconde moitié : elle finit d'avancer dans la salle, puis suit la vue choisie, avec un léger parallax (ressort).
 */
export function CameraRig() {
  const s = useRef({
    pos: new THREE.Vector3(0, 1.75, 9.5),
    look: new THREE.Vector3(0, 1.25, 0),
    px: 0,
    py: 0,
    vx: 0,
    vy: 0,
    init: false,
    mode: 'flat' as 'flat' | 'dolly' | 'room',
  })

  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera
    const c = s.current
    const e = roomEase()
    const dt = Math.min(delta, 0.05)

    if (e <= 0) {
      if (c.mode !== 'flat') {
        c.mode = 'flat'
        c.init = false
        cam.position.set(0, 0, CAMERA_Z)
        cam.rotation.set(0, 0, 0)
        cam.fov = FOV
        cam.updateProjectionMatrix()
      }
      return
    }

    if (e < 0.5) {
      // Avancée vers l'écran actif du carrousel.
      c.mode = 'dolly'
      c.init = false
      const a = e / 0.5
      const { wpp, vw, vh, screen } = metrics
      const { offset } = workState()
      const sx = metrics.ready ? (screen.cx - vw / 2) * wpp : 0
      const sy = metrics.ready ? -(offset + screen.cy - vh / 2) * wpp : 0
      const fill = metrics.ready ? (screen.h * wpp) / 2 / Math.tan((FOV * Math.PI) / 360) : 3
      cam.position.set(sx * a, sy * a, CAMERA_Z + (fill * 0.42 - CAMERA_Z) * a)
      cam.rotation.set(0, 0, 0)
      if (cam.fov !== FOV) {
        cam.fov = FOV
        cam.updateProjectionMatrix()
      }
      return
    }

    // Dans la salle.
    c.mode = 'room'
    const b = (e - 0.5) / 0.5
    const { roomFocus, pointer } = ui.getState()
    roomPose(roomFocus, state.size.width / state.size.height, v.a, v.b)
    if (!c.init) {
      c.init = true
      c.pos.copy(v.a)
      c.look.copy(v.b)
    }
    // Glissement vers la vue choisie (≈ 1 s), interruptible : on repart toujours de la position courante.
    const k = 1 - Math.exp(-dt * 4.2)
    c.pos.lerp(v.a, k)
    c.look.lerp(v.b, k)

    // Parallax : ressort amorti vers la position du curseur.
    c.vx += (-34 * (c.px - pointer.nx) - 9 * c.vx) * dt
    c.vy += (-34 * (c.py - pointer.ny) - 9 * c.vy) * dt
    c.px += c.vx * dt
    c.py += c.vy * dt

    v.pos.copy(c.pos)
    v.pos.z += (1 - b) * 6 // fin de l'avancée d'entrée
    v.pos.x += c.px * 0.45
    v.pos.y -= c.py * 0.22
    cam.position.copy(v.pos)
    v.look.copy(c.look)
    v.look.x += c.px * 0.12
    cam.lookAt(v.look)
    if (cam.fov !== ROOM_FOV) {
      cam.fov = ROOM_FOV
      cam.updateProjectionMatrix()
    }
  })

  return null
}
