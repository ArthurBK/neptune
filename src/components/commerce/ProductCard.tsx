import Image from 'next/image'
import Link from 'next/link'

import { AddToCartButton } from './AddToCartButton'
import type { ShopifyProduct } from '@/lib/shopify/types'
import { formatPrice } from '@/lib/shopify/types'

interface ProductCardProps {
  product: ShopifyProduct
  compact?: boolean
  size?: 'default' | 'small'
}

export function ProductCard({
  product,
  compact = false,
  size = 'default',
}: ProductCardProps) {
  const { title, handle, priceRange, featuredImage, variants } = product
  const price = priceRange.minVariantPrice
  const firstVariant = variants.edges[0]?.node
  const isSmall = size === 'small' || compact

  return (
    <article className={`group ${compact ? 'max-w-[200px]' : ''}`}>
      <Link href={`/newsstand/${handle}`} className="block overflow-hidden">
        <div className="aspect-3/4 overflow-hidden">
          {featuredImage?.url ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText ?? title}
              width={compact ? 200 : size === 'small' ? 280 : 400}
              height={compact ? 267 : size === 'small' ? 373 : 533}
              sizes={
                compact
                  ? '(max-width: 640px) 50vw, 200px'
                  : size === 'small'
                    ? '(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw'
                    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
              }
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#1A1A1A] text-sm">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className={compact ? 'mt-2' : size === 'small' ? 'mt-3' : 'mt-4'}>
        <Link href={`/newsstand/${handle}`}>
          <h3
            className={`font-serif text-[#1A1A1A] group-hover:underline line-clamp-2 ${
              compact ? 'text-base' : size === 'small' ? 'text-lg' : 'text-2xl'
            }`}
          >
            {title}
          </h3>
        </Link>
        <p
          className={`font-futura mt-1 text-[#1A1A1A] ${
            compact ? 'text-sm' : size === 'small' ? 'text-sm' : 'text-base'
          }`}
        >
          {formatPrice(price.amount, price.currencyCode)}
        </p>
        {!compact && firstVariant?.availableForSale && (
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
