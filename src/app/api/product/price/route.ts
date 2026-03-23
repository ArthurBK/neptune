import { NextResponse } from 'next/server'

import { shopifyFetch } from '@/lib/shopify/client'
import { PRODUCT_PRICE_CONTEXT_QUERY } from '@/lib/shopify/queries'

export const dynamic = 'force-dynamic'

interface ProductPriceContextResponse {
  product: {
    variants: {
      edges: Array<{
        node: {
          id: string
          price: { amount: string; currencyCode: string }
        }
      }>
    }
  } | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const handle = searchParams.get('handle')
  const country = searchParams.get('country')

  if (!handle || !country) {
    return NextResponse.json(
      { error: 'handle and country are required' },
      { status: 400 }
    )
  }

  try {
    const data = await shopifyFetch<ProductPriceContextResponse>({
      query: PRODUCT_PRICE_CONTEXT_QUERY,
      variables: { handle, country },
      cache: 'no-store',
    })

    if (!data.product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const variants = data.product.variants.edges.map((e) => e.node)
    return NextResponse.json({ variants })
  } catch (err) {
    console.error('Product price API error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch prices' },
      { status: 500 }
    )
  }
}
