import { shopifyFetch } from '@/lib/shopify/client'
import { ALL_PRODUCTS_QUERY, NEWSSTAND_PRODUCTS_QUERY } from '@/lib/shopify/queries'
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
    const data = await shopifyFetch<NewsstandProductsResponse>({
      query: NEWSSTAND_PRODUCTS_QUERY,
    })
    products =
      data.collection?.products.edges.map((edge) => edge.node) ?? []

    // Fallback to all products if newsstand collection is empty
    if (products.length === 0) {
      const fallback = await shopifyFetch<AllProductsResponse>({
        query: ALL_PRODUCTS_QUERY,
      })
      products = fallback.products?.edges.map((edge) => edge.node) ?? []
    }
  } catch (err) {
    console.error('Newsstand fetch error:', err)
  }

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-16 md:pb-24">
        <header className="mb-6 md:mb-12 text-center font-futura">
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] uppercase tracking-wide">
            Newsstand
          </h1>
          <p className="mt-2 text-sm md:text-[15px] text-black max-w-2xl mx-auto whitespace-pre-line font-[Helvetica,Arial,sans-serif]">
            Discover all available issues. Each magazine is available in
            multiple cover options.
          </p>
        </header>
        <ProductGrid products={products} />
      </div>
    </main>
  )
}
