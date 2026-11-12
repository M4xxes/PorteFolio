'use client'

import { useState } from 'react'
import { G } from '@/components/ui/Glyph'

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  return (
    <button type="button" onClick={copy} className="ui press invert-hover inline-flex min-h-11 items-center border border-fg px-4">
      <G>{copied ? '[✓]' : '[ ]'}</G> {copied ? 'COPIÉE' : 'COPIER L’ADRESSE'}
      <span role="status" className="sr-only">
        {copied ? 'Adresse e-mail copiée' : ''}
      </span>
    </button>
  )
}
