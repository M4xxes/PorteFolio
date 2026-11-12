'use client'

import Link from 'next/link'
import { MenuOverlay } from './MenuOverlay'
import { ScrollBar, ScrollPercent } from './ScrollReadout'
import { DecodeText } from './DecodeText'
import { Wordmark } from './Wordmark'
import { useUI, ui } from '@/lib/store'

export function Header() {
  const open = useUI((s) => s.menuOpen)

  return (
    <>
      <ScrollBar />
      <header
        className="fixed inset-x-0 top-0 z-[100] bg-bg"
        style={{ viewTransitionName: 'site-header' }}
      >
        <div className="flex h-[var(--header-h)] items-center justify-between gap-4 bg-bg px-[var(--gutter)]">
          <Link href="/#top" aria-label="Maxime Pero — accueil" className="press shrink-0 text-lg sm:text-[1.375rem]">
            <Wordmark />
          </Link>

          <ScrollPercent className="hidden md:block" />

          <nav aria-label="Raccourcis" className="flex items-center gap-1">
            <Link href="/#contact" className="ui invert-hover hidden min-h-11 items-center gap-2.5 px-3.5 sm:inline-flex">
              <DecodeText text="PARLONS-EN" />
              <span aria-hidden className="size-[7px] bg-accent" />
            </Link>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => ui.setState({ menuOpen: true })}
              className="ui invert-hover press inline-flex min-h-11 items-center gap-2.5 border border-fg px-3.5"
            >
              MENU
              <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden>
                <path d="M0 1h14M0 5h14M0 9h14" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </nav>
        </div>
        <div aria-hidden className="mx-[var(--gutter)] h-px bg-line" />
      </header>
      <MenuOverlay />
    </>
  )
}
