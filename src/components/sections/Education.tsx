import { Award } from 'lucide-react'
import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'
import { TimelineItem } from '../ui/TimelineItem'
import { education } from '../../data/education'

export function Education() {
  return (
    <SectionWrapper id="education" className="bg-surface">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader
          number="05"
          title="Formation"
          subtitle="Parcours académique en informatique, de Lyon à demain."
        />

        <div className="max-w-2xl">
          {education.map((edu, i) => (
            <TimelineItem
              key={edu.id}
              index={i}
              period={edu.period}
              title={edu.degree}
              subtitle={edu.school}
              location={edu.location}
              current={edu.current}
            >
              {edu.description && (
                <p className="text-sm text-c-muted mt-1">{edu.description}</p>
              )}
              {edu.certification && (
                <div className="flex items-start gap-2 mt-3 p-3 rounded-lg bg-accent/8 border border-accent/20">
                  <Award size={14} className="text-accent shrink-0 mt-0.5" />
                  <span className="text-xs text-accent-light leading-snug">{edu.certification}</span>
                </div>
              )}
            </TimelineItem>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
