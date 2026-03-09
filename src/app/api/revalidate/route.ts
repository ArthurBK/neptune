/**
 * On-demand revalidation for Sanity content.
 * Configure a Sanity webhook to POST here when documents change; this route
 * invalidates the relevant Next.js caches so the live site updates immediately.
 * See README "Sanity on-demand revalidation" for webhook setup.
 */
import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'

const CATEGORY_SLUGS = ['interiors', 'arts', 'gardens', 'fashion'] as const

type WebhookBody = {
  _type?: string
  slug?: string
  category?: string
}

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.SANITY_REVALIDATE_SECRET
    const { body, isValidSignature } = await parseBody<WebhookBody>(
      req,
      secret ?? undefined
    )

    if (secret && isValidSignature === false) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (!body?._type) {
      return NextResponse.json(
        { error: 'Bad request: missing _type' },
        { status: 400 }
      )
    }

    revalidatePath('/', 'layout')

    const revalidated: string[] = []

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
        } else {
          // Unknown category or missing: revalidate all category landing pages
          for (const cat of CATEGORY_SLUGS) {
            revalidatePath(`/${cat}`)
            revalidated.push(`/${cat}`)
          }
        }
        break
      }
      case 'categoryPage':
        for (const cat of CATEGORY_SLUGS) {
          revalidatePath(`/${cat}`)
          revalidated.push(`/${cat}`)
        }
        break
      case 'homePage':
      case 'siteSettings':
        revalidatePath('/')
        revalidated.push('/')
        break
      case 'adBanner':
        revalidatePath('/')
        revalidated.push('/')
        for (const cat of CATEGORY_SLUGS) {
          revalidatePath(`/${cat}`)
          revalidated.push(`/${cat}`)
        }
        break
      default:
        // Unknown type: revalidate home and category pages to be safe
        revalidatePath('/')
        revalidated.push('/')
        for (const cat of CATEGORY_SLUGS) {
          revalidatePath(`/${cat}`)
          revalidated.push(`/${cat}`)
        }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidated,
      now: Date.now(),
    })
  } catch (err) {
    console.error('[revalidate]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Revalidation failed' },
      { status: 500 }
    )
  }
}
