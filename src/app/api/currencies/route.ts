import { NextResponse } from 'next/server'

import { shopifyFetch } from '@/lib/shopify/client'
import { SHOP_CURRENCIES_QUERY } from '@/lib/shopify/queries'

export const revalidate = 3600

interface ShopCurrenciesResponse {
  shop: {
    paymentSettings: {
      enabledPresentmentCurrencies: string[]
    }
  }
}

export async function GET() {
  try {
    const data = await shopifyFetch<ShopCurrenciesResponse>({
      query: SHOP_CURRENCIES_QUERY,
    })
    const currencies = data.shop.paymentSettings.enabledPresentmentCurrencies
    return NextResponse.json({ currencies })
  } catch (err) {
    console.error('Currencies API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch currencies' },
      { status: 500 }
    )
  }
}
