'use client'

import { RotateCcw } from 'lucide-react'
import { replayIntro } from '@/components/intro/introState'

export function ReplayIntro() {
  return (
    <button
      type="button"
      onClick={replayIntro}
      className="group inline-flex min-h-11 items-center gap-2 text-left text-dark-muted transition-colors hover:text-orange"
    >
      <RotateCcw size={13} aria-hidden className="transition-transform duration-500 group-hover:-rotate-180" />
      Revoir l’introduction
    </button>
  )
}
