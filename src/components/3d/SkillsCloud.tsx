'use client'

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { skillCloud } from '@/lib/data/skills'
import { fibonacciSpherePoint } from '@/lib/fibonacciSphere'
import { categoryColors } from '@/lib/skillColors'

const RADIUS = 2.6

function SkillPoint({
  name,
  category,
  position,
}: {
  name: string
  category: string
  position: [number, number, number]
}) {
  const [hovered, setHovered] = useState(false)
  const color = categoryColors[category] ?? '#a855f7'

  return (
    <group position={position}>
      {/* Larger invisible hit-area — the visible dot alone is too small to reliably hover/tap. */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[hovered ? 0.07 : 0.04, 12, 12]} />
        <meshBasicMaterial color={hovered ? '#f5f5f5' : color} />
      </mesh>
      {hovered && (
        <Html center distanceFactor={8} style={{ pointerEvents: 'none' }}>
          <span
            className="whitespace-nowrap rounded-full bg-bg/90 px-3 py-1 font-sans text-sm font-medium text-fg"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.5)', border: '1px solid rgba(245,245,245,0.15)' }}
          >
            {name}
          </span>
        </Html>
      )}
    </group>
  )
}

export function SkillsCloud({ interactive = true }: { interactive?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)

  const points = useMemo(
    () =>
      skillCloud.map((skill, i) => ({
        ...skill,
        position: fibonacciSpherePoint(i, skillCloud.length, RADIUS),
      })),
    []
  )

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.06
  })

  return (
    <>
      <group ref={groupRef}>
        {points.map((p) => (
          <SkillPoint key={p.name} name={p.name} category={p.category} position={p.position} />
        ))}
      </group>
      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={(2 * Math.PI) / 3}
        />
      )}
    </>
  )
}
