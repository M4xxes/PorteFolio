'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { navLinks, site } from '@/lib/constants'
import { EASE_OUT } from '@/lib/motion'
import { ui, useUI } from '@/lib/store'
import { lockScroll, scrollToTarget } from './ScrollEngine'
import { DecodeText } from './DecodeText'
import { Clock } from './Clock'
import { Wordmark } from './Wordmark'

/**
 * Menu plein écran. `<dialog>` modal : le reste de la page devient inerte (focus piégé),
 * Échap ferme (événement `cancel`), le défilement est bloqué.
 */
export function MenuOverlay() {
  const open = useUI((s) => s.menuOpen)
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current!
    if (open && !d.open) {
      d.showModal()
      lockScroll(true)
    } else if (!open && d.open) {
      d.dataset.closing = 'true'
      const t = setTimeout(() => {
        d.close()
        d.dataset.closing = 'false'
        lockScroll(false)
      }, 180)
      return () => clearTimeout(t)
    }
  }, [open])

  const pathname = usePathname()
  const close = () => ui.setState({ menuOpen: false })

  // Lien vers une ancre de la page courante : on ferme d'abord (le défilement est bloqué pendant le menu), puis on y va.
  const go = (href: string) => (e: React.MouseEvent) => {
    const [path, hash] = href.split('#')
    if (hash && path === pathname) {
      e.preventDefault()
      close()
      setTimeout(() => {
        scrollToTarget(`#${hash}`, true)
        history.replaceState(null, '', `#${hash}`)
      }, 200)
    } else close()
  }

  return (
    <dialog
      ref={ref}
      id="site-menu"
      aria-label="Menu"
      className="menu-dialog"
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
    >
      <div className="flex min-h-full flex-col px-[var(--gutter)]" data-lenis-prevent>
        <div className="flex h-[var(--header-h)] items-center justify-between gap-4">
          <Link href="/#top" onClick={go('/#top')} className="text-lg sm:text-[1.375rem]">
            <Wordmark />
          </Link>
          <button type="button" onClick={close} autoFocus aria-label="Fermer le menu" className="ui invert-hover press inline-flex min-h-11 items-center px-3.5">
            &gt; FERMER &lt;
          </button>
        </div>
        <div aria-hidden className="h-px bg-line" />

        <nav aria-label="Navigation principale" className="flex flex-1 flex-col justify-center py-10">
          <ol className="flex flex-col">
            {navLinks.map((link, i) => (
              <motion.li
                key={link.href}
                initial={false}
                animate={open ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                transition={{ duration: 0.26, ease: EASE_OUT, delay: open ? 0.05 + i * 0.04 : 0 }}
                className="border-b border-line"
              >
                <Link
                  href={link.href}
                  onClick={go(link.href)}
                  className="group flex items-baseline gap-4 py-3 sm:gap-8 sm:py-4"
                >
                  <span aria-hidden className="ui w-8 shrink-0 text-fg-2">[{link.index}]</span>
                  <span className="pixel nudge text-[clamp(2.75rem,9vw,7.5rem)] text-fg-2 group-hover:text-fg group-focus-visible:text-fg">
                    {link.label}
                  </span>
                </Link>
              </motion.li>
            ))}
          </ol>
        </nav>

        <div className="ui flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-6 text-fg-2">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <a href={site.github} target="_blank" rel="noreferrer" className="hover:text-fg">
                <DecodeText text="GITHUB ↗" />
              </a>
            </li>
            <li>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="hover:text-fg">
                <DecodeText text="LINKEDIN ↗" />
              </a>
            </li>
            <li>
              <a href={site.cvUrl} target="_blank" rel="noreferrer" className="hover:text-fg">
                <DecodeText text="CV (PDF) ↗" />
              </a>
            </li>
          </ul>
          <Clock />
        </div>
      </div>
    </dialog>
  )
}
