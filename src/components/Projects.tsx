import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Github, ExternalLink } from 'lucide-react';

const projects = [
  {
    title: 'CharityGift',
    description: 'Plateforme qui regroupe des associations caritatives pour faciliter les dons',
    tech: ['HTML', 'CSS', 'JavaScript'],
    github: 'https://github.com/M4xxes'
  },
  {
    title: 'Groupie Tracker',
    description: 'Jeux musicaux : blind test, petit bac musical, etc.',
    tech: ['GO', 'HTML', 'JavaScript'],
    github: 'https://github.com/M4xxes'
  },
  {
    title: 'Projet Forum',
    description: 'Forum pour motards afin d\'echanger, vendre et partager leur passion',
    tech: ['HTML', 'CSS', 'MariaDB'],
    github: 'https://github.com/M4xxes'
  }
];

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section ref={ref} id="projects" className="py-20 px-4 md:px-20">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-2xl font-mono text-blue-500 mb-12"
        >
          Projets
        </motion.h2>

        <div className="space-y-20">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="group relative bg-[#1a1a1a] p-8 rounded-lg hover:bg-[#222222] transition-colors duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-gray-200 group-hover:text-blue-500 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 max-w-xl">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4 md:flex-col">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Github size={24} />
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <ExternalLink size={24} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects