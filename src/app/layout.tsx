import type { Metadata, Viewport } from 'next'
import { Doto, JetBrains_Mono, Newsreader } from 'next/font/google'
import localFont from 'next/font/local'
// Import ciblé : `geist/font/pixel` déclarerait (et préchargerait) les 5 variantes de la police.
import { GeistPixelSquare } from 'geist/font/pixel/square'
import './globals.css'
import { ScrollEngine } from '@/components/shell/ScrollEngine'
import { Header } from '@/components/shell/Header'
import { Cursor } from '@/components/shell/Cursor'
import { Stage } from '@/components/stage/Stage'
import { ChromeGate } from '@/components/shell/ChromeGate'
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

// Police de l'accueil (interface en monospace), auto-hébergée par next/font.
const hubMono = JetBrains_Mono({
  variable: '--font-hub',
  subsets: ['latin'],
  display: 'swap',
})

// Serif des titres et descriptions des pages projet.
const serif = Newsreader({
  variable: '--font-serif',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — développeur web à Lyon`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: `${site.name} — Portfolio`,
  authors: [{ name: site.name, url: site.github }],
  creator: site.name,
  keywords: ['Maxime Pero', 'Maxxes', 'développeur web', 'développeur full-stack', 'creative developer', 'Lyon', 'React', 'TypeScript', 'Node.js', 'portfolio', 'freelance', 'CDI'],
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
    // suppressHydrationWarning : le script de démarrage pose `class="js"` sur <html> avant l'hydratation.
    <html lang="fr" suppressHydrationWarning className={`${GeistPixelSquare.variable} ${departure.variable} ${doto.variable} ${hubMono.variable} ${serif.variable}`}>
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
          <Stage />
          <div id="site">
            <ChromeGate>
              <Header />
            </ChromeGate>
            {children}
            <ChromeGate>
              <Footer />
            </ChromeGate>
          </div>
          <ChromeGate>
            <Cursor />
          </ChromeGate>
        </ScrollEngine>
        <ChromeGate>
          <div aria-hidden className="grain" />
        </ChromeGate>
      </body>
    </html>
  )
}
