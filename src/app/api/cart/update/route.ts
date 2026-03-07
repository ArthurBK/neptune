import { NextResponse } from 'next/server'

import { shopifyFetch } from '@/lib/shopify/client'

export const dynamic = 'force-dynamic'
import { CART_LINES_UPDATE_MUTATION } from '@/lib/shopify/queries'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cartId, lineId, quantity } = body as {
      cartId: string
      lineId: string
      quantity: number
    }

    if (!cartId || !lineId || quantity == null) {
      return NextResponse.json(
        { error: 'cartId, lineId, and quantity are required' },
        { status: 400 }
      )
    }

    const data = await shopifyFetch<{
      cartLinesUpdate?: {
        cart: { id: string; checkoutUrl: string; totalQuantity: number; lines: { edges: unknown[] } }
        userErrors: Array<{ message: string }>
      }
    }>({
      query: CART_LINES_UPDATE_MUTATION,
      variables: {
        cartId,
        lines: [{ id: lineId, quantity: Math.max(0, quantity) }],
      },
      cache: 'no-store',
    })

    const result = data.cartLinesUpdate
    const userErrors = result?.userErrors ?? []
    if (userErrors.length > 0) {
      const message = userErrors.map((e) => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const cart = result?.cart
    if (!cart) {
      return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
    }

    return NextResponse.json({
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart,
    })
  } catch (err) {
    console.error('Cart update error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cart error' },
      { status: 500 }
    )
  }
}
