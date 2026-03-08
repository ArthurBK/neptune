'use client'

import { useState, useMemo } from 'react'

import { AffiliateProductCard } from './AffiliateProductCard'

const CATEGORY_LABELS: Record<string, string> = {
  objects: 'Objects',
  furniture: 'Furniture',
  books: 'Books',
  clothing: 'Clothing',
  scents: 'Scents',
}

type AffiliateProduct = {
  _id: string
  title: string
  brand: string
  price: string
  image: { asset?: { _ref: string }; alt?: string }
  affiliateUrl: string
  category: string
}

interface MarketPageContentProps {
  products: AffiliateProduct[]
}

export function MarketPageContent({ products }: MarketPageContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = useMemo(() => {
    const seen = new Set<string>()
    for (const p of products) {
      if (p.category) seen.add(p.category)
    }
    return Array.from(seen).sort()
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  return (
    <main>
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24">
        <header className="mb-12 md:mb-16 text-center">
          <h1 className="font-serif text-6xl md:text-7xl uppercase tracking-wide text-[var(--neptune-red)]">
            The Neptune Market
          </h1>
          <p className="mt-4 text-base text-[#6B6B6B] max-w-xl mx-auto">
            Curated products we love. Purchases through these links may support
            Neptune.
          </p>
        </header>

        {categories.length > 0 && (
          <nav
            className="mb-10 md:mb-12 flex flex-wrap gap-2"
            aria-label="Filter by category"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 text-sm tracking-[0.15em] uppercase transition-colors border ${
                selectedCategory === null
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                  : 'border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-sm tracking-[0.15em] uppercase transition-colors border ${
                  selectedCategory === cat
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-[#E5E5E5] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </nav>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12">
            {filteredProducts.map((product) => (
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
          <p className="text-[#6B6B6B]">
            {selectedCategory
              ? `No products in ${CATEGORY_LABELS[selectedCategory] ?? selectedCategory}.`
              : 'No products yet.'}
          </p>
        )}
      </div>
    </main>
  )
}
