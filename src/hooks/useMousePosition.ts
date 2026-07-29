'use client'

import { useEffect, useRef } from 'react'

/** Tracks raw viewport mouse position in a ref (no re-renders) for perf-sensitive consumers like R3F scenes. */
export function useMousePosition() {
  const position = useRef({ x: 0, y: 0, nx: 0, ny: 0 })

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      position.current.x = e.clientX
      position.current.y = e.clientY
      position.current.nx = (e.clientX / window.innerWidth) * 2 - 1
      position.current.ny = -(e.clientY / window.innerHeight) * 2 + 1
    }
    window.addEventListener('pointermove', handleMove)
    return () => window.removeEventListener('pointermove', handleMove)
  }, [])

  return position
}
