import { NextResponse } from 'next/server'

import { shopifyFetch } from '@/lib/shopify/client'

export const dynamic = 'force-dynamic'
import { CART_LINES_REMOVE_MUTATION } from '@/lib/shopify/queries'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { cartId, lineIds } = body as {
      cartId: string
      lineIds: string[]
    }

    if (!cartId || !lineIds?.length) {
      return NextResponse.json(
        { error: 'cartId and lineIds are required' },
        { status: 400 }
      )
    }

    const data = await shopifyFetch<{
      cartLinesRemove?: {
        cart: { id: string; checkoutUrl: string; totalQuantity: number; lines: { edges: unknown[] } }
        userErrors: Array<{ message: string }>
      }
    }>({
      query: CART_LINES_REMOVE_MUTATION,
      variables: { cartId, lineIds },
      cache: 'no-store',
    })

    const result = data.cartLinesRemove
    const userErrors = result?.userErrors ?? []
    if (userErrors.length > 0) {
      const message = userErrors.map((e) => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const cart = result?.cart
    if (!cart) {
      return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
    }

    return NextResponse.json({
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      cart,
    })
  } catch (err) {
    console.error('Cart remove error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cart error' },
      { status: 500 }
    )
  }
}
