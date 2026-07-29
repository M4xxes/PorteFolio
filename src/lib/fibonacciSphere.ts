const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Distributes `total` points evenly across a sphere of the given radius. */
export function fibonacciSpherePoint(index: number, total: number, radius: number): [number, number, number] {
  const y = 1 - (index / Math.max(total - 1, 1)) * 2
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y))
  const theta = GOLDEN_ANGLE * index

  const x = Math.cos(theta) * radiusAtY * radius
  const z = Math.sin(theta) * radiusAtY * radius
  return [x, y * radius, z]
}
