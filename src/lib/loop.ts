/**
 * Une seule boucle requestAnimationFrame pour tout le site.
 * Lenis s'y abonne en premier (priorité 0), puis le curseur (10), puis la scène 3D (phase 2 : `advance` de R3F, 20).
 * La boucle s'arrête d'elle-même quand plus personne n'est abonné.
 */
type FrameCallback = (time: number, delta: number) => void
type Entry = { cb: FrameCallback; priority: number }

let entries: Entry[] = []
let raf = 0
let last = 0

function tick(time: number) {
  const delta = last ? Math.min(time - last, 100) : 16.7
  last = time
  for (const e of entries) e.cb(time, delta)
  if (entries.length) raf = requestAnimationFrame(tick)
  else {
    raf = 0
    last = 0
  }
}

export function addFrame(cb: FrameCallback, priority = 10) {
  entries = [...entries, { cb, priority }].sort((a, b) => a.priority - b.priority)
  if (!raf && typeof window !== 'undefined') raf = requestAnimationFrame(tick)
  return () => {
    entries = entries.filter((e) => e.cb !== cb)
  }
}
