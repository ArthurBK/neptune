import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const apiKey = process.env.MAILCHIMP_API_KEY?.trim()
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID?.trim()
  const server = apiKey?.split('-').pop()
  if (!apiKey || !audienceId || !server || !/^us\d+$/.test(server)) {
    console.error('[newsletter] Missing or invalid Mailchimp configuration')
    return NextResponse.json(
      { error: 'Subscriptions are temporarily unavailable. Please try again later.' },
      { status: 503 },
    )
  }

  try {
    // Mailchimp identifies members by this hash, making repeated submissions idempotent.
    const subscriberHash = createHash('md5').update(email).digest('hex')
    const response = await fetch(
      `https://${server}.api.mailchimp.com/3.0/lists/${encodeURIComponent(audienceId)}/members/${subscriberHash}?skip_merge_validation=true`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          // Do not overwrite an existing contact's unsubscribe or bounce status.
          status_if_new: 'subscribed',
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10_000),
      },
    )

    if (!response.ok) {
      // Mailchimp error bodies can contain personal data; keep them out of logs/responses.
      console.error('[newsletter] Mailchimp request failed:', response.status)
      return NextResponse.json(
        { error: 'We could not save your subscription. Please try again later.' },
        { status: 502 },
      )
    }

    const member = await response.json()
    if (member?.status !== 'subscribed' && member?.status !== 'pending') {
      return NextResponse.json(
        { error: 'We could not subscribe this address. Please contact us for help.' },
        { status: 422 },
      )
    }

    return NextResponse.json({
      success: true,
      message: member.status === 'pending'
        ? 'Please check your inbox to confirm your subscription.'
        : 'Thank you for subscribing.',
    })
  } catch {
    console.error('[newsletter] Mailchimp connection failed')
    return NextResponse.json(
      { error: 'We could not save your subscription. Please try again later.' },
      { status: 502 },
    )
  }
}
