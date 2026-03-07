'use client'

import { useState } from 'react'

import type { ProductVariant } from '@/lib/shopify/types'

interface AddToCartButtonProps {
  variant: ProductVariant
  productTitle: string
  label?: string
  className?: string
}

/** Extract numeric ID from Shopify GID (e.g. gid://shopify/ProductVariant/123 -> 123) */
function getVariantNumericId(gid: string): string | null {
  const match = gid.match(/\/(\d+)$/)
  return match ? match[1] : null
}

export function AddToCartButton({
  variant,
  productTitle,
  label = 'Quick Add',
  className = '',
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAddToCart() {
    if (!variant.availableForSale || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: variant.id,
          quantity: 1,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add to cart')
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add to cart'
      if (message.includes('NOT_FOUND') || message.includes('Not Found')) {
        const numericId = getVariantNumericId(variant.id)
        const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? ''
        const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
        if (numericId && cleanDomain) {
          const cartUrl = `https://${cleanDomain}/cart/${numericId}:1`
          window.location.href = cartUrl
          return
        }
      }
      setError(message)
      console.error('Add to cart error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!variant.availableForSale || isLoading}
        className={`bg-black text-white px-4 py-2 text-xs uppercase tracking-[0.2em] transition-opacity hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? 'Adding…' : label}
      </button>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
      {!variant.availableForSale && (
        <p className="text-xs text-[#6B6B6B]">This item is currently unavailable</p>
      )}
    </div>
  )
}
