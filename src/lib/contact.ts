export const CONTACT_LIMITS = {
  name: 100,
  email: 200,
  message: 5000,
} as const

/** Le formulaire n'est proposé que si un service d'envoi est réellement configuré côté serveur. */
export function isContactFormEnabled() {
  return Boolean(process.env.RESEND_API_KEY)
}
