import { cache } from 'react'

import { sanityFetch } from './client'
import { STORIES_VISIBILITY_QUERY } from './queries'

export const isStoriesVisible = cache(async (): Promise<boolean> => {
  const visible = await sanityFetch<boolean | null>(STORIES_VISIBILITY_QUERY)
  return visible !== false
})
