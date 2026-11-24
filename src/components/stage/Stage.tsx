'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { app } from '@/components/sphere/state'
import '@/components/hub/hub.css'

// three n'est chargé qu'après le premier rendu, côté client. Ces deux canvases restent montés pendant toute la visite :
// le nuage AXON derrière tout le site, la galerie de projets sur l'accueil (son état survit aux changements de page).
const Particles = dynamic(() => import('@/components/particles/Particles'), { ssr: false })
const Gallery = dynamic(() => import('@/components/gallery/Gallery'), { ssr: false })

export function Stage() {
  const pathname = usePathname()
  useEffect(() => {
    app.offHome = pathname !== '/'
  }, [pathname])
  return (
    <>
      <Particles />
      <Gallery />
    </>
  )
}
