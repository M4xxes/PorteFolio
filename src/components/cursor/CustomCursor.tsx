'use client'

import { useEffect, useRef, useState } from 'react'
import { useIsTouch } from '@/hooks/useIsTouch'

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const isTouch = useIsTouch()
  const [isPointer, setIsPointer] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isTouch) return
    document.documentElement.classList.add('has-custom-cursor')

    const ring = { x: 0, y: 0 }
    let raf = 0

    const handleMove = (e: PointerEvent) => {
      setVisible(true)
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
      }
      ring.x = e.clientX
      ring.y = e.clientY

      const target = e.target as HTMLElement
      setIsPointer(!!target.closest('a, button, [data-cursor-hover]'))
    }

    const animateRing = () => {
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0)`
      }
      raf = requestAnimationFrame(animateRing)
    }

    const handleLeave = () => setVisible(false)

    window.addEventListener('pointermove', handleMove)
    document.addEventListener('mouseleave', handleLeave)
    raf = requestAnimationFrame(animateRing)

    return () => {
      document.documentElement.classList.remove('has-custom-cursor')
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('mouseleave', handleLeave)
      cancelAnimationFrame(raf)
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[999]"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.3s ease' }}
      aria-hidden
    >
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
      />
      <div
        ref={ringRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,border-color] duration-200 ease-out"
        style={{
          width: isPointer ? 56 : 32,
          height: isPointer ? 56 : 32,
          borderColor: isPointer ? 'var(--accent)' : 'rgba(245,245,245,0.4)',
        }}
      />
    </div>
  )
}
