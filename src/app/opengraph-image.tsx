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
          background: '#f1ece2',
          color: '#151311',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#6a635a' }}>
          <span>Portfolio 2026</span>
          <span>Lyon, France</span>
        </div>
        <div style={{ display: 'flex', fontSize: 190, fontWeight: 800, letterSpacing: -10, lineHeight: 0.85 }}>
          <span>Maxime Pero</span>
          <span style={{ color: '#e0602a' }}>.</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '3px solid #151311', paddingTop: 24 }}>
          <span style={{ fontSize: 40 }}>Développeur full-stack</span>
          <span style={{ fontSize: 24, color: '#6a635a' }}>React · TypeScript · Node.js</span>
        </div>
      </div>
    ),
    size
  )
}
