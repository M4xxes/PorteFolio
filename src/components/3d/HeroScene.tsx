'use client'

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { BlobMesh } from './BlobMesh'
import { ParticleField } from './ParticleField'
import { useMousePosition } from '@/hooks/useMousePosition'
import { useIsTouch } from '@/hooks/useIsTouch'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function HeroScene() {
  const mouse = useMousePosition()
  const isTouch = useIsTouch()
  const reducedMotion = useReducedMotion()

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 0, 4.5], fov: 45 }}
      className="!absolute inset-0"
    >
      <color attach="background" args={['#0a0a0a']} />
      <Suspense fallback={null}>
        <BlobMesh mouse={mouse} />
        {!isTouch && !reducedMotion && <ParticleField count={100} />}
      </Suspense>
    </Canvas>
  )
}
