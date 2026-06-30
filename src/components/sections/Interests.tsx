import {
  Gauge, Music, Dumbbell, Mountain, type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'
import { interests } from '../../data/interests'

const iconMap: Record<string, LucideIcon> = {
  Gauge, Music, Dumbbell, Mountain,
}

export function Interests() {
  return (
    <SectionWrapper id="interests" className="bg-bg">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader
          number="06"
          title="Centres d'intérêt"
          subtitle="Ce qui me ressource et construit mon caractère en dehors du code."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {interests.map((item, i) => {
            const Icon = iconMap[item.iconName] ?? Gauge
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl
                           bg-elevated border border-c-border
                           hover:border-accent/40 hover:shadow-accent-md transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center
                                group-hover:bg-accent/18 transition-colors">
                  <Icon size={22} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-c-text">{item.label}</p>
                  {item.description && (
                    <p className="text-[11px] text-c-muted mt-1 leading-snug">{item.description}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </SectionWrapper>
  )
}
