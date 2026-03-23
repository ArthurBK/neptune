'use client'

import { useCallback, useEffect, useState } from 'react'

import { AddToCartButton } from './AddToCartButton'
import {
  COUNTRY_CHANGED_EVENT,
  getStoredCountry,
} from '@/lib/currency'
import { clearCart } from '@/lib/cart'
import type { ProductVariant } from '@/lib/shopify/types'
import { formatPriceNoDecimals } from '@/lib/shopify/types'

interface ProductFormProps {
  variants: ProductVariant[]
  productTitle: string
  productHandle: string
}

export function ProductForm({ variants, productTitle, productHandle }: ProductFormProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id)
  const [variantPrices, setVariantPrices] = useState<Record<string, { amount: string; currencyCode: string }>>({})
  const [countryCode, setCountryCode] = useState<string | null>(null)
  const [priceReady, setPriceReady] = useState(false)

  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0]

  const fetchPrices = useCallback(async (country: string) => {
    try {
      const res = await fetch(
        `/api/product/price?handle=${encodeURIComponent(productHandle)}&country=${country}`
      )
      if (!res.ok) return
      const data = await res.json()
      if (data.variants) {
        const prices: Record<string, { amount: string; currencyCode: string }> = {}
        for (const v of data.variants as Array<{ id: string; price: { amount: string; currencyCode: string } }>) {
          prices[v.id] = v.price
        }
        setVariantPrices(prices)
        setCountryCode(country)
      }
    } catch {
      // Fall back to default prices
    } finally {
      setPriceReady(true)
    }
  }, [productHandle])

  useEffect(() => {
    async function init() {
      const stored = getStoredCountry()
      if (stored) {
        await fetchPrices(stored)
      } else {
        setPriceReady(true)
      }
    }
    void init()
  }, [fetchPrices])

  useEffect(() => {
    function onCountryChanged(e: Event) {
      const detail = (e as CustomEvent<{ countryCode: string }>).detail
      if (detail?.countryCode) {
        clearCart()
        void fetchPrices(detail.countryCode)
      }
    }
    window.addEventListener(COUNTRY_CHANGED_EVENT, onCountryChanged)
    return () => window.removeEventListener(COUNTRY_CHANGED_EVENT, onCountryChanged)
  }, [fetchPrices])

  if (!selectedVariant) return null

  const displayPrice = variantPrices[selectedVariant.id] ?? selectedVariant.price

  return (
    <div className="space-y-4 sm:space-y-6">
      {variants.length > 1 && (
        <div>
          <p className="text-sm tracking-[0.2em] uppercase text-[#6B6B6B] mb-3">
            Cover
          </p>
          <div className="flex flex-wrap gap-2">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariantId(variant.id)}
                disabled={!variant.availableForSale}
                className={`px-4 py-2 text-sm uppercase tracking-[0.15em] border transition-colors ${selectedVariantId === variant.id
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

      <p className={`font-futura text-2xl text-[#1A1A1A] transition-opacity duration-150 ${priceReady ? 'opacity-100' : 'opacity-0'}`}>
        {formatPriceNoDecimals(displayPrice.amount, displayPrice.currencyCode)}
      </p>

      <AddToCartButton
        variant={selectedVariant}
        productTitle={productTitle}
        countryCode={countryCode ?? undefined}
        label="Add to Cart"
        className="w-full sm:w-auto text-sm"
      />
    </div>
  )
}
