import type { Project, ProjectImage } from '@/types'

export interface RoomScreen {
  label: string
  image: ProjectImage | null
}

/**
 * Les trois écrans muraux de la salle : centre (accueil), gauche (détail), droite (mobile, sinon second détail).
 * Un écran sans capture disponible reste éteint : on n'invente pas de visuel.
 */
export function roomScreens(project: Project): [RoomScreen, RoomScreen, RoomScreen] {
  const gallery = project.gallery ?? []
  const wide = gallery.filter((g) => g.width >= g.height)
  const tall = gallery.filter((g) => g.height > g.width)
  return [
    { label: 'Accueil', image: project.cover },
    { label: 'Détail', image: wide[0] ?? null },
    { label: tall[0] ? 'Mobile' : 'Détail 2', image: tall[0] ?? wide[1] ?? null },
  ]
}
