import { ProductCard } from './ProductCard'
import type { ShopifyProduct } from '@/lib/shopify/types'

interface ProductGridProps {
  products: ShopifyProduct[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-center text-base text-[#6B6B6B] py-16">
        No issues available at the moment.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} size="small" />
      ))}
    </div>
  )
}
