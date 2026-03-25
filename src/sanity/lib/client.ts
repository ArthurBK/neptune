import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

/**
 * Thin wrapper around client.fetch for server components.
 * Pages use revalidate = 3600 (ISR) and the webhook calls
 * revalidatePath('/', 'layout') to bust the Full Route Cache.
 */
export async function sanityFetch<T>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T> {
  try {
    return await client.fetch<T>(query, params ?? {})
  } catch (err) {
    // In development we prefer a usable site over a hard crash when Sanity is
    // temporarily unreachable (bad DNS/VPN/offline, etc).
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[sanityFetch] fetch failed; returning null in development', err)
      return null as T
    }

    throw err
  }
}
