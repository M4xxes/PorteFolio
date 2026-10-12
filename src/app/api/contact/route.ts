import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { site } from '@/lib/constants'
import { CONTACT_LIMITS, isContactFormEnabled } from '@/lib/contact'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  // Champ piège : un robot l'a rempli, on fait comme si l'envoi avait réussi.
  if (asTrimmedString(body.website)) {
    return NextResponse.json({ success: true })
  }

  const name = asTrimmedString(body.name)
  const email = asTrimmedString(body.email)
  const message = asTrimmedString(body.message)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 })
  }
  if (
    name.length > CONTACT_LIMITS.name ||
    email.length > CONTACT_LIMITS.email ||
    message.length > CONTACT_LIMITS.message
  ) {
    return NextResponse.json({ error: 'Un des champs est trop long.' }, { status: 400 })
  }

  if (!isContactFormEnabled()) {
    console.error('RESEND_API_KEY is not configured.')
    return NextResponse.json(
      { error: `Le formulaire est indisponible. Écrivez-moi directement à ${site.email}.` },
      { status: 503 }
    )
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? 'Portfolio <onboarding@resend.dev>',
      to: site.email,
      replyTo: email,
      subject: `Nouveau message de ${name.replace(/[\r\n]+/g, ' ')} — portfolio`,
      text: `${message}\n\n— ${name} (${email})`,
    })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend send failed:', error)
    return NextResponse.json(
      { error: `L’envoi a échoué. Réessayez plus tard ou écrivez à ${site.email}.` },
      { status: 502 }
    )
  }
}
