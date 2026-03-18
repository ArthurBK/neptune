import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

import { articleTitleSingleLine } from '@/lib/articleTitle'
import { shopifyFetch } from '@/lib/shopify/client'
import { client } from '@/sanity/lib/client'
import { ARTICLES_SEARCH_QUERY, CONTRIBUTORS_SEARCH_QUERY } from '@/sanity/lib/queries'

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

type ArticleHit = {
  _id: string
  title: string
  slug: string
  category: string
  coverImage?: { asset?: { _ref: string }; alt?: string }
  author?: { name: string } | null
}

type ContributorHit = {
  _id: string
  name: string
  slug: string
  role?: string | null
  portrait?: { asset?: { _ref: string }; alt?: string } | null
}

async function fetchSearch(q: string) {
  // match is case-insensitive; append * for prefix matching ("sar" → "sar*" matches "sarah")
  const term = q.replace(/[*\\]/g, '').trim()
  const sanityQuery = `${term}*`

  const [articles, contributors, shopifyData] = await Promise.all([
    client.fetch<ArticleHit[]>(ARTICLES_SEARCH_QUERY, {
      query: sanityQuery,
    } as Record<string, string>),
    client.fetch<ContributorHit[]>(CONTRIBUTORS_SEARCH_QUERY, {
      query: sanityQuery,
    } as Record<string, string>),
    shopifyFetch<{
      search?: {
        nodes: Array<{
          title: string
          handle: string
          featuredImage?: { url: string; altText: string | null }
        }>
      }
    }>({
      query: SHOPIFY_SEARCH_QUERY,
      variables: { query: q },
    }).catch(() => ({ search: { nodes: [] } })),
  ])

  const products = (shopifyData?.search?.nodes ?? []).filter(
    (n): n is { title: string; handle: string; featuredImage?: { url: string; altText: string | null } } =>
      Boolean(n && 'handle' in n)
  )

  return {
    articles: articles.map((a) => ({
      _id: a._id,
      title: articleTitleSingleLine(a.title),
      slug: a.slug,
      category: a.category,
      coverImage: a.coverImage,
      author: a.author,
      href: `/${a.category}/${a.slug}`,
    })),
    contributors: contributors.map((c) => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      role: c.role,
      portrait: c.portrait,
      href: `/contributors/${c.slug}`,
    })),
    products: products.map((p) => ({
      title: p.title,
      handle: p.handle,
      featuredImage: p.featuredImage,
      href: `/newsstand/${p.handle}`,
    })),
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ articles: [], contributors: [], products: [] })
  }

  const cached = unstable_cache(
    () => fetchSearch(q),
    ['search', q],
    { revalidate: 60 }
  )

  const { articles, contributors, products } = await cached()
  return NextResponse.json({ articles, contributors, products })
}
