'use client'

import { useState } from 'react'
import { CONTACT_LIMITS } from '@/lib/contact'
import { G } from '@/components/ui/Glyph'

type Status = 'idle' | 'loading' | 'success' | 'error'

const fieldClass =
  'w-full border-0 border-b border-line-strong bg-transparent px-0 py-3 text-base text-fg placeholder:text-fg-3 transition-colors outline-none focus:border-accent focus:shadow-[0_1px_0_0_var(--accent)] focus-visible:outline-none'

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error ?? 'Une erreur est survenue. Réessayez plus tard.')
      setStatus('success')
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez plus tard.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-name" className="ui text-fg-2">
            Nom
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={CONTACT_LIMITS.name}
            className={fieldClass}
            placeholder="Votre nom"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-email" className="ui text-fg-2">
            E-mail
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={CONTACT_LIMITS.email}
            className={fieldClass}
            placeholder="vous@exemple.com"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="ui text-fg-2">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          minLength={10}
          maxLength={CONTACT_LIMITS.message}
          className={`${fieldClass} resize-y`}
          placeholder="L’alternance proposée, votre projet, vos délais…"
        />
      </div>

      {/* Champ piège anti-spam : invisible pour les humains, rempli par les robots */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Site web</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div role="status" aria-live="polite" className="min-h-5 text-sm">
          {status === 'success' && (
            <span className="ui text-fg">
              <span aria-hidden className="text-accent">[✓]</span> Message envoyé, merci.
            </span>
          )}
          {status === 'error' && (
            <span className="ui text-[#ff8a7a]"><G>[!]</G> {error}</span>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="ui press inline-flex min-h-11 items-center justify-center gap-3 bg-accent px-5 py-4 tracking-[0.1em] text-accent-ink disabled:cursor-wait disabled:opacity-60"
        >
          {status === 'loading' ? 'ENVOI…' : <><G>[→]</G> ENVOYER LE MESSAGE</>}
        </button>
      </div>
    </form>
  )
}
