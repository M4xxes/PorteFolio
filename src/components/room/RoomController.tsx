'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { projects } from '@/lib/data/projects'
import { ui, useUI } from '@/lib/store'
import { lockScroll, scrollToTarget } from '@/components/shell/ScrollEngine'
import { measure, metrics } from '@/components/three/heroTimeline'
import { room, roomActions } from '@/components/three/roomState'
import { RoomPanel } from './RoomPanel'

const N = projects.length
const projectUrl = (index: number) => `/projects/${projects[index].id}`

/** Entrée dans la salle depuis le carrousel : l'URL change, la page reste en place. */
export function openRoom(index: number) {
  window.history.pushState(null, '', projectUrl(index))
}

function setInert(on: boolean) {
  document.querySelectorAll<HTMLElement>('#site > main, #site > footer').forEach((el) => {
    el.inert = on
  })
}

/**
 * Fait le lien entre l'URL et la salle de contrôle (version complète uniquement).
 * L'URL est la source de vérité : `/projects/[slug]` = salle ouverte sur ce projet.
 *  - depuis le carrousel : `pushState` (pas de navigation), la caméra avance ;
 *  - chargement direct : on arrive dans la salle sans animation d'entrée ;
 *  - retour arrière, Échap ou FERMER : la caméra recule jusqu'au carrousel, sur le même projet.
 */
export function RoomController() {
  const pathname = usePathname()
  const router = useRouter()
  const full = useUI((s) => s.quality === 'full')
  const open = useUI((s) => s.work.mode === 'room')
  const active = useUI((s) => s.work.active)
  const fromHome = useRef(false)

  const slug = pathname.startsWith('/projects/') ? pathname.split('/')[2] : null

  useEffect(() => {
    const index = slug ? projects.findIndex((p) => p.id === slug) : -1
    const state = ui.getState()
    const home = Boolean(document.querySelector('[data-pinned]'))

    if (index >= 0 && full) {
      if (state.work.mode !== 'room') {
        // Chargement direct : pas de carrousel derrière, donc pas d'animation d'entrée.
        room.instant = !home
        if (!home) room.t = 1
        fromHome.current = home
        lockScroll(true, 'room')
        setInert(true)
        // Tant que la salle est ouverte, le navigateur ne restaure pas le scroll au retour arrière : on s'en charge.
        window.history.scrollRestoration = 'manual'
        ui.setState({ work: { active: index, mode: 'room' }, roomFocus: -1 })
        requestAnimationFrame(() => document.getElementById('room-close')?.focus({ preventScroll: true }))
      } else if (state.work.active !== index) {
        room.swap = 1
        ui.setState({ work: { active: index, mode: 'room' }, roomFocus: -1 })
        // Si l'élément qui avait le focus a disparu (miniature absente sur ce projet), on le rend au bouton FERMER.
        requestAnimationFrame(() => {
          if (document.activeElement === document.body) document.getElementById('room-close')?.focus({ preventScroll: true })
        })
      }
      return
    }

    if (state.work.mode === 'room') {
      ui.setState({ work: { active: state.work.active, mode: 'carousel' }, roomFocus: -1 })
      lockScroll(false, 'room')
      setInert(false)
      if (home) {
        // Le carrousel se cale sur le projet qu'on quitte (il a pu changer avec ← →), pendant que la salle le masque encore.
        // Fait après la restauration de scroll du navigateur / de Next (retour arrière), sinon elle l'écraserait.
        const index = state.work.active
        const settle = (last: boolean) => {
          if (ui.getState().work.mode === 'room') return
          measure()
          if (metrics.ready) {
            const y = metrics.work.top + index * metrics.work.step
            scrollToTarget(y, true)
            if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y)
          }
          if (last) window.history.scrollRestoration = 'auto'
        }
        // Sortie vers une ancre (PARLONS-EN, menu) : on laisse la page aller à l'ancre.
        if (room.closing || !window.location.hash) {
          settle(false)
          window.setTimeout(() => settle(true), 150)
        } else {
          // Le défilement était bloqué quand le navigateur a voulu aller à l'ancre : on le fait maintenant.
          window.history.scrollRestoration = 'auto'
          const hash = window.location.hash
          requestAnimationFrame(() => scrollToTarget(hash, true))
        }
        room.closing = false
        document.querySelector<HTMLElement>('a.screen-rect')?.focus({ preventScroll: true })
      } else {
        room.t = 0
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [slug, full])

  // Actions (FERMER, Échap, ← →) et titre de l'onglet.
  useEffect(() => {
    roomActions.close = () => {
      if (ui.getState().work.mode !== 'room') return
      room.closing = true
      if (fromHome.current && document.querySelector('[data-pinned]')) window.history.back()
      else router.push('/')
    }
    roomActions.go = (delta) => {
      if (ui.getState().work.mode !== 'room') return
      // On part de l'URL, pas du store : deux appuis rapides sur ← → s'enchaînent sans attendre le rendu.
      const current = projects.findIndex((p) => p.id === window.location.pathname.split('/')[2])
      if (current < 0) return
      window.history.replaceState(null, '', projectUrl((current + delta + N) % N))
    }
  }, [router])

  useEffect(() => {
    if (!open) return
    const previous = document.title
    document.title = `${projects[active].title} — Maxime Pero`
    const onKey = (e: KeyboardEvent) => {
      if (ui.getState().menuOpen || e.metaKey || e.ctrlKey || e.altKey) return
      if ((e.target as HTMLElement).closest?.('input, textarea, select')) return
      if (e.key === 'Escape') roomActions.close()
      else if (e.key === 'ArrowLeft') roomActions.go(-1)
      else if (e.key === 'ArrowRight') roomActions.go(1)
      else return
      e.preventDefault()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.title = previous
    }
  }, [open, active])

  return (
    <>
      {/* Annonce du projet affiché (ouverture, ← →) pour les lecteurs d'écran. */}
      <p role="status" className="sr-only">
        {open ? `Salle du projet ${String(active + 1).padStart(2, '0')} sur ${String(N).padStart(2, '0')} : ${projects[active].title}. Flèches gauche et droite : projet voisin. Échap : fermer.` : ''}
      </p>
      {open ? <RoomPanel index={active} /> : null}
    </>
  )
}
