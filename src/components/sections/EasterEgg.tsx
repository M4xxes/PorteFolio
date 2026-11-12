'use client'

import Link from 'next/link'
import { useState } from 'react'
import { blip } from '@/lib/sound'

const COLS = 32
const ROWS = 6
// Le pixel mal placé : une cellule décalée d'une demi-case.
const ODD = { col: 23, row: 2 }

/**
 * Grille de points du pied de page. Un pixel est mal placé :
 * le trouver le remet en place et affiche un message.
 */
export function EasterEgg() {
  const [found, setFound] = useState(false)
  return (
    <div className="relative">
      <div
        aria-hidden={false}
        className="grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const col = i % COLS
          const row = Math.floor(i / COLS)
          if (col === ODD.col && row === ODD.row)
            return (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setFound(true)
                  blip('found')
                }}
                aria-label={found ? 'Pixel remis en place' : 'Un pixel est mal placé'}
                disabled={found}
                className="relative flex aspect-square items-center justify-center"
              >
                <span
                  className={`block size-[5px] transition-transform duration-[240ms] ease-[var(--ease-out)] sm:size-1.5 ${
                    found ? 'translate-x-0 translate-y-0 bg-accent' : 'translate-x-[0.5em] -translate-y-[0.35em] bg-fg-2'
                  }`}
                />
              </button>
            )
          return (
            <span key={i} aria-hidden className="flex aspect-square items-center justify-center">
              <span className="block size-[3px] bg-line-strong sm:size-1" />
            </span>
          )
        })}
      </div>
      <p role="status" className={`ui mt-4 min-h-5 ${found ? 'text-fg' : 'text-transparent'}`}>
        {found && (
          <>
            BIEN VU. <Link href="/#contact" className="border-b border-accent hover:text-accent">ON EN PARLE ?</Link>
          </>
        )}
      </p>
    </div>
  )
}
