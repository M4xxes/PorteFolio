import { ImageResponse } from 'next/og'
import { site } from '@/lib/constants'

export const alt = `${site.name} — développeur full-stack à Lyon`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 72px',
          background: '#0c0c0e',
          color: '#edede8',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#9a9a94' }}>
          <span>Portfolio 2026</span>
          <span>Lyon, France</span>
        </div>
        <div style={{ display: 'flex', fontSize: 170, fontWeight: 700, letterSpacing: -6, lineHeight: 0.9, textTransform: 'uppercase' }}>
          <span>Maxime Pero</span>
          <span style={{ color: '#d4ff3a' }}>.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid rgba(237,237,232,0.32)', paddingTop: 24 }}>
          <span style={{ fontSize: 34, letterSpacing: 3, textTransform: 'uppercase' }}>[00] Développeur full-stack</span>
          <span style={{ fontSize: 24, color: '#9a9a94' }}>React · TypeScript · Node.js</span>
        </div>
      </div>
    ),
    size
  )
}
