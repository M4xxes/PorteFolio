'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type Video = { src: string; poster: string; width: number; height: number; duration: number }

/**
 * Visite filmée d'un site : muette, en boucle, lancée seulement quand elle est visible
 * (rien n'est téléchargé avant). En reduced motion, elle attend un clic sur « Lecture ».
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
    <div className="border border-line bg-surface">
      <div className="ui flex items-center justify-between gap-3 border-b border-line px-4 py-2.5 text-fg-3">
        <span className="truncate">{url ? url.replace(/^https?:\/\//, '') : 'Visite filmée'}</span>
        <span aria-hidden className="flex items-center gap-2">
          <span className={`size-[7px] ${playing ? 'bg-accent' : 'bg-fg-3'}`} />
          {playing ? 'LECTURE' : 'PAUSE'}
        </span>
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
          className="ui press absolute bottom-4 left-4 inline-flex min-h-11 items-center gap-3 bg-fg px-4 text-bg hover:bg-accent"
        >
          {playing ? '[||] PAUSE' : '[▶] LIRE LA VISITE'}
          <span className="doto text-base">{video.duration} S</span>
        </button>
      </div>
    </div>
  )
}
