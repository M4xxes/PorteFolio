'use client'

import { useRef, useState } from 'react'
import { site } from '@/lib/constants'

type Status = 'idle' | 'sending' | 'ok' | 'error'
const SUBJECTS = ['Poste / CDI', 'Création de site', 'Mission freelance', 'Autre']

/** Coordonnées directes + formulaire Netlify Forms (envoi en fetch, sans backend). */
export function ContactBlock() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const timer = useRef(0)
  const form = useRef<HTMLFormElement>(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${site.email}`
    }
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = form.current!
    if (!f.checkValidity()) {
      f.reportValidity()
      return
    }
    const data = new FormData(f)
    const body = new URLSearchParams()
    data.forEach((v, k) => body.append(k, String(v)))
    setStatus('sending')
    try {
      // Netlify détecte le formulaire via public/__forms.html : c'est cette adresse qui reçoit les soumissions.
      const res = await fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('ok')
      f.reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="ab-contact">
      <div className="ab-direct">
        <p className="ab-lead">Un poste, un projet de site ou juste une question ? Écris-moi, je réponds sous 24–48 h.</p>
        <dl className="ab-dl">
          <dt>email</dt>
          <dd>
            <a href={`mailto:${site.email}`}>{site.email}</a>{' '}
            <button type="button" className="ab-copy" onClick={copy} aria-label="Copier l’adresse e-mail">
              {copied ? 'copié ✓' : 'Copier'}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {copied ? 'Adresse copiée' : ''}
            </span>
          </dd>
          <dt>linkedin</dt>
          <dd>
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              linkedin.com/in/maximepero-b320a3356
            </a>
          </dd>
          <dt>github</dt>
          <dd>
            <a href={site.github} target="_blank" rel="noreferrer">
              github.com/{site.githubUser}
            </a>
          </dd>
          <dt>localisation</dt>
          <dd>Lyon, France, dispo en remote</dd>
        </dl>
        <p className="ab-badge">
          <span aria-hidden className="ab-dot" /> disponible : CDI &amp; freelance
        </p>
      </div>

      <form ref={form} className="ab-form" name="contact" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={submit} noValidate>
        <input type="hidden" name="form-name" value="contact" />
        <p className="sr-only">
          <label>
            Ne pas remplir : <input name="bot-field" tabIndex={-1} autoComplete="off" />
          </label>
        </p>
        <label>
          <span>nom</span>
          <input name="name" type="text" required autoComplete="name" />
        </label>
        <label>
          <span>email</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          <span>sujet</span>
          <select name="subject" defaultValue="">
            <option value="">—</option>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>message</span>
          <textarea name="message" rows={6} required />
        </label>
        <button type="submit" className="ab-send" disabled={status === 'sending'}>
          {status === 'sending' ? 'envoi…' : 'envoyer_'}
        </button>
        <p className="ab-msg" role="status" aria-live="polite" data-status={status}>
          {status === 'ok' && 'Message envoyé. Je reviens vers toi rapidement.'}
          {status === 'error' && (
            <>
              L’envoi a échoué. Écris-moi directement : <a href={`mailto:${site.email}`}>{site.email}</a>
            </>
          )}
        </p>
      </form>
    </div>
  )
}
