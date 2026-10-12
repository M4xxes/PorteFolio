'use client'

import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type Video = { src: string; poster: string; width: number; height: number; duration: number }

/**
 * Visite filmée d'un site : muette, en boucle, lancée seulement quand elle est visible
 * (rien n'est téléchargé avant). Avec reduced-motion, elle attend un clic sur « Lecture ».
 */
export function ProjectVideo({ video, label, url }: { video: Video; label: string; url?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const reduced = usePrefersReducedMotion()
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || reduced || userPaused) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => setPlaying(false))
        else el.pause()
      },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced, userPaused])

  const toggle = () => {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      setUserPaused(false)
      el.play().catch(() => setPlaying(false))
    } else {
      setUserPaused(true)
      el.pause()
    }
  }

  return (
    <div className="overflow-hidden bg-dark">
      {/* Barre de navigateur : situe la vidéo comme une visite du site en ligne */}
      <div className="flex items-center gap-3 border-b border-dark-line px-4 py-2.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-cream/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-cream/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-orange" />
        </span>
        {url && <span className="label truncate text-[10px] text-dark-muted">{url.replace(/^https?:\/\//, '')}</span>}
      </div>
      <div className="relative" style={{ aspectRatio: `${video.width} / ${video.height}` }}>
        <video
          ref={ref}
          className="absolute inset-0 h-full w-full object-cover"
          poster={video.poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        >
          <source src={video.src} type="video/mp4" />
        </video>
        <button
          type="button"
          onClick={toggle}
          className="group absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-cream/90 px-4 text-sm text-ink backdrop-blur transition-colors hover:bg-orange"
        >
          {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
          {playing ? 'Pause' : 'Lire la visite'}
          <span className="label text-[10px] text-muted group-hover:text-ink">{video.duration} s</span>
        </button>
      </div>
    </div>
  )
}
