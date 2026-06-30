import { motion } from 'framer-motion'
import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'
import { ProjectCard } from '../ui/ProjectCard'
import { projects } from '../../data/projects'
import { Github } from 'lucide-react'

export function Projects() {
  return (
    <SectionWrapper id="projects" className="bg-surface">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader
          number="03"
          title="Projets"
          subtitle="Réalisations concrètes — sites vitrine, interfaces industrielles et apps mobiles."
        />

        {/* Grille de projets — extensible en ajoutant des entrées dans data/projects.ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Lien vers GitHub */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-12"
        >
          <a
            href="https://github.com/M4xxes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl border border-c-border
                       bg-elevated text-c-muted text-sm font-medium
                       hover:border-accent/50 hover:text-accent transition-colors duration-200"
          >
            <Github size={16} />
            Voir tous mes projets sur GitHub
          </a>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
