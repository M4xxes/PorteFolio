/** Deterministic pseudo-random value in [0, 1) — avoids impure Math.random() calls during render. */
export function hashRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}
