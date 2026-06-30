import { useState } from 'react'
import { MapPin, ChevronDown, Download, ArrowRight, Github, User } from 'lucide-react'
import { motion } from 'framer-motion'

// Variants d'animation pour l'entrée en cascade
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

// Photo de profil avec fallback SVG si le fichier n'existe pas encore
function ProfilePhoto() {
  const [imgError, setImgError] = useState(false)

  return (
    <div className="relative w-56 h-56 md:w-72 md:h-72 mx-auto">
      {/* Anneau rotatif externe */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-12px] rounded-full border border-dashed border-accent/30"
      />
      {/* Anneau rotatif interne (sens inverse) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-[-4px] rounded-full border border-accent/15"
        style={{ borderStyle: 'dotted' }}
      />

      {/* Points décoratifs aux quatre coins */}
      {[0, 90, 180, 270].map(deg => (
        <div
          key={deg}
          className="absolute w-2 h-2 rounded-full bg-accent/60"
          style={{
            top: '50%', left: '50%',
            transform: `rotate(${deg}deg) translateX(calc(50% + 4.5rem)) translateY(-50%)`,
          }}
        />
      ))}

      {/* Cercle de fond avec glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 shadow-accent-lg" />

      {/* Photo ou placeholder */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-accent/40">
        {!imgError ? (
          <img
            src="/assets/profile.jpg"
            alt="Photo de profil de Maxime Pero"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Placeholder : silhouette SVG stylisée */
          <div className="w-full h-full bg-gradient-to-br from-accent/25 via-accent/10 to-bg
                          flex flex-col items-center justify-center gap-2">
            <User size={52} className="text-accent/50" />
            <span className="text-[10px] text-accent/40 font-mono tracking-widest uppercase">
              profile.jpg
            </span>
          </div>
        )}
      </div>

      {/* Badge flottant "disponible" */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.4 }}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap
                   px-3 py-1 rounded-full text-[11px] font-medium
                   bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
        Disponible pour des projets
      </motion.div>
    </div>
  )
}

export function Hero() {
  function scrollToProjects() {
    const el = document.getElementById('projects')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }
  function scrollToContact() {
    const el = document.getElementById('contact')
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' })
  }

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-bg"
      aria-label="Section héro"
    >
      {/* Fond : motif de points */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.13) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Glow radial violet en haut à droite */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />
      {/* Glow discret en bas à gauche */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 md:px-8 pt-24 pb-16">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-16">

          {/* ── Contenu gauche ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 text-center lg:text-left"
          >
            {/* Label localisation */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-accent/50" />
              <MapPin size={13} className="text-accent" />
              <span className="text-xs font-medium tracking-[0.2em] text-c-muted uppercase">Lyon, France</span>
            </motion.div>

            {/* Nom */}
            <motion.h1
              variants={itemVariants}
              className="font-serif text-5xl sm:text-6xl md:text-7xl xl:text-8xl text-c-text font-bold leading-[1.05] mb-4"
            >
              Maxime{' '}
              <span className="italic text-accent">Pero</span>
            </motion.h1>

            {/* Titre */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 justify-center lg:justify-start mb-3">
              <div className="h-px w-6 bg-accent/40" />
              <p className="text-base md:text-lg font-semibold tracking-[0.18em] text-c-muted uppercase">
                Développeur Full-Stack
              </p>
            </motion.div>

            {/* Sous-titre */}
            <motion.p
              variants={itemVariants}
              className="text-c-muted text-sm md:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8"
            >
              Étudiant en 3ème année de Bachelor Informatique à{' '}
              <span className="text-accent-light">Ynov Campus Lyon</span>,
              spécialisé full-stack web.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap gap-3 justify-center lg:justify-start mb-10"
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(139,92,246,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToProjects}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white
                           font-semibold text-sm shadow-accent-sm hover:bg-accent-dark transition-colors"
              >
                Voir mes projets
                <ArrowRight size={15} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={scrollToContact}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-c-border
                           bg-elevated text-c-text font-semibold text-sm hover:border-accent/50
                           hover:text-accent transition-colors"
              >
                Me contacter
              </motion.button>

              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href="/assets/cv-maxime-pero.pdf"
                download
                aria-label="Télécharger le CV de Maxime Pero"
                className="flex items-center gap-2 px-5 py-3 rounded-xl border border-c-border
                           bg-transparent text-c-muted font-medium text-sm hover:border-accent/40
                           hover:text-c-text transition-colors"
              >
                <Download size={14} />
                CV
              </motion.a>
            </motion.div>

            {/* Liens réseaux */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 justify-center lg:justify-start">
              <a
                href="https://github.com/M4xxes"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Profil GitHub de Maxime Pero"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-c-border
                           bg-elevated text-c-muted hover:text-accent hover:border-accent/50 transition-colors"
              >
                <Github size={16} />
              </a>
              <span className="text-xs text-c-muted tracking-widest">github.com/M4xxes</span>
            </motion.div>
          </motion.div>

          {/* ── Photo droite ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0"
          >
            <ProfilePhoto />
          </motion.div>
        </div>

        {/* Indicateur de défilement */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex flex-col items-center gap-2 mt-16 text-c-muted"
          aria-hidden="true"
        >
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-50">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
            <ChevronDown size={18} className="opacity-40" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
