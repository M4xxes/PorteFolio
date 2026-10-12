'use client'

import { useState } from 'react'
import { AlertCircle, Check, Loader2, Send } from 'lucide-react'
import { CONTACT_LIMITS } from '@/lib/contact'

type Status = 'idle' | 'loading' | 'success' | 'error'

const fieldClass =
  'w-full border-0 border-b-2 border-line-strong bg-transparent px-0 py-3 text-lg text-ink placeholder:text-subtle transition-colors outline-none focus:border-orange'

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
          <label htmlFor="contact-name" className="label text-muted">
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
          <label htmlFor="contact-email" className="label text-muted">
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
        <label htmlFor="contact-message" className="label text-muted">
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
          placeholder="Parlez-moi de votre projet, de l’alternance proposée…"
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
            <span className="flex items-center gap-2 text-ink">
              <Check size={16} aria-hidden className="text-orange-ink" /> Message envoyé, merci !
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-2 text-[#a12a12]">
              <AlertCircle size={16} aria-hidden /> {error}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-medium text-cream transition-[background-color,color,transform] hover:bg-orange hover:text-ink active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
        >
          {status === 'loading' ? (
            <>
              Envoi en cours <Loader2 size={16} aria-hidden className="animate-spin" />
            </>
          ) : (
            <>
              Envoyer le message
              <Send size={16} aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
