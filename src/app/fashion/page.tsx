import { sanityFetch } from '@/sanity/lib/client'
import {
  AFFILIATE_PRODUCTS_BY_CATEGORY_QUERY,
  CATEGORY_PAGE_QUERY,
} from '@/sanity/lib/queries'

import { FashionPageContent } from '@/components/fashion/FashionPageContent'
import { CategoryPageImage } from '@/components/shared/CategoryPageImage'

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

export default async function FashionPage() {
  const [products, categoryPage] = await Promise.all([
    sanityFetch<AffiliateProduct[]>(AFFILIATE_PRODUCTS_BY_CATEGORY_QUERY, {
      category: 'fashion',
    }),
    sanityFetch<{
      fashionImage?: { asset?: { _ref: string }; alt?: string } | null
    } | null>(CATEGORY_PAGE_QUERY),
  ])

  return (
    <>
      <FashionPageContent products={products} />
      <CategoryPageImage image={categoryPage?.fashionImage} />
    </>
  )
}
