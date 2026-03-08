import { client } from '@/sanity/lib/client'
import { AFFILIATE_PRODUCTS_QUERY } from '@/sanity/lib/queries'

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

export default async function TheMarketPage() {
  const products = await client.fetch<AffiliateProduct[]>(AFFILIATE_PRODUCTS_QUERY)

  return <MarketPageContent products={products} />
}
