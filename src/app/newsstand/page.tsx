import { shopifyFetch } from '@/lib/shopify/client'
import {
  ALL_PRODUCTS_QUERY,
  NEWSSTAND_PRODUCTS_QUERY,
} from '@/lib/shopify/queries'
import type {
  AllProductsResponse,
  NewsstandProductsResponse,
  ShopifyProduct,
} from '@/lib/shopify/types'

import { ProductGrid } from '@/components/commerce/ProductGrid'

export const revalidate = 3600

export default async function NewsstandPage() {
  let products: ShopifyProduct[] = []

  try {
    const collectionData = await shopifyFetch<NewsstandProductsResponse>({
      query: NEWSSTAND_PRODUCTS_QUERY,
    })
    products =
      collectionData.collection?.products.edges.map((edge) => edge.node) ?? []
  } catch {
    try {
      const allData = await shopifyFetch<AllProductsResponse>({
        query: ALL_PRODUCTS_QUERY,
      })
      products = allData.products?.edges.map((edge) => edge.node) ?? []
    } catch (err) {
      console.error('Newsstand fetch error:', err)
    }
  }

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
        <header className="mb-12 md:mb-16">
          <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A]">
            Newsstand
          </h1>
          <p className="mt-4 text-[#6B6B6B] max-w-xl">
            Discover all available issues. Each magazine is available in
            multiple cover options.
          </p>
        </header>
        <ProductGrid products={products} />
      </div>
    </main>
  )
}
