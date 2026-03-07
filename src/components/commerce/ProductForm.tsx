'use client'

import { useState } from 'react'

import { AddToCartButton } from './AddToCartButton'
import type { ProductVariant } from '@/lib/shopify/types'
import { formatPrice } from '@/lib/shopify/types'

interface ProductFormProps {
  variants: ProductVariant[]
  productTitle: string
}

export function ProductForm({ variants, productTitle }: ProductFormProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id)
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0]

  if (!selectedVariant) return null

  return (
    <div className="space-y-6">
      {variants.length > 1 && (
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-3">
            Cover
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={!variant.availableForSale}
                className={`px-4 py-2 text-xs uppercase tracking-[0.15em] border transition-colors ${
                  selectedVariantId === variant.id
                    ? 'border-black bg-black text-white'
                    : 'border-[#E5E5E5] text-[#1A1A1A] hover:border-black disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {variant.title}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-lg text-[#1A1A1A]">
        {formatPrice(selectedVariant.price.amount, selectedVariant.price.currencyCode)}
      </p>

      <AddToCartButton
        variant={selectedVariant}
        productTitle={productTitle}
        label="Add to Cart"
        className="w-full sm:w-auto px-8 py-3 text-sm"
      />
    </div>
  )
}
