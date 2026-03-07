import { NextResponse } from 'next/server'

import { shopifyFetch } from '@/lib/shopify/client'

export const dynamic = 'force-dynamic'
import { CART_QUERY } from '@/lib/shopify/queries'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cartId = searchParams.get('cartId')

  if (!cartId) {
    return NextResponse.json({ error: 'cartId required' }, { status: 400 })
  }

  try {
    const data = await shopifyFetch<{ cart: unknown }>({
      query: CART_QUERY,
      variables: { cartId },
      cache: 'no-store',
    })

    if (!data.cart) {
      return NextResponse.json({ cart: null })
    }

    return NextResponse.json({ cart: data.cart })
  } catch (err) {
    console.error('Cart fetch error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cart error' },
      { status: 500 }
    )
  }
}
