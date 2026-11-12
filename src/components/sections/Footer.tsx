import { site } from '@/lib/constants'
import { Container } from '@/components/ui/Kit'
import { Clock } from '@/components/shell/Clock'
import { DecodeText } from '@/components/shell/DecodeText'
import { LiteToggle } from '@/components/shell/LiteToggle'
import { Wordmark } from '@/components/shell/Wordmark'
import { EasterEgg } from './EasterEgg'

export function Footer() {
  return (
    <footer className="pb-8 pt-20">
      <Container>
        <div className="border-t border-line pt-10">
          <EasterEgg />
        </div>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-6">
          <Wordmark className="text-[clamp(2rem,6vw,4.5rem)]" />
          <ul className="ui flex flex-wrap gap-x-6 gap-y-2 text-fg-2">
            <li>
              <a href={site.github} target="_blank" rel="noreferrer" className="hover:text-fg">
                <DecodeText text="GITHUB ↗" />
              </a>
            </li>
            <li>
              <a href={site.linkedin} target="_blank" rel="noreferrer" className="hover:text-fg">
                <DecodeText text="LINKEDIN ↗" />
              </a>
            </li>
            <li>
              <a href={site.cvUrl} target="_blank" rel="noreferrer" className="hover:text-fg">
                <DecodeText text="CV ↗" />
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-fg">
                <DecodeText text="E-MAIL" />
              </a>
            </li>
          </ul>
        </div>
        <div className="ui mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-4 text-fg-2">
          <p>© 2026 Maxime Pero — Lyon</p>
          <Clock />
          <LiteToggle />
        </div>
      </Container>
    </footer>
  )
}
