import { site } from '@/lib/constants'
import { getLatestActivity } from '@/lib/github'
import { Hero } from '@/components/home/Hero'
import { IndexSection, Presentation, SelectedWork, StackSection } from '@/components/home/HomeSections'
import { PageTransition } from '@/components/ui/PageTransition'

const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  image: `${site.url}${site.photoUrl}`,
  address: { '@type': 'PostalAddress', addressLocality: 'Lyon', addressCountry: 'FR' },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'Ynov Campus Lyon' },
  sameAs: [site.github, site.linkedin],
  knowsAbout: ['React', 'TypeScript', 'Node.js', 'Express', 'Développement web full-stack'],
}

export default async function Home() {
  const latest = await getLatestActivity()

  return (
    <PageTransition>
      <main id="main">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, '\\u003c') }}
        />
        <Hero latest={latest} />
        <Presentation />
        <SelectedWork />
        <IndexSection />
        <StackSection />
      </main>
    </PageTransition>
  )
}
