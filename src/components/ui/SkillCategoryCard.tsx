import {
  Monitor, Server, Smartphone, Database, Wrench, Users,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import type { SkillCategory } from '../../types'

// Map des icônes lucide-react par nom
const iconMap: Record<string, LucideIcon> = {
  Monitor, Server, Smartphone, Database, Wrench, Users,
}

// Labels de niveau avec couleurs associées
const levelColors: Record<string, string> = {
  débutant: 'bg-slate-500/20 text-slate-400',
  intermédiaire: 'bg-sky-500/20 text-sky-400',
  avancé: 'bg-accent/15 text-accent-light',
  expert: 'bg-emerald-500/20 text-emerald-400',
}

interface Props {
  category: SkillCategory
  index: number
}

export function SkillCategoryCard({ category, index }: Props) {
  const Icon = iconMap[category.iconName] ?? Monitor

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-elevated border border-c-border rounded-2xl p-6
                 hover:border-accent/35 hover:shadow-accent-md transition-all duration-300"
    >
      {/* En-tête catégorie */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center
                        group-hover:bg-accent/15 transition-colors">
          <Icon size={17} className="text-accent" />
        </div>
        <h3 className="text-sm font-semibold tracking-widest uppercase text-c-muted">{category.label}</h3>
      </div>

      {/* Liste des compétences */}
      <ul className="flex flex-col gap-2.5">
        {category.skills.map(skill => (
          <li key={skill.name} className="flex items-center justify-between gap-2">
            <span className="text-sm text-c-text">{skill.name}</span>
            {skill.level && (
              <span className={`text-[10px] px-2 py-0.5 rounded font-medium tracking-wide ${levelColors[skill.level]}`}>
                {skill.level}
              </span>
            )}
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
