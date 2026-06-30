import { Github, Mail, Phone, MapPin, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const QUICK_LINKS = [
  { label: 'À propos', href: '#about' },
  { label: 'Compétences', href: '#skills' },
  { label: 'Projets', href: '#projects' },
  { label: 'Parcours', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

function scrollTo(href: string) {
  const el = document.querySelector(href)
  if (!el) return
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
}

export function Footer() {
  return (
    <footer className="border-t border-c-border bg-surface">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          {/* Identité */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-9 h-9 rounded-lg border border-accent/40 bg-accent/10 flex items-center justify-center
                               font-serif font-bold text-accent text-sm">
                MP
              </span>
              <span className="font-serif text-lg text-c-text font-semibold">Maxime Pero</span>
            </div>
            <p className="text-c-muted text-sm leading-relaxed max-w-xs">
              Développeur Full-Stack passionné, étudiant à Ynov Campus Lyon.
              React · TypeScript · Node.js · Flutter.
            </p>
            <div className="flex items-center gap-1 mt-3 text-c-muted text-xs">
              <MapPin size={12} className="text-accent" />
              Lyon, France
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-c-muted mb-4">Navigation</h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={e => { e.preventDefault(); scrollTo(link.href) }}
                    className="text-sm text-c-muted hover:text-accent transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase text-c-muted mb-4">Contact</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="mailto:maxime.pero@ynov.com"
                  className="flex items-center gap-2 text-sm text-c-muted hover:text-accent transition-colors"
                >
                  <Mail size={14} className="text-accent shrink-0" />
                  maxime.pero@ynov.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+33786569051"
                  className="flex items-center gap-2 text-sm text-c-muted hover:text-accent transition-colors"
                >
                  <Phone size={14} className="text-accent shrink-0" />
                  07 86 56 90 51
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/M4xxes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-c-muted hover:text-accent transition-colors"
                >
                  <Github size={14} className="text-accent shrink-0" />
                  github.com/M4xxes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bas de footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-c-border">
          <p className="text-xs text-c-muted">
            © 2026 Maxime Pero — Tous droits réservés
          </p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-1.5 text-xs text-c-muted"
          >
            Fait avec{' '}
            <Heart size={11} className="text-accent fill-accent" />
            {' '}en React + TypeScript
          </motion.p>
        </div>
      </div>
    </footer>
  )
}
