import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const CONTACT_TO_EMAIL = 'contact@neptune-papers.com'

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL ?? 'Neptune Contact <onboarding@resend.dev>'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email and message are required.' },
        { status: 400 }
      )
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isEmailValid) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    if (!resendApiKey) {
      console.error('[contact] Missing RESEND_API_KEY')
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 })
    }

    const resend = new Resend(resendApiKey)

    const result = await resend.emails.send({
      from: getFromEmail(),
      to: [CONTACT_TO_EMAIL],
      replyTo: email,
      subject: `New contact form message from ${email}`,
      text: `From: ${email}\n\nMessage:\n${message}`,
    })

    if (result.error) {
      console.error('[contact] Resend error:', result.error)
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
