import { sanityFetch } from '@/sanity/lib/client'
import { MARKET_PAGE_QUERY } from '@/sanity/lib/queries'

import { MarketPageContent } from '@/components/market/MarketPageContent'

export const revalidate = 3600

type AffiliateProduct = {
  _id: string
  title: string
  brand: string
  price: string
  image: { asset?: { _ref: string }; alt?: string }
  affiliateUrl: string
  category: string
}

type MarketPage = {
  title?: string | null
  description?: string | null
  affiliateDisclosure?: string | null
  products?: AffiliateProduct[] | null
}

export default async function TheMarketPage() {
  const marketPage = await sanityFetch<MarketPage | null>(MARKET_PAGE_QUERY)

  return (
    <MarketPageContent
      copy={marketPage}
      products={marketPage?.products ?? []}
    />
  )
}
