'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  COUNTRY_CHANGED_EVENT,
  getStoredCountry,
} from '@/lib/currency'
import type { Money } from '@/lib/shopify/types'
import { formatPriceNoDecimals } from '@/lib/shopify/types'

interface ProductPriceProps {
  productHandle: string
  initialPrice: Money
  className?: string
}

export function ProductPrice({
  productHandle,
  initialPrice,
  className,
}: ProductPriceProps) {
  const [price, setPrice] = useState<Money>(initialPrice)

  const fetchPrice = useCallback(async (countryCode: string) => {
    try {
      const res = await fetch(
        `/api/product/price?handle=${encodeURIComponent(productHandle)}&country=${countryCode}`,
        { cache: 'no-store' }
      )
      if (!res.ok) return

      const data = await res.json()
      const contextualPrice = data.priceRange?.minVariantPrice as Money | undefined
      if (contextualPrice?.amount && contextualPrice.currencyCode) {
        setPrice(contextualPrice)
      }
    } catch {
      setPrice(initialPrice)
    }
  }, [initialPrice, productHandle])

  useEffect(() => {
    const storedCountry = getStoredCountry()
    if (!storedCountry) return

    const timer = window.setTimeout(() => {
      void fetchPrice(storedCountry)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [fetchPrice])

  useEffect(() => {
    function onCountryChanged(e: Event) {
      const countryCode = (e as CustomEvent<{ countryCode?: string }>).detail?.countryCode
      if (countryCode) {
        void fetchPrice(countryCode)
      }
    }

    window.addEventListener(COUNTRY_CHANGED_EVENT, onCountryChanged)
    return () => window.removeEventListener(COUNTRY_CHANGED_EVENT, onCountryChanged)
  }, [fetchPrice])

  return (
    <p className={className}>
      {formatPriceNoDecimals(price.amount, price.currencyCode)}
    </p>
  )
}
