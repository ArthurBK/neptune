import { client } from '@/sanity/lib/client'
import { AFFILIATE_PRODUCTS_QUERY } from '@/sanity/lib/queries'

import { AffiliateProductCard } from '@/components/market/AffiliateProductCard'

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

  return (
    <main>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
        <header className="mb-12 md:mb-16">
          <h1 className="font-serif text-6xl md:text-7xl text-[#1A1A1A]">
            neptune market
          </h1>
          <p className="mt-4 text-base text-[#6B6B6B] max-w-xl">
            Curated products we love. Purchases through these links may support
            Neptune.
          </p>
        </header>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {products.map((product) => (
              <AffiliateProductCard
                key={product._id}
                title={product.title}
                brand={product.brand}
                price={product.price}
                image={product.image}
                affiliateUrl={product.affiliateUrl}
              />
            ))}
          </div>
        ) : (
          <p className="text-[#6B6B6B]">No products yet.</p>
        )}
      </div>
    </main>
  )
}
