import { cache } from 'react'

import { sanityFetch } from './client'
import { MARKET_VISIBILITY_QUERY } from './queries'

export const isMarketVisible = cache(async (): Promise<boolean> => {
  const visible = await sanityFetch<boolean | null>(MARKET_VISIBILITY_QUERY)
  return visible !== false
})
