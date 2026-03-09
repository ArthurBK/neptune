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
  return client.fetch<T>(query, params ?? {})
}
