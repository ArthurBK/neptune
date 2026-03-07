import { NextResponse } from 'next/server'

import { client } from '@/sanity/lib/client'
import { ARTICLES_SEARCH_QUERY } from '@/sanity/lib/queries'
import { shopifyFetch } from '@/lib/shopify/client'

const SHOPIFY_SEARCH_QUERY = `
  query SearchProducts($query: String!) {
    search(query: $query, first: 10, types: [PRODUCT]) {
      nodes {
        ... on Product {
          title
          handle
          featuredImage { url altText }
        }
      }
    }
  }
`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ articles: [], products: [] })
  }

  // Sanity: use *query* for contains match
  const sanityPattern = `*${q.replace(/[*\\]/g, '')}*`

  const [articles, shopifyData] = await Promise.all([
    client.fetch<Array<{
      _id: string
      title: string
      slug: string
      category: string
      coverImage?: { asset?: { _ref: string }; alt?: string }
      author?: { name: string } | null
    }>>(ARTICLES_SEARCH_QUERY, { query: sanityPattern }),
    shopifyFetch<{ search?: { nodes: Array<{ title: string; handle: string; featuredImage?: { url: string; altText: string | null } }> } }>({
      query: SHOPIFY_SEARCH_QUERY,
      variables: { query: q },
    }).catch(() => ({ search: { nodes: [] } })),
  ])

  const products = (shopifyData?.search?.nodes ?? []).filter(
    (n): n is { title: string; handle: string; featuredImage?: { url: string; altText: string | null } } =>
      n && 'handle' in n
  )

  return NextResponse.json({
    articles: articles.map((a) => ({
      _id: a._id,
      title: a.title,
      slug: a.slug,
      category: a.category,
      coverImage: a.coverImage,
      author: a.author,
      href: `/${a.category}/${a.slug}`,
    })),
    products: products.map((p) => ({
      title: p.title,
      handle: p.handle,
      featuredImage: p.featuredImage,
      href: `/newsstand/${p.handle}`,
    })),
  })
}
