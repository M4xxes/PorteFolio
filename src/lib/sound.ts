import { ui } from './store'

/**
 * Sons 8-bit, synthétisés à la volée (aucun fichier audio). Désactivés par défaut :
 * rien ne se joue, et aucun contexte audio n'est créé, tant que le visiteur n'a pas activé « SON ».
 * Choix mémorisé dans ce navigateur (`portfolio:sound`).
 */
export const SOUND_STORAGE_KEY = 'portfolio:sound'

export type Blip = 'open' | 'close' | 'tick' | 'enter' | 'back' | 'ok' | 'found'

// [fréquence Hz, durée s, décalage s] : de courtes notes carrées, à faible volume.
const NOTES: Record<Blip, [number, number, number][]> = {
  open: [[440, 0.05, 0], [660, 0.07, 0.05]],
  close: [[660, 0.05, 0], [440, 0.07, 0.05]],
  tick: [[880, 0.025, 0]],
  enter: [[330, 0.06, 0], [494, 0.06, 0.06], [660, 0.1, 0.12]],
  back: [[660, 0.06, 0], [494, 0.06, 0.06], [330, 0.1, 0.12]],
  ok: [[587, 0.05, 0], [880, 0.09, 0.05]],
  found: [[523, 0.07, 0], [659, 0.07, 0.07], [784, 0.07, 0.14], [1047, 0.14, 0.21]],
}

let ctx: AudioContext | null = null
let last = 0

export function readSound() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function setSound(on: boolean) {
  try {
    if (on) localStorage.setItem(SOUND_STORAGE_KEY, '1')
    else localStorage.removeItem(SOUND_STORAGE_KEY)
  } catch {}
  ui.setState({ sound: on })
  if (on) blip('ok')
}

export function blip(kind: Blip) {
  if (!ui.getState().sound || typeof window === 'undefined') return
  // Un son à la fois : on ignore les déclenchements trop rapprochés (défilement rapide).
  const now = performance.now()
  if (now - last < 45) return
  last = now
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    const t0 = ctx.currentTime
    for (const [freq, dur, at] of NOTES[kind]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t0 + at)
      gain.gain.exponentialRampToValueAtTime(0.035, t0 + at + 0.006)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t0 + at)
      osc.stop(t0 + at + dur + 0.02)
    }
  } catch {}
}
