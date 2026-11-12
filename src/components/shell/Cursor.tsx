'use client'

import { useEffect, useRef } from 'react'
import { addFrame } from '@/lib/loop'
import { ui } from '@/lib/store'
import { finePointerQuery, reducedMotionQuery } from '@/lib/motion'

type Mode = 'dot' | 'frame' | 'label'

/**
 * Curseur personnalisé (souris uniquement, désactivé en reduced motion) :
 * carré de 10 px qui suit avec un léger retard ; cadre de 28 px sur un lien ;
 * étiquette (« OUVRIR ») sur un élément `data-cursor="Texte"`.
 * Publie aussi la position du pointeur dans le store (lue par la 3D).
 */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia(finePointerQuery)
    const reduced = window.matchMedia(reducedMotionQuery)
    const node = el.current!
    let active = false
    let visible = false
    let tx = -100
    let ty = -100
    let x = -100
    let y = -100
    let mode: Mode = 'dot'

    const setMode = (next: Mode, text = '') => {
      if (next === mode && (next !== 'label' || label.current!.textContent === text)) return
      mode = next
      node.dataset.mode = next
      label.current!.textContent = text
    }

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = (e.clientY / window.innerHeight) * 2 - 1
      ui.setState({ pointer: { x: e.clientX, y: e.clientY, nx, ny } })
      if (!active || e.pointerType !== 'mouse') return
      tx = e.clientX
      ty = e.clientY
      if (!visible) {
        visible = true
        x = tx
        y = ty
        node.style.opacity = '1'
      }
    }
    const onOver = (e: PointerEvent) => {
      if (!active) return
      const t = e.target as Element
      const labelled = t.closest<HTMLElement>('[data-cursor]')
      if (labelled) return setMode('label', labelled.dataset.cursor ?? '')
      if (t.closest('a, button, [role="button"], label, summary')) return setMode('frame')
      setMode('dot')
    }
    const onLeave = () => {
      visible = false
      node.style.opacity = '0'
    }

    const enable = () => {
      active = fine.matches && !reduced.matches
      document.documentElement.classList.toggle('has-cursor', active)
      if (!active) onLeave()
    }
    enable()
    fine.addEventListener('change', enable)
    reduced.addEventListener('change', enable)
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)

    const stop = addFrame(() => {
      if (!active || !visible) return
      // Interpolation ~0,25 par frame : léger retard, jamais en 1:1 sec.
      x += (tx - x) * 0.25
      y += (ty - y) * 0.25
      node.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }, 10)

    return () => {
      stop()
      fine.removeEventListener('change', enable)
      reduced.removeEventListener('change', enable)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div
      ref={el}
      aria-hidden
      data-mode="dot"
      className="cursor pointer-events-none fixed left-0 top-0 z-[200] opacity-0 transition-opacity duration-150"
    >
      <span className="cursor-box">
        <span ref={label} className="ui text-accent-ink" />
      </span>
    </div>
  )
}
