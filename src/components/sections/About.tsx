import { useState } from 'react'
import { GraduationCap, Award, Globe, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'

// Statistiques clés affichées sous forme de compteurs
const stats = [
  { value: '3ème', label: 'année de Bachelor', icon: GraduationCap },
  { value: 'Niv. 6', label: 'RNCP visé', icon: Award },
  { value: '2', label: 'langues', icon: Globe },
]

// Badges de langues
const languages = [
  { lang: 'Français', level: 'Courant', flag: '🇫🇷' },
  { lang: 'Anglais', level: 'Intermédiaire', flag: '🇬🇧' },
]

function ProfilePhotoSmall() {
  const [imgError, setImgError] = useState(false)
  return (
    <div className="relative w-full aspect-square max-w-xs mx-auto">
      {/* Bordure décorative décalée */}
      <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl border border-accent/25" />
      <div className="relative z-10 w-full h-full rounded-2xl overflow-hidden border border-c-border">
        {!imgError ? (
          <img
            src="/assets/profile.jpg"
            alt="Maxime Pero"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-accent/20 via-accent/8 to-elevated
                          flex flex-col items-center justify-center gap-3">
            <User size={48} className="text-accent/40" />
            <span className="text-[10px] font-mono text-accent/30 tracking-widest uppercase">profile.jpg</span>
          </div>
        )}
      </div>
      {/* Tag flottant */}
      <div className="absolute -bottom-4 -right-4 z-20 px-3 py-1.5 rounded-lg bg-surface border border-c-border
                      shadow-card text-xs font-medium text-c-text">
        Ynov Campus · Lyon
      </div>
    </div>
  )
}

export function About() {
  return (
    <SectionWrapper id="about" className="bg-surface">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader number="01" title="À propos" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Colonne photo */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <ProfilePhotoSmall />
          </motion.div>

          {/* Colonne texte */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <div className="space-y-4 text-c-muted leading-relaxed text-sm md:text-base">
              <p>
                Je suis <span className="text-c-text font-medium">Maxime Pero</span>, étudiant en 3ème année
                de Bachelor Informatique à{' '}
                <span className="text-accent">Ynov Campus Lyon</span>. Je prépare la certification{' '}
                <span className="text-c-text font-medium">RNCP36463</span> — Concepteur Développeur
                d'Applications Numériques, Niveau 6.
              </p>
              <p>
                Mon quotidien tourne autour du développement web full-stack : interfaces React soignées
                côté front, APIs Node.js robustes côté back. En parallèle, je m'investis dans le
                développement mobile avec <span className="text-accent-light">Flutter / Dart</span> pour
                construire des apps iOS natives.
              </p>
              <p>
                Au-delà du code, je suis passionné par le sport mécanique (moto sportive), la musique
                (R&B, rock, metal, funk) et le fitness. Ces disciplines m'apportent rigueur,
                persévérance et équilibre.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-c-border">
              {stats.map(({ value, label, icon: Icon }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <Icon size={18} className="text-accent mb-1" />
                  <span className="font-serif text-xl font-bold text-c-text">{value}</span>
                  <span className="text-[11px] text-c-muted leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Langues */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-c-muted mb-3">Langues</p>
              <div className="flex gap-3 flex-wrap">
                {languages.map(({ lang, level, flag }) => (
                  <div
                    key={lang}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-elevated border border-c-border"
                  >
                    <span className="text-base">{flag}</span>
                    <div>
                      <p className="text-xs font-medium text-c-text">{lang}</p>
                      <p className="text-[10px] text-c-muted">{level}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
