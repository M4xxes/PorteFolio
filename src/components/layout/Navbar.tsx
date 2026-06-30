import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeToggle } from '../ui/ThemeToggle'
import { useScrolled } from '../../hooks/useScrolled'

const NAV_LINKS = [
  { label: 'À propos', href: '#about' },
  { label: 'Compétences', href: '#skills' },
  { label: 'Projets', href: '#projects' },
  { label: 'Parcours', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

// Défilement fluide avec offset pour la navbar sticky
function scrollTo(href: string) {
  const el = document.querySelector(href)
  if (!el) return
  const offset = 72
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'smooth' })
}

export function Navbar() {
  const scrolled = useScrolled(40)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  // Ferme le menu mobile au resize
  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('resize', close)
    return () => window.removeEventListener('resize', close)
  }, [])

  // Bloque le scroll body quand menu mobile ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // Détection de la section active à l'intersectionObserver
  useEffect(() => {
    const sections = NAV_LINKS.map(l => l.href.slice(1))
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    sections.forEach(id => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled
            ? 'h-14 bg-bg/90 backdrop-blur-md border-b border-c-border shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
            : 'h-[72px] bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={e => { e.preventDefault(); scrollTo('#hero') }}
            aria-label="Retour en haut"
            className="flex items-center gap-2 group"
          >
            <span className="w-9 h-9 rounded-lg border border-accent/40 bg-accent/10 flex items-center justify-center
                             font-serif font-bold text-accent text-sm group-hover:bg-accent/20 transition-colors">
              MP
            </span>
            <span className="hidden sm:block font-sans font-medium text-c-text text-sm tracking-wide
                             group-hover:text-accent transition-colors">
              Maxime Pero
            </span>
          </a>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={e => { e.preventDefault(); scrollTo(link.href) }}
                className={`relative px-3 py-1.5 text-sm font-medium transition-colors duration-150 rounded-md
                  ${activeSection === link.href.slice(1)
                    ? 'text-accent'
                    : 'text-c-muted hover:text-c-text'
                  }`}
              >
                {link.label}
                {activeSection === link.href.slice(1) && (
                  <motion.span
                    layoutId="active-indicator"
                    className="absolute inset-0 rounded-md bg-accent/8"
                  />
                )}
              </a>
            ))}
          </nav>

          {/* Droite : toggle + bouton contact + menu mobile */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="mailto:maxime.pero@ynov.com"
              className="hidden md:flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg
                         bg-accent text-white hover:bg-accent-dark transition-colors duration-200 shadow-accent-sm"
            >
              Me contacter
            </a>
            {/* Burger menu */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-c-border
                         bg-elevated text-c-muted hover:text-accent hover:border-accent transition-colors"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Menu mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-40 flex flex-col pt-[72px] bg-bg/97 backdrop-blur-xl md:hidden"
          >
            <nav className="flex flex-col p-6 gap-2" aria-label="Menu mobile">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={e => { e.preventDefault(); scrollTo(link.href); setMenuOpen(false) }}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-c-text text-base font-medium
                             hover:bg-elevated hover:text-accent transition-colors border border-transparent
                             hover:border-accent/20"
                >
                  <span className="font-mono text-xs text-accent opacity-60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {link.label}
                </motion.a>
              ))}
              <a
                href="mailto:maxime.pero@ynov.com"
                className="mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold
                           rounded-xl bg-accent text-white hover:bg-accent-dark transition-colors"
              >
                Me contacter
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
