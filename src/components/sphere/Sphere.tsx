'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import * as THREE from 'three'
import gsap from 'gsap'
import { categoryLabels, projects } from '@/lib/data/projects'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { reducedMotionQuery } from '@/lib/motion'
import { EYE_VH, DISS_VH } from '@/components/intro/timing'
import { setScrollGuard } from '@/components/shell/ScrollEngine'
import { app } from './state'

/* Sphère de projets : plans 16:9 (ratio réel de chaque média, jamais recadré) répartis en sphère de Fibonacci,
   toujours face à la caméra. Rotation au drag avec inertie (friction 0,94, lissage 0,11), molette, pincement,
   auto-rotation inclinée de 23° jusqu'à la première interaction. Valeurs du brief « Gallery », section 5. */

const FRICTION = 0.94
const SMOOTH = 0.11
const AUTO_SPIN = 0.001
const TILT = THREE.MathUtils.degToRad(23)
const EXPAND_PUSH = 1.8
const EXPAND_FADE = 0.1
const EXPAND_HEIGHT_VH = 0.7
const CAM_Z = 12
const FOV = 60
const N = projects.length

type Phase = 'pre' | 'circle' | 'collapse' | 'explode' | 'sphere'

type Plane = {
  i: number
  mesh: THREE.Mesh
  mat: THREE.MeshBasicMaterial
  aspect: number
  base: THREE.Vector3
  video: HTMLVideoElement | null
  hasFrame: boolean
  playing: boolean
  front: boolean
  // intro
  appear: { o: number; s: number }
  collapse: { v: number }
  stack: THREE.Vector3
  circlePos: THREE.Vector3
  explodeFrom: THREE.Vector3
}

const pad3 = (n: number) => String(Math.round(n)).padStart(3, '0')

export default function Sphere() {
  const pathname = usePathname()
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  const routerRef = useRef(router)
  const pathnameRef = useRef(pathname)
  useEffect(() => {
    routerRef.current = router
    pathnameRef.current = pathname
  }, [router, pathname])

  // Visible seulement sur l'accueil ; l'état (rotation, zoom) est conservé en changeant de page.
  useEffect(() => {
    root.current?.setAttribute('data-active', String(pathname === '/'))
  }, [pathname])

  useEffect(() => {
    const el = root.current!
    const q = <T extends HTMLElement>(sel: string) => el.querySelector<T>(sel)!
    const canvas = q<HTMLCanvasElement>('canvas')
    const zone = q<HTMLDivElement>('.sp-zone')
    const word = q<HTMLElement>('.sp-word')
    const sides = Array.from(el.querySelectorAll<HTMLElement>('.sp-side > span'))
    const count = q<HTMLElement>('.sp-count')
    const countText = q<HTMLElement>('.sp-count > span')
    const hint = q<HTMLElement>('.sp-hint')
    const capT = q<HTMLElement>('.sp-cap-t > span')
    const capC = q<HTMLElement>('.sp-cap-c > span')
    const cursorEl = q<HTMLElement>('.sp-cursor')
    const openBtn = q<HTMLButtonElement>('.sp-open')

    const reduced = window.matchMedia(reducedMotionQuery).matches
    const coarse = window.matchMedia('(pointer: coarse)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse, powerPreference: 'high-performance' })
    } catch (e) {
      console.warn('WebGL indisponible : sphère désactivée.', e)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 100)
    camera.position.set(0, 0, CAM_Z)

    /* ------------------------------------------------------------ mise en page */
    const L = { vw: 1, vh: 1, k: 1, cx: 0, cy: 0, R: 210, size: 170, center: 250, circleR: 170, circleSize: 110, phone: false }
    const layout = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const mid = vw >= 1025 && vw <= 1440
      const phone = vw <= 640
      L.vw = vw
      L.vh = vh
      L.phone = phone
      L.k = (2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2))) / vh
      L.size = phone ? 130 : mid ? 190 : 240
      L.R = phone ? Math.max(60, Math.min(120, vw / 2 - 24 - L.size / 2)) : mid ? 190 : 250
      L.center = (L.size * 120) / 82
      L.circleR = (phone ? 0.75 : 1) * 190
      L.circleSize = L.size * 0.7
      L.cx = vw / 2
      L.cy = vw <= 760 ? vh * 0.27 : vw <= 1100 ? vh * 0.42 : vh / 2
      renderer.setSize(vw, vh, false)
      camera.aspect = vw / vh
      camera.updateProjectionMatrix()
      const zr = L.R + L.size * 0.85
      zone.style.setProperty('--zr', `${zr}px`)
      zone.style.setProperty('--zx', `${L.cx}px`)
      zone.style.setProperty('--zy', `${L.cy}px`)
      word.style.left = `${L.cx}px`
      word.style.top = `${L.cy}px`
      count.style.left = `${L.cx}px`
    }

    /* ------------------------------------------------------------ plans */
    const geometry = new THREE.PlaneGeometry(1, 1)
    const loader = new THREE.TextureLoader()
    const planes: Plane[] = projects.map((p, i) => {
      const y = i * (2 / N) - 1 + 1 / N
      const r = Math.sqrt(1 - y * y)
      const a = Math.PI * (3 - Math.sqrt(5)) * i
      const mat = new THREE.MeshBasicMaterial({ color: 0x1b1b1d, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0 })
      const mesh = new THREE.Mesh(geometry, mat)
      mesh.visible = false
      scene.add(mesh)
      const w = p.video?.width ?? p.cover.width
      const h = p.video?.height ?? p.cover.height
      return {
        i,
        mesh,
        mat,
        aspect: w / h,
        base: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r),
        video: null,
        hasFrame: false,
        playing: false,
        front: true,
        appear: { o: 0, s: 0 },
        collapse: { v: 0 },
        stack: new THREE.Vector3(0, 0, i * 1.5),
        circlePos: new THREE.Vector3(),
        explodeFrom: new THREE.Vector3(),
      }
    })

    const poster = (p: Plane) => {
      const pr = projects[p.i]
      loader.load(pr.video?.poster ?? pr.cover.src, (t) => {
        t.colorSpace = THREE.SRGBColorSpace
        t.minFilter = THREE.LinearFilter
        t.generateMipmaps = false
        if (!p.mat.map) {
          p.mat.map = t
          p.mat.color.set(0xffffff)
          p.mat.needsUpdate = true
        }
        p.hasFrame = true
      }, undefined, (err) => console.warn('Sphère : image introuvable', err))
    }
    planes.forEach(poster)

    const startVideo = (p: Plane) => {
      const pr = projects[p.i]
      if (!pr.video || p.video || reduced) return
      const v = document.createElement('video')
      v.crossOrigin = 'anonymous'
      v.muted = true
      v.loop = true
      v.playsInline = true
      v.setAttribute('playsinline', '')
      v.setAttribute('webkit-playsinline', '')
      v.preload = 'metadata'
      v.src = pr.video.src
      p.video = v
      const swap = () => {
        if (p.mat.map && (p.mat.map as THREE.VideoTexture).isVideoTexture) return
        const t = new THREE.VideoTexture(v)
        t.colorSpace = THREE.SRGBColorSpace
        t.minFilter = THREE.LinearFilter
        t.generateMipmaps = false
        p.mat.map = t
        p.mat.color.set(0xffffff)
        p.mat.needsUpdate = true
      }
      v.addEventListener('playing', swap, { once: true })
      v.play().catch(() => {})
      p.playing = true
    }
    const setPlaying = (p: Plane, on: boolean) => {
      if (!p.video || p.playing === on) return
      p.playing = on
      if (on) p.video.play().catch(() => {})
      else p.video.pause()
    }

    /* ------------------------------------------------------------ état */
    const quat = new THREE.Quaternion()
    const vel = { x: 0, y: 0 }
    const ang = { tx: 0, ty: 0, sx: 0, sy: 0 }
    let interacted = false
    let phase: Phase = 'pre'
    const circle = { angle: 0, spin: 0.5, mul: { v: 1 } }
    const explode = { v: 0 }
    const zoomT = { v: 0 }
    const leave = { v: 0 }
    let zoomIdx = -1
    let hover = -1
    let live = false // l'œil est dissous : la sphère peut vivre
    let alive = true
    let hintShown = false
    const tmp = new THREE.Vector3()
    const posV = new THREE.Vector3()
    const qA = new THREE.Quaternion()
    const qB = new THREE.Quaternion()
    const axisY = new THREE.Vector3(0, 1, 0)
    const axisX = new THREE.Vector3(1, 0, 0)
    const tilt = new THREE.Vector3(Math.sin(TILT), Math.cos(TILT), 0).normalize()

    const pin = () => (reduced ? 0.9 : EYE_VH - 0.05) * window.innerHeight
    const visibleNow = () => pathnameRef.current === '/' && ui.getState().scroll.y >= (reduced ? 0.5 : EYE_VH - DISS_VH - 0.05) * window.innerHeight

    /* ------------------------------------------------------------ légende */
    let capIndex = -1
    const setCaption = (i: number) => {
      if (i === capIndex) return
      capIndex = i
      gsap.killTweensOf([capT, capC])
      const fill = () => {
        if (i >= 0) {
          capT.textContent = projects[i].title
          capC.textContent = categoryLabels[projects[i].category]
          gsap.fromTo([capT, capC], { yPercent: 110 }, { yPercent: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 })
        }
      }
      gsap.to([capT, capC], { yPercent: -110, duration: 0.25, ease: 'power2.in', onComplete: fill })
    }

    /* ------------------------------------------------------------ rendu */
    const sphereBase = new THREE.Vector3()
    const place = () => {
      const offX = L.cx - L.vw / 2
      const offY = L.vh / 2 - L.cy
      const screenC = new THREE.Vector3(L.vw / 2 - L.cx, L.cy - L.vh / 2, 0)
      for (const p of planes) {
        sphereBase.copy(p.base).applyQuaternion(quat).multiplyScalar(L.R)
        let size = L.size
        const o = { v: 1 }
        const pos = posV
        if (phase === 'pre') {
          o.v = 0
        } else if (phase === 'circle') {
          pos.copy(p.circlePos)
          size = L.circleSize * p.appear.s
          o.v = p.appear.o
        } else if (phase === 'collapse') {
          pos.copy(p.circlePos).lerp(p.stack, p.collapse.v)
          size = THREE.MathUtils.lerp(L.circleSize, L.center, p.collapse.v)
        } else if (phase === 'explode') {
          const e = explode.v
          pos.copy(p.explodeFrom).addScaledVector(tmp.copy(sphereBase).sub(p.explodeFrom), e * (1 + 0.1 * Math.sin(Math.PI * e)))
          size = THREE.MathUtils.lerp(L.center, L.size, e)
        } else {
          pos.copy(sphereBase)
        }
        let w: number
        let h: number
        const dims = (s: number) => (p.aspect >= 1 ? [s, s / p.aspect] : [s * p.aspect, s])
        ;[w, h] = dims(size)

        if (phase === 'sphere' && zoomT.v > 0 && zoomIdx >= 0) {
          const e = zoomT.v
          if (p.i === zoomIdx) {
            let zh = L.vh * EXPAND_HEIGHT_VH
            let zw = zh * p.aspect
            const maxW = L.vw - 16
            if (zw > maxW) {
              zw = maxW
              zh = zw / p.aspect
            }
            pos.lerp(screenC, e)
            w = THREE.MathUtils.lerp(w, zw, e)
            h = THREE.MathUtils.lerp(h, zh, e)
            p.mesh.renderOrder = 10
          } else {
            pos.multiplyScalar(1 + (EXPAND_PUSH - 1) * e)
            o.v = 1 - (1 - EXPAND_FADE) * e
            p.mesh.renderOrder = 0
          }
        } else p.mesh.renderOrder = 0

        let opacity = o.v * (1 - leave.v)
        if (leave.v > 0 && p.i === zoomIdx) {
          w *= 1 + 0.08 * leave.v
          h *= 1 + 0.08 * leave.v
        }
        if (phase === 'pre' || opacity < 0.01 || w < 0.5) {
          p.mesh.visible = false
          continue
        }
        p.mesh.visible = true
        p.mat.opacity = opacity
        p.mesh.scale.set(w * L.k, h * L.k, 1)
        p.mesh.position.set((pos.x + offX) * L.k, (pos.y + offY) * L.k, pos.z * L.k)
      }
    }

    const step = () => {
      // Rotation : vitesse → angle visé → angle lissé, appliqué en lacet (Y monde) puis tangage (X monde).
      vel.x *= FRICTION
      vel.y *= FRICTION
      ang.tx += vel.x
      ang.ty += vel.y
      const dx = (ang.tx - ang.sx) * SMOOTH
      const dy = (ang.ty - ang.sy) * SMOOTH
      ang.sx += dx
      ang.sy += dy
      if (dx !== 0) quat.premultiply(qA.setFromAxisAngle(axisY, dx))
      if (dy !== 0) quat.premultiply(qB.setFromAxisAngle(axisX, dy))
      if (!interacted && !reduced && phase === 'sphere' && zoomIdx < 0) quat.premultiply(qA.setFromAxisAngle(tilt, AUTO_SPIN))
      quat.normalize()
    }

    /* ------------------------------------------------------------ survol et curseur */
    const ray = new THREE.Raycaster()
    const ptr = new THREE.Vector2()
    const mouse = { x: -1000, y: -1000, moved: false, over: false }
    const pick = () => {
      ptr.set((mouse.x / L.vw) * 2 - 1, -(mouse.y / L.vh) * 2 + 1)
      ray.setFromCamera(ptr, camera)
      scene.updateMatrixWorld()
      const hits = ray.intersectObjects(
        planes.filter((p) => p.mesh.visible && p.mat.opacity > 0.3).map((p) => p.mesh),
        false
      )
      if (!hits.length) return -1
      // Le plan zoomé est toujours le premier ; sinon le plus proche de la caméra.
      return planes.find((p) => p.mesh === hits[0].object)!.i
    }
    const quickX = gsap.quickTo(cursorEl, 'x', { duration: 0.5, ease: 'power3.out' })
    const quickY = gsap.quickTo(cursorEl, 'y', { duration: 0.5, ease: 'power3.out' })
    let cursorOn = false
    const setCursorLabel = (on: boolean) => {
      if (on === cursorOn) return
      cursorOn = on
      gsap.to(cursorEl, { opacity: on ? 1 : 0, scale: on ? 1 : 0.6, duration: 0.6, ease: 'power4.out', overwrite: 'auto' })
    }

    let dragging = false
    const updateHover = () => {
      if (phase !== 'sphere' || !live) return
      const h = mouse.over ? pick() : -1
      if (h !== hover) {
        hover = h
        if (zoomIdx < 0) setCaption(h)
      }
      const dist = Math.hypot(mouse.x - L.cx, mouse.y - L.cy)
      zone.style.cursor = dragging ? 'grabbing' : hover >= 0 ? 'pointer' : dist < L.R + 40 ? 'grab' : 'default'
      setCursorLabel(zoomIdx >= 0 && hover === zoomIdx && !leaving)
    }

    /* ------------------------------------------------------------ zoom, clic, ouverture */
    let leaving = false
    const zoom = (i: number) => {
      zoomIdx = i
      app.zoomed = true
      document.documentElement.dataset.sphereZoom = '1'
      zone.classList.add('full')
      gsap.to(zoomT, { v: 1, duration: 0.8, ease: 'power4.out', overwrite: true })
      setCaption(i)
      gsap.to(openBtn, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', delay: 0.2 })
      openBtn.style.pointerEvents = 'auto'
    }
    const collapse = () => {
      if (zoomIdx < 0 || leaving) return
      gsap.to(zoomT, {
        v: 0,
        duration: 0.8,
        ease: 'power4.out',
        overwrite: true,
        onComplete: () => {
          zoomIdx = -1
          app.zoomed = false
          delete document.documentElement.dataset.sphereZoom
          zone.classList.remove('full')
        },
      })
      gsap.to(openBtn, { opacity: 0, y: 8, duration: 0.3 })
      openBtn.style.pointerEvents = 'none'
      setCursorLabel(false)
      setCaption(hover)
    }
    const open = () => {
      if (zoomIdx < 0 || leaving) return
      leaving = true
      setCursorLabel(false)
      gsap.to(openBtn, { opacity: 0, duration: 0.2 })
      gsap.to(leave, {
        v: 1,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => routerRef.current.push(`/projets/${projects[zoomIdx].id}`),
      })
    }
    openBtn.onclick = (e) => {
      e.stopPropagation()
      open()
    }

    const onClick = (x: number, y: number) => {
      if (phase !== 'sphere' || !live) return
      mouse.x = x
      mouse.y = y
      const h = pick()
      if (zoomIdx < 0) {
        if (h >= 0) zoom(h)
      } else if (h === zoomIdx) open()
      else collapse()
    }

    /* ------------------------------------------------------------ entrées */
    const pointers = new Map<number, { x: number; y: number }>()
    let moved = 0
    let path = 0
    let pinchDist = 0
    const onDown = (e: PointerEvent) => {
      if (phase !== 'sphere') return
      zone.setPointerCapture?.(e.pointerId)
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      interacted = true
      moved = 0
      path = 0
      dragging = pointers.size === 1 && zoomIdx < 0
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y)
      }
      if (!hintShown) return
    }
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.over = true
      const prev = pointers.get(e.pointerId)
      if (!prev || phase !== 'sphere') {
        quickX(e.clientX + 14)
        quickY(e.clientY + 14)
        return
      }
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      prev.x = e.clientX
      prev.y = e.clientY
      moved += Math.hypot(dx, dy)
      path += Math.abs(dx) + Math.abs(dy)
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        vel.x += (pinchDist - d) * 0.0002
        pinchDist = d
      } else if (zoomIdx < 0) {
        vel.x += dx * 0.001
        vel.y += dy * 0.001
      }
      quickX(e.clientX + 14)
      quickY(e.clientY + 14)
    }
    const onUp = (e: PointerEvent) => {
      const had = pointers.delete(e.pointerId)
      dragging = false
      if (had && pointers.size === 0 && moved < 6 && path < 10) onClick(e.clientX, e.clientY)
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (phase !== 'sphere' || zoomIdx >= 0) return
      interacted = true
      vel.x += e.deltaY * 0.0002
    }
    const onLeave = () => {
      mouse.over = false
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapse()
    }
    const track = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    zone.addEventListener('pointerdown', onDown)
    zone.addEventListener('pointermove', onMove)
    zone.addEventListener('pointerup', onUp)
    zone.addEventListener('pointercancel', onUp)
    zone.addEventListener('pointerleave', onLeave)
    zone.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointermove', track, { passive: true })

    // La molette remonte vers l'œil, sauf au-dessus de la sphère (elle la fait tourner) et quand une vignette est zoomée.
    setScrollGuard((dy) => {
      if (ui.getState().scroll.y < pin()) return true
      return dy < 0 && zoomIdx < 0 && pathnameRef.current === '/'
    })

    /* ------------------------------------------------------------ intro */
    const sleep = (s: number) => new Promise<void>((r) => gsap.delayedCall(s, r))
    const wait = <T extends gsap.core.Animation>(t: T) => new Promise<void>((r) => t.eventCallback('onComplete', r))

    const finishToSphere = () => {
      phase = 'sphere'
      app.introDone = true
      zone.classList.add('ready')
    }

    const playIntro = async () => {
      phase = 'pre'
      gsap.set([word, count], { opacity: 0 })
      gsap.set(sides, { yPercent: 100 })
      gsap.to(word, { opacity: 1, duration: 0.6, delay: 0.2 })
      gsap.fromTo(sides, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07, delay: 0.5 })
      gsap.fromTo(count, { yPercent: 100, opacity: 1 }, { yPercent: 0, duration: 0.75, ease: 'power4.out', delay: 0.5 })
      const c = { v: 0 }
      const upd = () => (countText.textContent = pad3(c.v))
      upd()
      gsap.delayedCall(0.2, () => planes.forEach(startVideo))
      const t0 = performance.now()
      let shown = -1
      const poll = gsap.ticker.add(() => {
        const share = Math.round((planes.filter((p) => p.hasFrame).length / N) * 99)
        if (share !== shown) {
          shown = share
          gsap.to(c, { v: share, duration: 0.5, ease: 'power1.out', onUpdate: upd, overwrite: true })
        }
      })
      await sleep(2)
      while (alive && planes.some((p) => !p.hasFrame) && performance.now() - t0 < 8000) await sleep(0.2)
      gsap.ticker.remove(poll)
      if (!alive) return
      await wait(gsap.to(c, { v: 100, duration: 0.5, ease: 'power1.out', onUpdate: upd, overwrite: true }))
      gsap.to(count, { yPercent: -100, opacity: 0, duration: 0.5, ease: 'power4.in' })

      // Cercle de plans qui tourne
      phase = 'circle'
      planes.forEach((p) => {
        p.appear.o = 0
        p.appear.s = 0.01
      })
      const circleTl = gsap.timeline()
      planes.forEach((p, i) => {
        circleTl.to(p.appear, { o: 1, duration: 1, ease: 'power3.out' }, i * 0.1)
        circleTl.to(p.appear, { s: 1, duration: 1, ease: 'back.out(1.7)' }, i * 0.1)
      })
      const spin = gsap.ticker.add(() => {
        circle.angle += THREE.MathUtils.degToRad(circle.spin) * circle.mul.v
        planes.forEach((p, i) => {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / N + circle.angle
          p.circlePos.set(Math.cos(a) * L.circleR, Math.sin(a) * L.circleR, 0)
        })
      })
      await sleep(1.3)
      await wait(gsap.to(circle.mul, { v: 7.3, duration: 1, ease: 'power2.in' }))
      await sleep(0.8)
      if (!alive) return

      // Effondrement au centre
      gsap.to(word, { opacity: 0, duration: 0.75, ease: 'power2.inOut' })
      gsap.to(sides, { yPercent: -110, duration: 0.7, ease: 'power3.in' })
      phase = 'collapse'
      const colTl = gsap.timeline()
      planes.forEach((p, i) => colTl.to(p.collapse, { v: 1, duration: 1.25, ease: 'power2.inOut' }, i * 0.05))
      await wait(colTl)
      gsap.ticker.remove(spin)
      await sleep(0.2)
      if (!alive) return

      // Explosion en sphère
      planes.forEach((p) => p.explodeFrom.copy(p.stack))
      phase = 'explode'
      explode.v = 0
      gsap.fromTo(sides, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.07 })
      gsap.to(hint, { opacity: 1, duration: 0.9, delay: 0.6 })
      hintShown = true
      await wait(gsap.to(explode, { v: 1, duration: 1, ease: 'power3.out' }))
      finishToSphere()
    }

    let started = false
    const start = () => {
      if (started) return
      started = true
      live = true
      if (reduced || app.introDone) {
        gsap.set(sides, { yPercent: 0 })
        gsap.set(word, { opacity: 0 })
        planes.forEach(startVideo)
        finishToSphere()
        if (!interacted && !reduced) gsap.set(hint, { opacity: 1 })
        hintShown = true
      } else playIntro()
    }
    const checkStart = () => {
      if (!started && pathnameRef.current === '/' && ui.getState().scroll.y >= pin()) start()
    }
    const unsub = ui.subscribe(checkStart)
    gsap.delayedCall(0, checkStart)

    /* ------------------------------------------------------------ boucle */
    let lastPause = 0
    layout()
    const ro = new ResizeObserver(() => layout())
    ro.observe(document.documentElement)

    const stop = addFrame((time) => {
      const hidden = document.hidden
      const show = !hidden && visibleNow()
      if (hint.style.opacity !== '' && interacted && hintShown) {
        gsap.to(hint, { opacity: 0, duration: 0.6 })
        hintShown = false
      }
      if (leave.v > 0 && pathnameRef.current !== '/') {
        // Page projet : la sphère est cachée ; on remet tout à plat pour le retour.
        zoomT.v = 0
        zoomIdx = -1
        leaving = false
        leave.v = 0
        app.zoomed = false
        delete document.documentElement.dataset.sphereZoom
        hover = -1
        setCaption(-1)
        zone.classList.remove('full')
        gsap.set(openBtn, { opacity: 0 })
        setCursorLabel(false)
      }
      // Pause des vidéos de l'hémisphère arrière (et de toutes si la sphère n'est pas à l'écran, ou pendant un zoom).
      if (time - lastPause > 300) {
        lastPause = time
        for (const p of planes) {
          sphereBase.copy(p.base).applyQuaternion(quat)
          const z = sphereBase.z / sphereBase.length()
          if (p.front && z < -0.25) p.front = false
          else if (!p.front && z > -0.1) p.front = true
          const want = show && (zoomIdx >= 0 ? p.i === zoomIdx : p.front)
          setPlaying(p, want)
        }
      }
      if (!show) return
      step()
      place()
      updateHover()
      renderer.render(scene, camera)
    }, 25)

    // Retour d'une page projet : la sphère se montre à nouveau, état conservé.
    return () => {
      alive = false
      stop()
      unsub()
      ro.disconnect()
      setScrollGuard(null)
      zone.removeEventListener('pointerdown', onDown)
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerup', onUp)
      zone.removeEventListener('pointercancel', onUp)
      zone.removeEventListener('pointerleave', onLeave)
      zone.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointermove', track)
      for (const p of planes) {
        p.video?.pause()
        p.video?.removeAttribute('src')
        p.video?.load()
        p.mat.map?.dispose()
        p.mat.dispose()
      }
      geometry.dispose()
      renderer.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={root} className="sp" data-active={pathname === '/'}>
      <canvas aria-hidden />
      <div className="sp-zone" data-lenis-prevent />
      <div className="sp-word" aria-hidden>
        MP
      </div>
      <div className="sp-side l" aria-hidden>
        <span>Maxime Pero</span>
      </div>
      <div className="sp-side r" aria-hidden>
        <span>Développeur web</span>
      </div>
      <div className="sp-count" aria-hidden>
        <span>001</span>
      </div>
      <div className="sp-hint" aria-hidden>
        DRAG TO EXPLORE
      </div>
      <div className="sp-caption" aria-live="polite">
        <div className="sp-cap-t">
          <span />
        </div>
        <div className="sp-cap-c">
          <span />
        </div>
      </div>
      <div className="sp-cursor" aria-hidden>
        Voir le projet
      </div>
      <button type="button" className="sp-open">
        Voir le projet
      </button>
    </div>
  )
}
