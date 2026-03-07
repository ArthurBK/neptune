import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // TODO: Integrate with Klaviyo, Mailchimp, or your newsletter provider
    // For now, log the subscription (remove in production)
    console.log('[Newsletter] Subscription:', { firstName, lastName, email })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
