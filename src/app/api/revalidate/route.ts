/**
 * On-demand revalidation for Sanity content.
 * - POST: Called by the Sanity webhook when documents change.
 * - GET:  Manual trigger for testing (visit /api/revalidate in the browser).
 */
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

const CATEGORY_SLUGS = ['interiors', 'arts', 'gardens', 'fashion', 'travel'] as const

type WebhookBody = {
  _type?: string
  slug?: string
  category?: string
}

/**
 * GET /api/revalidate — manual trigger for debugging.
 * Purges all cached pages. No auth required (safe because it only invalidates cache).
 */
export async function GET() {
  revalidatePath('/', 'layout')

  return NextResponse.json({
    revalidated: true,
    method: 'GET (manual)',
    now: Date.now(),
  })
}

/**
 * POST /api/revalidate — called by the Sanity webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET

    if (!secret) {
      console.warn('[revalidate] SANITY_REVALIDATE_SECRET is not set — skipping signature check')
    }

    const { body, isValidSignature } = await parseBody<WebhookBody>(
      req,
      secret ?? undefined
    )

    console.log('[revalidate] Webhook received:', {
      _type: body?._type,
      category: body?.category,
      slug: body?.slug,
      isValidSignature,
      hasSecret: !!secret,
    })

    if (secret && isValidSignature === false) {
      console.error('[revalidate] Invalid signature — check SANITY_REVALIDATE_SECRET')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!body?._type) {
      return NextResponse.json(
        { error: 'Bad request: missing _type' },
        { status: 400 }
      )
    }

    revalidatePath('/', 'layout')

    const revalidated: string[] = ['/ (layout)']

    switch (body._type) {
      case 'article': {
        const category = body.category
        const slug = body.slug
        if (category && CATEGORY_SLUGS.includes(category as (typeof CATEGORY_SLUGS)[number])) {
          revalidatePath(`/${category}`)
          revalidated.push(`/${category}`)
          if (slug) {
            revalidatePath(`/${category}/${slug}`)
            revalidated.push(`/${category}/${slug}`)
          }
        }
        break
      }
      default:
        break
    }

    console.log('[revalidate] Paths invalidated:', revalidated)

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      now: Date.now(),
    })
  } catch (err) {
    console.error('[revalidate] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Revalidation failed' },
      { status: 500 }
    )
  }
}
