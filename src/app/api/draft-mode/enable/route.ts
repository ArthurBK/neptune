import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { client } from '@/sanity/lib/client'
import { readToken } from '@/sanity/lib/token'

export async function GET(request: Request) {
  if (!readToken) {
    return new Response('Article preview is not configured. Set SANITY_API_READ_TOKEN on the server.', {
      status: 503,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  }

  // Sanity validates the Studio's preview secret before setting the Draft Mode cookie.
  const { GET: enable } = defineEnableDraftMode({
    client: client.withConfig({ token: readToken, useCdn: false }),
  })
  return enable(request)
}
