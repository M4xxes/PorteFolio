import { site } from '@/lib/constants'
import { EyeEntry } from '@/components/intro/EyeEntry'
import { PageTransition } from '@/components/ui/PageTransition'

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  address: { '@type': 'PostalAddress', addressLocality: 'Lyon', addressCountry: 'FR' },
  sameAs: [site.github, site.linkedin],
  knowsAbout: ['React', 'TypeScript', 'Node.js', 'Express', 'Flutter', 'Développement web full-stack'],
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
      </main>
    </PageTransition>
  )
}
