'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { blobVertexShader, blobFragmentShader } from '@/shaders/blob'
import { colors } from '@/lib/constants'

export function BlobMesh({ mouse }: { mouse: React.RefObject<{ nx: number; ny: number }> }) {
  const meshRef = useRef<THREE.Mesh>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: blobVertexShader,
      fragmentShader: blobFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColorDeep: { value: new THREE.Color('#1e1240') },
        uColorMid: { value: new THREE.Color(colors.accentDim) },
        uColorRim: { value: new THREE.Color('#d8b4fe') },
      },
    })
  }, [])

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    const target = mouse.current
    const u = material.uniforms.uMouse.value as THREE.Vector2
    u.x += (target.nx - u.x) * 0.05
    u.y += (target.ny - u.y) * 0.05

    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.1
    }
  })

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.6, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}
