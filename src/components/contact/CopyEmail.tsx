'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

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
    <button
      type="button"
      onClick={copy}
      className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full border border-ink px-5 text-sm transition-colors hover:border-orange hover:bg-orange"
    >
      {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
      {copied ? 'Copiée' : 'Copier l’adresse'}
      <span role="status" className="sr-only">
        {copied ? 'Adresse e-mail copiée' : ''}
      </span>
    </button>
  )
}
