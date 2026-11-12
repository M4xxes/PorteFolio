import { site } from '@/lib/constants'
import { isContactFormEnabled } from '@/lib/contact'
import { ContactForm } from '@/components/contact/ContactForm'
import { CopyEmail } from '@/components/contact/CopyEmail'
import { Container, Tag } from '@/components/ui/Kit'

export function Contact() {
  const formEnabled = isContactFormEnabled()
  return (
    <section id="contact" aria-labelledby="contact-title" className="py-28 lg:py-40">
      <Container>
        <div className="border-t border-line pt-3">
          <Tag index="05">Contact</Tag>
          <h2 id="contact-title" className="pixel mt-12 text-[clamp(2.75rem,8.5vw,8.5rem)]">
            Une alternance,
            <br />
            un projet ?
          </h2>
        </div>
        <div className="mt-14 grid gap-x-6 gap-y-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-fg-2">Le plus simple : un e-mail avec quelques lignes sur le contexte, le poste ou le projet.</p>
            <a
              href={`mailto:${site.email}`}
              className="ui mt-6 inline-block break-all border-b border-fg pb-1 text-[clamp(0.8125rem,1.4vw,1rem)] hover:text-accent"
            >
              {site.email} ↗
            </a>
            <div className="mt-6">
              <CopyEmail email={site.email} />
            </div>
          </div>
          {formEnabled && (
            <div className="lg:col-span-6 lg:col-start-7">
              <ContactForm />
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
