import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'
import { SkillCategoryCard } from '../ui/SkillCategoryCard'
import { skillCategories } from '../../data/skills'

export function Skills() {
  return (
    <SectionWrapper id="skills" className="bg-bg">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader
          number="02"
          title="Compétences"
          subtitle="Technologies, outils et savoir-faire acquis en formation et sur des projets réels."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillCategories.map((cat, i) => (
            <SkillCategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
