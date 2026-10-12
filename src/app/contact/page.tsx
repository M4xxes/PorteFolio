import type { Metadata } from 'next'
import { ArrowDown, ArrowUpRight, Mail } from 'lucide-react'
import { site } from '@/lib/constants'
import { isContactFormEnabled } from '@/lib/contact'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { PageIntro } from '@/components/ui/PageIntro'
import { PageTransition } from '@/components/ui/PageTransition'
import { Container, Label } from '@/components/ui/Section'
import { ContactForm } from '@/components/contact/ContactForm'
import { CopyEmail } from '@/components/contact/CopyEmail'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contacter Maxime Pero, développeur full-stack à Lyon : alternance, projet freelance ou simple échange.',
  alternates: { canonical: '/contact' },
}

const profiles = [
  { label: 'LinkedIn', handle: 'maxime-pero', href: site.linkedin },
  { label: 'GitHub', handle: 'Code source & dépôts', href: site.github },
]

export default function ContactPage() {
  const formEnabled = isContactFormEnabled()

  return (
    <PageTransition>
      <main id="main">
        <PageIntro
          index="03"
          label="Contact"
          meta={site.location}
          title={
            <>
              Écrivez<span className="text-orange">-</span>moi.
            </>
          }
          lead="Une alternance, une mission freelance, une question sur un projet ou simplement l’envie d’échanger : le plus simple reste un e-mail."
          aside={
            <p className="label flex items-center gap-2 text-muted">
              <span aria-hidden className="h-2 w-2 rounded-full bg-orange" />
              {site.availability}
            </p>
          }
        />

        <section aria-label="E-mail" className="border-b border-line py-16 sm:py-24">
          <Container>
            <Label index="A" className="text-muted">
              Adresse e-mail
            </Label>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <a
                href={`mailto:${site.email}`}
                className="display group relative min-w-0 break-all text-[clamp(2rem,6.8vw,6.5rem)] leading-none transition-colors hover:text-orange-ink"
              >
                {site.email}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-0 h-[3px] w-full origin-left bg-orange transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-50"
                />
              </a>
              <CopyEmail email={site.email} />
            </div>
          </Container>
        </section>

        <section aria-label="Autres moyens de contact" className="py-16 sm:py-24">
          <Container className="grid gap-16 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <Label index="B" className="text-muted">
                Profils
              </Label>
              <ul className="mt-8 border-t-2 border-ink">
                {profiles.map((p) => (
                  <li key={p.label} className="border-b border-line">
                    <a href={p.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-6">
                      <span>
                        <span className="display block text-4xl transition-colors group-hover:text-orange-ink">{p.label}</span>
                        <span className="label mt-1 block text-[10px] text-muted">{p.handle}</span>
                      </span>
                      <ArrowUpRight size={24} aria-hidden className="transition-transform duration-300 group-hover:rotate-45" />
                      <span className="sr-only">(nouvel onglet)</span>
                    </a>
                  </li>
                ))}
                <li className="border-b border-line">
                  <a href={site.cvUrl} download className="group flex items-center justify-between gap-4 py-6">
                    <span>
                      <span className="display block text-4xl transition-colors group-hover:text-orange-ink">CV</span>
                      <span className="label mt-1 block text-[10px] text-muted">PDF · 177 Ko</span>
                    </span>
                    <ArrowDown size={24} aria-hidden className="transition-transform duration-300 group-hover:translate-y-1" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-6 lg:col-start-7">
              <Label index="C" className="text-muted">
                Formulaire
              </Label>
              {formEnabled ? (
                <div className="mt-8">
                  <ContactForm />
                </div>
              ) : (
                <div className="mt-8 bg-paper p-8 sm:p-10">
                  <h2 className="display text-4xl">Pas de formulaire ici.</h2>
                  <p className="mt-4 max-w-md leading-relaxed text-muted">
                    Le service d’envoi de messages n’est pas activé sur ce site : plutôt qu’un formulaire qui ne
                    partirait nulle part, écrivez-moi directement à l’adresse ci-dessus.
                  </p>
                  <div className="mt-8">
                    <ButtonLink href={`mailto:${site.email}`} icon={<Mail size={16} />}>
                      Écrire un e-mail
                    </ButtonLink>
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      </main>
    </PageTransition>
  )
}
