'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { colors } from '@/lib/constants'
import { hashRandom } from '@/lib/deterministicRandom'

const dummy = new THREE.Object3D()

export function ParticleField({ count = 120 }: { count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        position: new THREE.Vector3(
          (hashRandom(i * 1.13 + 1) - 0.5) * 9,
          (hashRandom(i * 2.71 + 5) - 0.5) * 6,
          (hashRandom(i * 3.97 + 9) - 0.5) * 6 - 1
        ),
        speed: 0.05 + hashRandom(i * 4.41 + 13) * 0.15,
        offset: hashRandom(i * 5.19 + 17) * Math.PI * 2,
        scale: 0.015 + hashRandom(i * 6.63 + 21) * 0.03,
      })),
    [count]
  )

  useFrame((state) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position.x + Math.sin(t * p.speed + p.offset) * 0.3,
        p.position.y + Math.cos(t * p.speed * 0.8 + p.offset) * 0.3,
        p.position.z
      )
      dummy.scale.setScalar(p.scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color={colors.accent} transparent opacity={0.5} />
    </instancedMesh>
  )
}
