'use client'

import { useState, useMemo } from 'react'

import { AffiliateProductCard } from './AffiliateProductCard'

const CATEGORY_LABELS: Record<string, string> = {
  objects: 'Objects',
  furniture: 'Furniture',
  books: 'Books',
  clothing: 'Fashion',
  fashion: 'Fashion',
  scents: 'Scents',
}

const CATEGORY_ORDER = ['furniture', 'books', 'objects', 'scents', 'fashion', 'clothing'] as const

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
    const list = Array.from(seen)
    const orderIndex = new Map<string, number>(CATEGORY_ORDER.map((c, i) => [c, i]))
    return list.sort((a, b) => {
      const ai = orderIndex.get(a)
      const bi = orderIndex.get(b)
      if (ai != null && bi != null) return ai - bi
      if (ai != null) return -1
      if (bi != null) return 1
      return a.localeCompare(b)
    })
  }, [products])

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products
    return products.filter((p) => p.category === selectedCategory)
  }, [products, selectedCategory])

  return (
    <main>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 pt-4 md:pt-6 pb-16 md:pb-24">
        <header className="mb-6 md:mb-10 text-center">
          <h1 className="font-serif text-2xl md:text-3xl uppercase tracking-wide text-black">
            Neptune Market
          </h1>
          <p className="mt-4 text-base text-black max-w-2xl mx-auto">
            Discover our curated shopping edit, featuring a variety of products, including books, objects of all kinds, furniture, and fashion gems that our editors adore and have on their wish lists (and soon, you will too!).
            <br />
            <br /><span className="text-xs italic">Our editors independently curate all products featured on Neptune.<br />We may receive compensation from retailers and/or from purchases of products through these links.</span>
          </p>
        </header>

        {categories.length > 0 && (
          <nav
            className="mb-10 md:mb-12 flex flex-wrap justify-center gap-6 font-header font-semibold"
            aria-label="Filter by category"
          >
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`cursor-pointer bg-transparent text-[14px] tracking-[0.15em] uppercase text-black transition-colors hover:underline ${selectedCategory === null ? 'underline' : ''
                }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`cursor-pointer bg-transparent text-[14px] tracking-[0.15em] uppercase text-black transition-colors hover:underline ${selectedCategory === cat ? 'underline' : ''
                  }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </nav>
        )}

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8">
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
