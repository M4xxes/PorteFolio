'use client'

import { useEffect, useRef } from 'react'

const INK = 'rgba(21, 19, 17, 0.16)'
const ORANGE = '224, 96, 42'
const IDLE_MS = 2500

/**
 * Champ génératif du Hero : une grille de traits d'encre orientés par un « bruit » lent.
 * Autour du pointeur (souris ou doigt), les traits s'enroulent, s'allongent et passent à l'orange.
 * Sans interaction, un pointeur fantôme parcourt lentement la surface (utile sur mobile).
 * Rendu suspendu hors écran / onglet caché ; image fixe si reduced-motion.
 */
export function InkField({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let width = 0
    let height = 0
    let spacing = 30
    let radius = 190
    let raf = 0
    let visible = true
    let lastInput = -Infinity
    // Position lissée du point d'influence et cible (pointeur réel ou fantôme)
    const p = { x: -9999, y: -9999, tx: -9999, ty: -9999, strength: 0 }

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      spacing = width < 640 ? 24 : 30
      radius = width < 640 ? 110 : 190
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (t: number) => {
      // Pointeur fantôme quand personne n'interagit (trajectoire de Lissajous)
      if (t - lastInput > IDLE_MS) {
        p.tx = width * (0.62 + 0.26 * Math.sin(t * 0.00023))
        p.ty = height * (0.55 + 0.3 * Math.sin(t * 0.00031 + 1.3))
      }
      p.x += (p.tx - p.x) * 0.08
      p.y += (p.ty - p.y) * 0.08
      p.strength += (1 - p.strength) * 0.05

      ctx.clearRect(0, 0, width, height)
      ctx.lineCap = 'round'
      ctx.strokeStyle = INK
      ctx.lineWidth = 1.1
      ctx.beginPath()
      const hot: [number, number, number, number, number][] = []

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const base = Math.sin(x * 0.0042 + t * 0.00018) * 1.3 + Math.cos(y * 0.0051 - t * 0.00014) * 1.3
          const dx = x - p.x
          const dy = y - p.y
          const infl = Math.max(0, 1 - Math.hypot(dx, dy) / radius) * p.strength
          const swirl = Math.atan2(dy, dx) + Math.PI / 2
          const angle = base + (swirl - base) * infl
          const len = 6 + infl * 16
          const cx = Math.cos(angle) * len * 0.5
          const cy = Math.sin(angle) * len * 0.5
          if (infl > 0.04) {
            hot.push([x - cx, y - cy, x + cx, y + cy, infl])
          } else {
            ctx.moveTo(x - cx, y - cy)
            ctx.lineTo(x + cx, y + cy)
          }
        }
      }
      ctx.stroke()

      for (const [x1, y1, x2, y2, infl] of hot) {
        ctx.strokeStyle = `rgba(${ORANGE}, ${0.25 + infl * 0.75})`
        ctx.lineWidth = 1.1 + infl * 1.6
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    }

    const loop = (t: number) => {
      draw(t)
      raf = visible && !document.hidden ? requestAnimationFrame(loop) : 0
    }
    const start = () => {
      if (!raf && !reduced && visible && !document.hidden) raf = requestAnimationFrame(loop)
    }

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      p.tx = e.clientX - rect.left
      p.ty = e.clientY - rect.top
      lastInput = performance.now()
      if (reduced) {
        p.x = p.tx
        p.y = p.ty
        p.strength = 1
        draw(0)
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    const ro = new ResizeObserver(() => {
      resize()
      if (reduced || !raf) draw(performance.now())
    })
    const onVisibility = () => start()

    resize()
    if (reduced) {
      p.x = p.tx = width * 0.7
      p.y = p.ty = height * 0.55
      p.strength = 1
      draw(0)
    } else {
      p.x = width * 0.7
      p.y = height * 0.55
      start()
    }
    io.observe(canvas)
    ro.observe(canvas)
    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('pointerdown', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden className={`pointer-events-none h-full w-full ${className}`} />
}
