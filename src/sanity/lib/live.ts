import 'server-only'

import { defineLive } from 'next-sanity/live'
import { draftMode } from 'next/headers'
import { client } from './client'
import { readToken, requireReadToken } from './token'

const live = defineLive({
  client,
  serverToken: readToken || false,
  // next-sanity only sends this Viewer token to authenticated Draft Mode sessions.
  browserToken: readToken || false,
  // Preview the existing layout without encoding typography, URLs or product handles.
  stega: false,
  fetchOptions: { revalidate: 86400 },
})

export const SanityLive = live.SanityLive

/** Article and contributor profile pages follow Draft Mode; public lists stay published-only. */
export async function articleFetch<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  if ((await draftMode()).isEnabled) requireReadToken()
  const { data } = await live.sanityFetch({ query, params, stega: false })
  return data as T
}
