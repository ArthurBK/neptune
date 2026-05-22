import Image from 'next/image'
import Link from 'next/link'

import { AddToCartButton } from './AddToCartButton'
import type { ShopifyProduct } from '@/lib/shopify/types'
import { formatPriceNoDecimals } from '@/lib/shopify/types'

interface ProductCardProps {
  product: ShopifyProduct
  compact?: boolean
  size?: 'default' | 'small'
  titleFontFamily?: 'serif' | 'futura' | 'inter'
}

export function ProductCard({
  product,
  compact = false,
  size = 'default',
  titleFontFamily = 'serif',
}: ProductCardProps) {
  const { title, handle, priceRange, featuredImage, variants } = product
  const price = priceRange.minVariantPrice
  const firstVariant = variants.edges[0]?.node

  return (
    <article className={`group ${compact ? 'max-w-[240px] sm:max-w-[200px]' : ''}`}>
      <Link href={`/newsstand/${handle}`} className="block overflow-hidden">
        <div className="aspect-3/4 overflow-hidden bg-white">
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
              className="w-full h-full object-contain object-bottom transition-opacity duration-300 ease-out group-hover:opacity-90"
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
            className={`text-center text-[#1A1A1A] group-hover:underline line-clamp-2 ${
              compact ? 'text-sm' : size === 'small' ? 'text-[11px] md:text-xs' : 'text-sm md:text-base'
            }`}
            style={
              titleFontFamily === 'futura'
                ? { fontFamily: 'Futura, "Futura PT", "Futura Std", "Trebuchet MS", Arial, sans-serif' }
                : titleFontFamily === 'inter'
                  ? { fontFamily: 'var(--font-inter), sans-serif' }
                  : undefined
            }
          >
            {title}
          </h3>
        </Link>
        <p
          className={`font-futura mt-1 text-center text-[#1A1A1A] ${
            compact ? 'text-xs' : size === 'small' ? 'text-xs' : 'text-sm'
          }`}
        >
          {formatPriceNoDecimals(price.amount, price.currencyCode)}
        </p>
        {!compact && firstVariant?.availableForSale && (
          <div className="mt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex justify-center">
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
