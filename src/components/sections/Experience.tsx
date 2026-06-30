import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'
import { TimelineItem } from '../ui/TimelineItem'
import { experiences } from '../../data/experience'

// Couleur du badge selon le type de contrat
const badgeColors: Record<string, string> = {
  CDI: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Stage: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  Alternance: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Freelance: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
}

export function Experience() {
  return (
    <SectionWrapper id="experience" className="bg-bg">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader
          number="04"
          title="Expériences"
          subtitle="Stages et emplois étudiants qui ont façonné mon sens du concret et du travail en équipe."
        />

        <div className="max-w-2xl">
          {experiences.map((exp, i) => (
            <TimelineItem
              key={exp.id}
              index={i}
              period={exp.period}
              title={exp.role}
              subtitle={exp.company}
              location={exp.location}
              badge={exp.type}
              badgeColor={badgeColors[exp.type]}
              current={exp.current}
            >
              {/* Liste des missions */}
              <ul className="flex flex-col gap-1.5 mt-2">
                {exp.description.map(item => (
                  <li key={item} className="flex items-start gap-2 text-sm text-c-muted">
                    <span className="mt-1.5 w-1 h-1 rounded-full bg-accent/50 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </TimelineItem>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
