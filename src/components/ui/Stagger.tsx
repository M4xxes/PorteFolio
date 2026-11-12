'use client'

import { useEffect, useRef } from 'react'

/**
 * Révèle ses enfants en cascade (40 ms) à l'entrée dans l'écran.
 * L'état masqué n'existe qu'avec JavaScript (classe `js` sur <html>) : sans JS, tout est visible.
 */
export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLUListElement>(null)
  useEffect(() => {
    const el = ref.current!
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in')
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -15% 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <ul ref={ref} className={`stagger ${className ?? ''}`}>
      {children}
    </ul>
  )
}
