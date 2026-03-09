'use client'

import { AffiliateProductCard } from '@/components/market/AffiliateProductCard'

type AffiliateProduct = {
  _id: string
  title: string
  brand: string
  price: string
  image: { asset?: { _ref: string }; alt?: string }
  affiliateUrl: string
  category: string
}

interface FashionPageContentProps {
  products: AffiliateProduct[]
}

export function FashionPageContent({ products }: FashionPageContentProps) {
  return (
    <main>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24">
        <header className="mb-12 md:mb-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl uppercase tracking-wide text-[#1A1A1A]">
            Fashion
          </h1>
          <p className="mt-4 text-base text-[#6B6B6B] max-w-xl mx-auto">
            Curated fashion we love. Purchases through these links may support
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
          <p className="text-[#6B6B6B]">No fashion products yet.</p>
        )}
      </div>
    </main>
  )
}
