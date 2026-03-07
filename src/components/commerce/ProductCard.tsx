import Image from 'next/image'
import Link from 'next/link'

import { AddToCartButton } from './AddToCartButton'
import type { ShopifyProduct } from '@/lib/shopify/types'
import { formatPrice } from '@/lib/shopify/types'

interface ProductCardProps {
  product: ShopifyProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { title, handle, priceRange, featuredImage, variants } = product
  const price = priceRange.minVariantPrice
  const firstVariant = variants.edges[0]?.node

  return (
    <article className="group">
      <Link href={`/newsstand/${handle}`} className="block overflow-hidden">
        <div className="aspect-[3/4] bg-[#E5E5E5] overflow-hidden">
          {featuredImage?.url ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText ?? title}
              width={400}
              height={533}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-sm">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4">
        <Link href={`/newsstand/${handle}`}>
          <h3 className="font-serif text-lg text-[#1A1A1A] group-hover:underline">
            {title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-[#1A1A1A]">
          {formatPrice(price.amount, price.currencyCode)}
        </p>
        {firstVariant?.availableForSale && (
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <AddToCartButton
              variant={firstVariant}
              productTitle={title}
            />
          </div>
        )}
      </div>
    </article>
  )
}
