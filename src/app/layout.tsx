import type { Metadata, Viewport } from 'next'
import { Doto } from 'next/font/google'
import localFont from 'next/font/local'
import { GeistPixelSquare } from 'geist/font/pixel'
import './globals.css'
import { ScrollEngine } from '@/components/shell/ScrollEngine'
import { Header } from '@/components/shell/Header'
import { Cursor } from '@/components/shell/Cursor'
import { BootScreen } from '@/components/shell/BootScreen'
import { bootScript } from '@/components/shell/bootScript'
import { Footer } from '@/components/sections/Footer'
import { InlineScript } from '@/components/ui/InlineScript'
import { site } from '@/lib/constants'

// Trois familles, sous licence SIL OFL, auto-hébergées par next/font (aucune requête externe côté visiteur).
// Titres : Geist Pixel (Square). Interface et lecture : Departure Mono. Chiffres : Doto.
const departure = localFont({
  src: './fonts/DepartureMono-Regular.woff2',
  variable: '--font-departure',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
})

const doto = Doto({
  variable: '--font-doto-var',
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
  themeColor: '#0c0c0e',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // suppressHydrationWarning : le script de démarrage pose `class="js"` et `data-boot` sur <html> avant l'hydratation.
    <html lang="fr" suppressHydrationWarning className={`${GeistPixelSquare.variable} ${departure.variable} ${doto.variable}`}>
      <head>
        <InlineScript html={bootScript} />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="ui sr-only bg-accent px-4 py-3 text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400]"
        >
          Aller au contenu
        </a>
        <ScrollEngine>
          <BootScreen />
          <div id="site">
            <Header />
            {children}
            <Footer />
          </div>
          <Cursor />
        </ScrollEngine>
        <div aria-hidden className="grain" />
      </body>
    </html>
  )
}
