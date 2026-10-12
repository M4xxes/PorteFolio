'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { navLinks, site, easing } from '@/lib/constants'
import { getLenis } from '@/components/providers/SmoothScrollProvider'
import { Wordmark } from './Logo'

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)
  const toggleRef = useRef<HTMLButtonElement>(null)

  // Ferme le menu mobile à chaque changement de page.
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Menu mobile : bloque le défilement, ferme avec Échap, rend le focus au bouton.
  useEffect(() => {
    if (!open) return
    const lenis = getLenis()
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
    const toggle = toggleRef.current
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      lenis?.start()
      document.documentElement.style.overflow = ''
      window.removeEventListener('keydown', onKey)
      toggle?.focus()
    }
  }, [open])

  return (
    <header id="top" style={{ viewTransitionName: 'site-header' }} className="fixed inset-x-0 top-0 z-50">
      <div
        className={`relative z-10 flex items-center justify-between gap-6 border-b px-5 transition-[height,background-color,border-color,color] duration-500 sm:px-8 lg:px-10 ${
          open
            ? 'h-[var(--header-h)] border-transparent text-cream'
            : scrolled
              ? 'h-16 border-line bg-cream/90 backdrop-blur-md'
              : 'h-[var(--header-h)] border-transparent'
        }`}
      >
        <Link href="/" aria-label={`${site.name} — accueil`} className="flex items-baseline gap-3">
          <Wordmark className="text-2xl" />
        </Link>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href)
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-2 py-2 text-sm transition-colors ${active ? 'text-ink' : 'text-muted hover:text-ink'}`}
                  >
                    <span className={`font-mono text-[10px] ${active ? 'text-orange-ink' : 'text-subtle'}`}>{link.index}</span>
                    <span className="relative">
                      {link.label}
                      <span
                        aria-hidden
                        className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-orange transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                      />
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <a
          href={site.cvUrl}
          download
          className="group hidden min-h-10 items-center gap-2 rounded-full border border-ink px-4 text-sm transition-colors hover:border-orange hover:bg-orange md:inline-flex"
        >
          CV <ArrowDown size={14} aria-hidden className="transition-transform group-hover:translate-y-0.5" />
        </a>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="flex min-h-11 items-center gap-3 text-sm md:hidden"
        >
          <span>{open ? 'Fermer' : 'Menu'}</span>
          <span aria-hidden className="relative block h-3 w-6">
            <span className={`absolute left-0 h-[2px] w-full bg-current transition-transform duration-300 ${open ? 'top-[5px] rotate-45' : 'top-0'}`} />
            <span className={`absolute left-0 h-[2px] w-full bg-current transition-transform duration-300 ${open ? 'top-[5px] -rotate-45' : 'top-[10px]'}`} />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: 0.6, ease: easing.inOut }}
            className="fixed inset-0 flex flex-col bg-dark px-5 pb-8 pt-[calc(var(--header-h)+1.5rem)] text-cream md:hidden"
          >
            <nav aria-label="Navigation mobile" className="flex-1">
              <ul className="flex flex-col">
                {navLinks.map((link, i) => {
                  const active = isActive(pathname, link.href)
                  return (
                    <li key={link.href} className="overflow-hidden border-b border-dark-line">
                      <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        transition={{ delay: 0.15 + i * 0.06, duration: 0.7, ease: easing.smooth }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className="flex items-baseline gap-4 py-4"
                        >
                          <span className={`font-mono text-xs ${active ? 'text-orange' : 'text-dark-muted'}`}>{link.index}</span>
                          <span className={`display text-[3.25rem] ${active ? 'text-orange' : ''}`}>{link.label}</span>
                        </Link>
                      </motion.div>
                    </li>
                  )
                })}
              </ul>
            </nav>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <a href={`mailto:${site.email}`} className="col-span-2 break-all text-cream underline decoration-orange underline-offset-4">
                {site.email}
              </a>
              <a href={site.cvUrl} download className="inline-flex min-h-11 items-center gap-1.5 text-dark-muted">
                CV (PDF) <ArrowDown size={13} aria-hidden />
              </a>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-dark-muted">
                GitHub <ArrowUpRight size={13} aria-hidden />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
