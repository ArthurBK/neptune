import { cache } from 'react'

import { sanityFetch } from './client'
import { CONTRIBUTORS_VISIBILITY_QUERY } from './queries'

export const isContributorsVisible = cache(async (): Promise<boolean> => {
  const visible = await sanityFetch<boolean | null>(CONTRIBUTORS_VISIBILITY_QUERY)
  return visible !== false
})
