/**
 * État de la transition carrousel ↔ salle de contrôle (ce fichier n'importe pas three).
 * `t` avance linéairement vers `target` (0 = carrousel, 1 = salle) : changer `target` en cours de route
 * inverse simplement le mouvement, la transition est donc interruptible à tout moment.
 *   t 0 → 0,5 : la caméra avance vers l'écran actif du carrousel
 *   t ≈ 0,5   : flash de grain (il masque le changement de décor)
 *   t 0,5 → 1 : la caméra finit d'avancer dans la salle
 */
export const ROOM_DURATION = 1.1

export const room = {
  t: 0,
  target: 0,
  /** Impulsion (1 → 0) quand on change de projet dans la salle : les écrans se rallument. */
  swap: 0,
  /** Vrai si la salle a été ouverte par un chargement direct (pas d'animation d'entrée). */
  instant: false,
}

/** Actions de la salle, branchées par `RoomController` (fermer, projet voisin). */
export const roomActions: { close: () => void; go: (delta: number) => void } = { close: () => {}, go: () => {} }

/** Ease-in-out cubique de la progression. */
export function roomEase() {
  const t = room.t
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Intensité du flash de grain (0 → 1), maximale au milieu de la transition. */
export function roomFlash() {
  return Math.max(Math.max(0, 1 - Math.abs(room.t - 0.5) / 0.17), room.swap * 0.7)
}
