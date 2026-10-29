import { draftMode } from 'next/headers'

export async function POST() {
  const mode = await draftMode()
  mode.disable()
  return new Response(null, { status: 204, headers: { 'Cache-Control': 'private, no-store' } })
}
