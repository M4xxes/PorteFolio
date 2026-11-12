import { createStore } from 'zustand/vanilla'
import { useStore } from 'zustand'

/**
 * Store partagé entre le HTML et (à partir de la phase 2) la scène 3D.
 * Les valeurs qui changent à chaque frame (scroll, pointeur) se lisent avec `ui.getState()`
 * ou `ui.subscribe()` : aucun re-render React. Les hooks ne servent qu'aux valeurs discrètes.
 */
export type Quality = 'pending' | 'full' | 'lite'

export interface UIState {
  /** Défilement : position (px), progression de la page (0–1), vitesse lissée (px/frame). */
  scroll: { y: number; progress: number; velocity: number }
  /** Pointeur : pixels et coordonnées normalisées (-1 → 1). */
  pointer: { x: number; y: number; nx: number; ny: number }
  /** Projet actif dans la sélection, et mode d'affichage (la salle arrive en phase 4). */
  work: { active: number; mode: 'carousel' | 'room' }
  quality: Quality
  /** Choix manuel « version légère » (pied de page), prioritaire sur la détection. */
  liteForced: boolean
  menuOpen: boolean
}

export const ui = createStore<UIState>()(() => ({
  scroll: { y: 0, progress: 0, velocity: 0 },
  pointer: { x: -100, y: -100, nx: 0, ny: 0 },
  work: { active: 0, mode: 'carousel' },
  quality: 'pending',
  liteForced: false,
  menuOpen: false,
}))

export function useUI<T>(selector: (s: UIState) => T) {
  return useStore(ui, selector)
}

export const setActiveProject = (active: number) =>
  ui.setState((s) => (s.work.active === active ? s : { work: { ...s.work, active } }))
