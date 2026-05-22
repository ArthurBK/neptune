import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL?.trim() || 'contact@neptune-papers.com'

function getFromEmail(): string | null {
  return process.env.RESEND_FROM_EMAIL?.trim() || process.env.RESEND_FROM?.trim() || null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : ''
    const legacyName = typeof body?.name === 'string' ? body.name.trim() : ''
    const name = [firstName, lastName].filter(Boolean).join(' ') || legacyName
    const email = typeof body?.email === 'string' ? body.email.trim() : ''
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : ''
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : ''
    const message = typeof body?.message === 'string' ? body.message.trim() : ''

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email and message are required.' },
        { status: 400 }
      )
    }

    if (
      name.length > 120 ||
      email.length > 254 ||
      phone.length > 80 ||
      subject.length > 120 ||
      message.length > 5000
    ) {
      return NextResponse.json({ error: 'Message fields are too long.' }, { status: 400 })
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!isEmailValid) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const fromEmail = getFromEmail()

    if (!resendApiKey || !fromEmail) {
      console.error('[contact] Missing Resend configuration')
      return NextResponse.json({ error: 'Email service is not configured.' }, { status: 500 })
    }

    const resend = new Resend(resendApiKey)

    const result = await resend.emails.send({
      from: fromEmail,
      to: [CONTACT_TO_EMAIL],
      replyTo: email,
      subject: subject ? `New contact form message: ${subject}` : `New contact form message from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        phone ? `Phone: ${phone}` : null,
        subject ? `Subject: ${subject}` : null,
        '',
        'Message:',
        message,
      ]
        .filter((line): line is string => line !== null)
        .join('\n'),
    })

    if (result.error) {
      console.error('[contact] Resend error:', result.error)
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === 'production'
              ? 'Failed to send message.'
              : result.error.message,
        },
        { status: 502 },
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
