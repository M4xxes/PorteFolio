/**
 * Sphère de points statique (SVG) : emplacement réservé de la scène 3D du hero,
 * et version de secours quand le WebGL n'est pas utilisé.
 * Points répartis sur une spirale de Fibonacci, projetés une fois au rendu serveur.
 */
const N = 420
const ROT_Y = 0.6
const ROT_X = 0.32

function points() {
  const golden = Math.PI * (3 - Math.sqrt(5))
  const out: { x: number; y: number; z: number; lit: boolean }[] = []
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const th = golden * i
    let x = Math.cos(th) * r
    let z = Math.sin(th) * r
    // rotation Y puis X
    const x1 = x * Math.cos(ROT_Y) + z * Math.sin(ROT_Y)
    const z1 = -x * Math.sin(ROT_Y) + z * Math.cos(ROT_Y)
    const y1 = y * Math.cos(ROT_X) - z1 * Math.sin(ROT_X)
    z = y * Math.sin(ROT_X) + z1 * Math.cos(ROT_X)
    x = x1
    out.push({ x, y: y1, z, lit: z > 0.72 && (i * 7919) % 11 === 0 })
  }
  return out.sort((a, b) => a.z - b.z)
}

const PTS = points()

export function DotSphere({ className }: { className?: string }) {
  return (
    <svg viewBox="-110 -110 220 220" aria-hidden className={className} shapeRendering="crispEdges">
      {PTS.map((p, i) => {
        const depth = (p.z + 1) / 2
        const s = 0.9 + depth * 1.9
        return (
          <rect
            key={i}
            x={(p.x * 100 - s / 2).toFixed(2)}
            y={(p.y * 100 - s / 2).toFixed(2)}
            width={s.toFixed(2)}
            height={s.toFixed(2)}
            fill={p.lit ? 'var(--accent)' : 'var(--fg)'}
            opacity={(0.12 + depth * 0.88).toFixed(2)}
          />
        )
      })}
    </svg>
  )
}
