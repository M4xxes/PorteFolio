import { LITE_STORAGE_KEY } from './motion'
import { ui, type LiteMode, type LiteReason } from './store'

/**
 * Version complète (3D) ou légère : tout se décide ici.
 *
 * Raisons « dures », non contournables : page sans scène, écran < 1024 px, animations réduites, pas de WebGL.
 * Raisons « souples » : GPU faible (detect-gpu, tier < 2), images/s < 30 pendant 2 s, scène en erreur.
 * Le visiteur peut forcer la version légère, ou la désactiver pour ignorer les raisons souples.
 */
export const PERF_STORAGE_KEY = 'portfolio:perf'

export const hardReasons: LiteReason[] = ['route', 'small', 'motion', 'webgl']

export const reasonLabels: Record<LiteReason, string> = {
  route: '',
  small: 'écran < 1024 px',
  motion: 'animations réduites',
  webgl: 'WebGL indisponible',
  manual: '',
  gpu: 'GPU limité',
  fps: 'images/s < 30',
  error: 'erreur 3D',
}

function read(storage: 'local' | 'session', key: string) {
  try {
    return (storage === 'local' ? localStorage : sessionStorage).getItem(key)
  } catch {
    return null
  }
}
function write(storage: 'local' | 'session', key: string, value: string | null) {
  try {
    const s = storage === 'local' ? localStorage : sessionStorage
    if (value === null) s.removeItem(key)
    else s.setItem(key, value)
  } catch {}
}

/** Choix du visiteur, mémorisé dans ce navigateur. */
export function readLiteMode(): LiteMode {
  const v = read('local', LITE_STORAGE_KEY)
  return v === '1' ? 'on' : v === '0' ? 'off' : 'auto'
}

export function setLiteMode(mode: LiteMode) {
  write('local', LITE_STORAGE_KEY, mode === 'on' ? '1' : mode === 'off' ? '0' : null)
  // Désactiver la version légère, c'est aussi redonner sa chance à la 3D après une erreur ou des images/s basses.
  if (mode === 'off') write('session', PERF_STORAGE_KEY, null)
  ui.setState(mode === 'off' ? { liteMode: mode, perf: 'unknown' } : { liteMode: mode })
}

/** Verdict de performance mémorisé pour la session (évite de refaire le test à chaque page). */
export function readPerf() {
  const v = read('session', PERF_STORAGE_KEY)
  return v === 'ok' || v === 'gpu' || v === 'fps' || v === 'error' ? v : 'unknown'
}

export function reportPerf(verdict: 'ok' | 'gpu' | 'fps' | 'error') {
  write('session', PERF_STORAGE_KEY, verdict)
  ui.setState({ perf: verdict })
}

export function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Test du GPU avec detect-gpu (chargé à la demande, données de référence auto-hébergées : aucune requête externe).
 * Renvoie `false` seulement si le GPU est reconnu comme trop faible ; en cas de doute, la surveillance des images/s prend le relais.
 */
export async function gpuIsCapable(): Promise<boolean> {
  try {
    const { getGPUTier } = await import('detect-gpu')
    const result = await Promise.race([
      getGPUTier({ benchmarksURL: '/detect-gpu' }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
    ])
    if (!result) return true
    if (result.type === 'BLOCKLISTED' || result.type === 'WEBGL_UNSUPPORTED') return false
    return !(result.type === 'BENCHMARK' && result.tier < 2)
  } catch {
    return true
  }
}
