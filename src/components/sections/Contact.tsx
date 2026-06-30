import { useState, type FormEvent } from 'react'
import { Mail, Phone, Github, MapPin, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SectionWrapper, SectionHeader } from '../ui/SectionWrapper'

type Status = 'idle' | 'sending' | 'success' | 'error'

const CONTACT_INFO = [
  { icon: Mail, label: 'Email', value: 'maxime.pero@ynov.com', href: 'mailto:maxime.pero@ynov.com' },
  { icon: Phone, label: 'Téléphone', value: '07 86 56 90 51', href: 'tel:+33786569051' },
  { icon: Github, label: 'GitHub', value: 'github.com/M4xxes', href: 'https://github.com/M4xxes' },
  { icon: MapPin, label: 'Localisation', value: 'Lyon, France', href: undefined },
]

export function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    try {
      /*
       * Formspree : remplacez l'URL ci-dessous par votre endpoint Formspree.
       * Inscription gratuite sur https://formspree.io → créez un formulaire → copiez l'URL.
       * En attendant, le formulaire utilise un fallback mailto.
       */
      const FORMSPREE_URL = 'https://formspree.io/f/mojonpjg'

      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        throw new Error('Erreur serveur')
      }
    } catch {
      // Fallback : ouvre le client mail natif
      const subject = encodeURIComponent(formData.subject || 'Contact depuis le portfolio')
      const body = encodeURIComponent(`Nom : ${formData.name}\n\n${formData.message}`)
      window.location.href = `mailto:maxime.pero@ynov.com?subject=${subject}&body=${body}`
      setStatus('idle')
    }
  }

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-elevated border border-c-border text-c-text text-sm placeholder:text-c-muted/50 focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/30 transition-colors'

  return (
    <SectionWrapper id="contact" className="bg-surface">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <SectionHeader
          number="07"
          title="Contact"
          subtitle="Un projet, une question, une opportunité ? Parlons-en."
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* Infos de contact */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <p className="text-c-muted text-sm leading-relaxed">
              Disponible pour des missions freelance, des stages ou des projets collaboratifs.
              N'hésitez pas à me contacter directement.
            </p>

            <ul className="flex flex-col gap-4">
              {CONTACT_INFO.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0
                                      group-hover:bg-accent/18 transition-colors">
                        <Icon size={15} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-c-muted uppercase tracking-widest font-medium">{label}</p>
                        <p className="text-sm text-c-text group-hover:text-accent transition-colors">{value}</p>
                      </div>
                    </a>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-c-muted uppercase tracking-widest font-medium">{label}</p>
                        <p className="text-sm text-c-text">{value}</p>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* Permis */}
            <div className="flex gap-2 flex-wrap pt-2">
              {['Permis B', 'Permis A'].map(p => (
                <span key={p} className="text-[11px] px-3 py-1 rounded-full border border-c-border text-c-muted">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-3"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Formulaire de contact">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-[11px] font-medium text-c-muted mb-1.5 uppercase tracking-widest">
                    Nom *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="Votre nom"
                    value={formData.name}
                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[11px] font-medium text-c-muted mb-1.5 uppercase tracking-widest">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-[11px] font-medium text-c-muted mb-1.5 uppercase tracking-widest">
                  Sujet
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Objet du message"
                  value={formData.subject}
                  onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-[11px] font-medium text-c-muted mb-1.5 uppercase tracking-widest">
                  Message *
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  placeholder="Votre message..."
                  value={formData.message}
                  onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <motion.button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                whileHover={{ scale: status === 'idle' ? 1.02 : 1 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl font-semibold text-sm
                           bg-accent text-white hover:bg-accent-dark disabled:opacity-60 disabled:cursor-not-allowed
                           transition-colors shadow-accent-sm"
              >
                {status === 'sending' ? (
                  <><span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Envoi…</>
                ) : (
                  <><Send size={15} /> Envoyer le message</>
                )}
              </motion.button>

              {/* Feedback d'envoi */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-sm"
                  >
                    <CheckCircle size={16} />
                    Message envoyé — je vous réponds rapidement !
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
                  >
                    <AlertCircle size={16} />
                    Erreur lors de l'envoi. Essayez par email directement.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
