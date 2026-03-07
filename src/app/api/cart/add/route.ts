import { NextResponse } from 'next/server'

import { shopifyFetch } from '@/lib/shopify/client'
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
} from '@/lib/shopify/queries'
import type { CartCreateResponse, CartLinesAddResponse } from '@/lib/shopify/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { variantId, quantity = 1, cartId } = body as {
      variantId: string
      quantity?: number
      cartId?: string
    }

    if (!variantId) {
      return NextResponse.json(
        { error: 'variantId is required' },
        { status: 400 }
      )
    }

    const lines = [{ merchandiseId: variantId, quantity }]

    if (cartId) {
      const data = await shopifyFetch<CartLinesAddResponse>({
        query: CART_LINES_ADD_MUTATION,
        variables: { cartId, lines },
      })
      const result = data.cartLinesAdd
      const userErrors = result?.userErrors ?? []
      if (userErrors.length > 0) {
        const message = userErrors.map((e) => e.message).join('; ')
        return NextResponse.json({ error: message }, { status: 400 })
      }
      const cart = result?.cart
      if (!cart?.checkoutUrl) {
        return NextResponse.json(
          { error: 'Failed to add to cart' },
          { status: 500 }
        )
      }
      return NextResponse.json({
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
      })
    }

    const data = await shopifyFetch<CartCreateResponse>({
      query: CART_CREATE_MUTATION,
      variables: { input: { lines } },
    })
    const result = data.cartCreate
    const userErrors = result?.userErrors ?? []
    if (userErrors.length > 0) {
      const message = userErrors.map((e) => e.message).join('; ')
      return NextResponse.json({ error: message }, { status: 400 })
    }
    const cart = result?.cart
    if (!cart?.checkoutUrl) {
      return NextResponse.json(
        { error: 'Failed to create cart' },
        { status: 500 }
      )
    }
    return NextResponse.json({
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
    })
  } catch (err) {
    console.error('Cart API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Cart error' },
      { status: 500 }
    )
  }
}
