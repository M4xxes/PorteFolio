'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader2, Check, AlertCircle } from 'lucide-react'
import { DotGridCanvas } from '@/components/ui/DotGridCanvas'
import { site, easing } from '@/lib/constants'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? 'Une erreur est survenue.')
      }
      setStatus('success')
      form.reset()
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="relative z-20 overflow-hidden bg-bg px-6 py-32 sm:px-10 lg:px-20">
      <DotGridCanvas />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-transparent to-bg" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.8, ease: easing.smooth }}
        className="relative mx-auto max-w-2xl"
      >
        <span className="block text-center font-sans text-xs uppercase tracking-[0.4em] text-accent">
          Contact
        </span>
        <h2 className="mt-4 text-center font-serif text-4xl text-fg sm:text-5xl">
          Un projet en tête ?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-center font-sans text-sm text-fg-muted">
          Que ce soit pour une opportunité, une question ou juste discuter — n&apos;hésite pas.
        </p>

        <form onSubmit={handleSubmit} className="mt-14 flex flex-col gap-8">
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="group flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-wide text-fg-muted">
                Nom
              </span>
              <input
                name="name"
                type="text"
                required
                className="border-b border-border-soft bg-transparent py-2 font-sans text-fg outline-none transition-colors focus:border-accent"
                placeholder="Ton nom"
              />
            </label>
            <label className="group flex flex-col gap-2">
              <span className="font-sans text-xs uppercase tracking-wide text-fg-muted">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                className="border-b border-border-soft bg-transparent py-2 font-sans text-fg outline-none transition-colors focus:border-accent"
                placeholder="ton@email.com"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="font-sans text-xs uppercase tracking-wide text-fg-muted">
              Message
            </span>
            <textarea
              name="message"
              required
              rows={4}
              className="resize-none border-b border-border-soft bg-transparent py-2 font-sans text-fg outline-none transition-colors focus:border-accent"
              placeholder="Parle-moi de ton projet..."
            />
          </label>

          <div className="flex items-center justify-between gap-4">
            <div className="font-sans text-xs text-fg-muted" aria-live="polite">
              {status === 'success' && (
                <span className="flex items-center gap-1.5 text-accent">
                  <Check size={14} /> Message envoyé, merci !
                </span>
              )}
              {status === 'error' && (
                <span className="flex items-center gap-1.5 text-red-400">
                  <AlertCircle size={14} /> {errorMessage}
                </span>
              )}
            </div>

            <motion.button
              type="submit"
              data-cursor-hover
              disabled={status === 'loading'}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-bg transition-opacity disabled:opacity-60"
            >
              {status === 'loading' ? (
                <>
                  Envoi <Loader2 size={16} className="animate-spin" />
                </>
              ) : (
                <>
                  Envoyer
                  <motion.span
                    className="inline-flex"
                    whileHover={{ x: 4, y: -4, rotate: 25 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                  >
                    <Send size={16} />
                  </motion.span>
                </>
              )}
            </motion.button>
          </div>
        </form>

        <p className="mt-16 text-center font-sans text-xs text-fg-muted">
          Ou directement par email :{' '}
          <a href={`mailto:${site.email}`} data-cursor-hover className="text-fg underline underline-offset-4">
            {site.email}
          </a>
        </p>
      </motion.div>
    </section>
  )
}
