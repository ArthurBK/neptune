import { ProductGrid } from "@/components/commerce/ProductGrid"
import { getNewsstandProducts } from "@/lib/shopify/products"

export const revalidate = 3600

export default async function NewsstandPage() {
  const products = await getNewsstandProducts()

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-16 md:pb-24">
        <ProductGrid products={products} />
      </div>
    </main>
  )
}
