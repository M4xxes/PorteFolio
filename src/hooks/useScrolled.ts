import { useState, useEffect } from 'react'

// Retourne true dès que la page a défilé au-delà de `threshold` pixels
export function useScrolled(threshold = 50): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])

  return scrolled
}
