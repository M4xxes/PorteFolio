import { site } from '@/lib/constants'
import { EyeEntry } from '@/components/intro/EyeEntry'
import { Hub } from '@/components/hub/Hub'
import { PageTransition } from '@/components/ui/PageTransition'

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  address: { '@type': 'PostalAddress', addressLocality: 'Lyon', addressCountry: 'FR' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Ynov Campus Lyon' },
  sameAs: [site.github, site.linkedin],
  knowsAbout: ['React', 'TypeScript', 'Node.js', 'Express', 'Développement web full-stack'],
}

export default function Home() {
  return (
    <PageTransition>
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
        />
        <EyeEntry />
        <Hub />
      </main>
    </PageTransition>
  )
}
