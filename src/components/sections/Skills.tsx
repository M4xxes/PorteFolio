import { otherLanguages, skillCategories } from '@/lib/data/skills'
import { Stagger } from '@/components/ui/Stagger'
import { Container, SectionHead } from '@/components/ui/Kit'

const pad = (n: number) => String(n).padStart(2, '0')
const groups = [...skillCategories, { id: 'also', label: 'Aussi pratiqué', skills: otherLanguages }]

/** Compétences en groupes de mots-clés, révélés en cascade (40 ms) à l'entrée dans l'écran. */
export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="py-28 lg:py-40">
      <Container>
        <SectionHead index="03" label="Compétences" title={<span id="skills-title">Ce que j’utilise</span>} />
        <div className="mt-16 grid gap-x-6 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} className="border-t border-line pt-4">
              <h3 className="ui flex items-baseline justify-between text-fg-2">
                {g.label}
                <span className="doto text-2xl text-fg">{pad(g.skills.length)}</span>
              </h3>
              <Stagger className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                {g.skills.map((s, i) => (
                  <li key={s} style={{ '--i': i } as React.CSSProperties} className="pixel text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.1]">
                    {s}
                  </li>
                ))}
              </Stagger>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
