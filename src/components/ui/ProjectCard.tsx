import { ExternalLink, Github, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Project } from '../../types'

interface ProjectCardProps {
  project: Project
  index: number
}

// Badge de statut du projet
function StatusBadge({ status }: { status: Project['status'] }) {
  const map = {
    completed: { label: 'Terminé', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    'in-progress': { label: 'En cours', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    concept: { label: 'Concept', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  }
  const { label, color } = map[status]
  return (
    <span className={`text-[10px] font-medium tracking-widest uppercase px-2 py-0.5 rounded border ${color}`}>
      {label}
    </span>
  )
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative flex flex-col bg-elevated border border-c-border rounded-2xl overflow-hidden
                 shadow-card hover:shadow-card-hover hover:border-accent/40 transition-all duration-300"
    >
      {/* Bande supérieure colorée / placeholder image */}
      <div className="relative h-44 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent overflow-hidden">
        {/* Motif de fond décoratif */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(139,92,246,0.18) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Si l'image de projet existe */}
        {project.image && (
          <img
            src={project.image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Numéro décoratif */}
        <span className="absolute top-4 left-4 font-mono text-5xl font-bold text-accent/10 select-none">
          {String(index + 1).padStart(2, '0')}
        </span>

        {/* Flèche hover */}
        <motion.div
          initial={{ opacity: 0, x: -8, y: 8 }}
          whileHover={{ opacity: 1, x: 0, y: 0 }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-accent/90 flex items-center justify-center
                     opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <ArrowUpRight size={16} className="text-white" />
        </motion.div>
      </div>

      {/* Contenu */}
      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl text-c-text font-semibold leading-snug group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-c-muted text-sm leading-relaxed flex-1">{project.description}</p>

        {/* Stack technique */}
        <div className="flex flex-wrap gap-2">
          {project.stack.map(tech => (
            <span
              key={tech}
              className="text-[11px] px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent-light font-medium tracking-wide"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Liens */}
        <div className="flex gap-3 pt-2 border-t border-c-border">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Code source de ${project.title} sur GitHub`}
              className="flex items-center gap-1.5 text-xs text-c-muted hover:text-accent transition-colors duration-150"
            >
              <Github size={14} />
              Code source
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Démo live de ${project.title}`}
              className="flex items-center gap-1.5 text-xs text-c-muted hover:text-accent transition-colors duration-150 ml-auto"
            >
              Voir la démo
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Bordure luminescente au hover */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-accent/0 group-hover:ring-accent/30 transition-all duration-300 pointer-events-none" />
    </motion.article>
  )
}
