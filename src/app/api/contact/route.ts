import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { site } from '@/lib/constants'

export async function POST(request: Request) {
  const { name, email, message } = await request.json()

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof message !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !message.trim()
  ) {
    return NextResponse.json({ error: 'Tous les champs sont requis.' }, { status: 400 })
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured.')
    return NextResponse.json(
      { error: "Le service d'envoi n'est pas configuré." },
      { status: 500 }
    )
  }

  try {
    const resend = new Resend(apiKey)
    await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: site.email,
      replyTo: email,
      subject: `Nouveau message de ${name} — portfolio`,
      text: `${message}\n\n— ${name} (${email})`,
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend send failed:', error)
    return NextResponse.json({ error: "L'envoi a échoué. Réessaie plus tard." }, { status: 502 })
  }
}
