import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Intro } from '@/components/intro/Intro'
import { introBootScript } from '@/components/intro/introState'
import { InlineScript } from '@/components/ui/InlineScript'
import { site } from '@/lib/constants'

// Polices sous licence SIL Open Font License, auto-hébergées par next/font (aucune requête vers Google côté visiteur).
const bricolage = Bricolage_Grotesque({
  variable: '--font-bricolage',
  subsets: ['latin'],
  axes: ['wdth', 'opsz'],
  display: 'swap',
})

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — développeur full-stack à Lyon`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: `${site.name} — Portfolio`,
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  keywords: ['Maxime Pero', 'développeur full-stack', 'creative developer', 'Lyon', 'React', 'TypeScript', 'Node.js', 'portfolio', 'alternance'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: `${site.name} — Portfolio`,
    title: `${site.name} — ${site.role.toLowerCase()}`,
    description: site.description,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.role.toLowerCase()}`,
    description: site.description,
  },
}

export const viewport: Viewport = {
  themeColor: '#f1ece2',
  colorScheme: 'light',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning : le script d'introduction ajoute `data-intro` sur <html> avant l'hydratation.
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${bricolage.variable} ${geist.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <InlineScript html={introBootScript} />
      </head>
      <body className="min-h-screen bg-cream text-ink">
        <a
          href="#main"
          className="sr-only bg-ink px-4 py-2 text-sm font-medium text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300]"
        >
          Aller au contenu
        </a>
        <SmoothScrollProvider>
          <Intro />
          <div id="site">
            <Header />
            {children}
            <Footer />
          </div>
        </SmoothScrollProvider>
      </body>
    </html>
  )
}
