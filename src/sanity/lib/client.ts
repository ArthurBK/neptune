import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

/**
 * Server-side fetch with Next.js Data Cache tags.
 * All results are cached and invalidated together via revalidateTag('sanity').
 */
export async function sanityFetch<T>(
  query: string,
  params?: Record<string, unknown>,
): Promise<T> {
  return client.fetch<T>(query, params ?? {}, {
    next: { tags: ['sanity'] },
  })
}
