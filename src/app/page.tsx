import { client } from '@/sanity/lib/client'
import {
  FEATURED_ARTICLES_HOME_QUERY,
  HOME_PAGE_QUERY,
} from '@/sanity/lib/queries'
import { shopifyFetch } from '@/lib/shopify/client'
import {
  FIRST_PRODUCT_QUERY,
  LATEST_NEWSSTAND_PRODUCT_QUERY,
  PRODUCT_BY_HANDLE_HERO_QUERY,
} from '@/lib/shopify/queries'
import { HomeScrollContainer } from '@/components/home/HomeScrollContainer'
import type { HomeSection } from '@/components/home/StickyHeroStack'

export const revalidate = 3600

type HomePageSection = {
  _type: string
  _key?: string
  article?: {
    _id: string
    title: string
    slug: string
    category: string
    coverImage: { asset?: { _ref: string }; alt?: string }
    author?: { name: string; slug: string } | null
  }
  image?: { asset?: { _ref: string }; alt?: string }
  alt?: string
  title?: string | null
  linkUrl?: string | null
  product?: {
    _id: string
    title: string
    image: { asset?: { _ref: string }; alt?: string }
    affiliateUrl: string
  }
  handle?: string
}

function toFeaturedProduct(node: {
  handle: string
  title: string
  featuredImage?: { url: string; altText: string | null } | null
  images?: { edges: Array<{ node: { url: string; altText: string | null } }> }
}) {
  const heroImage =
    node.images?.edges?.[1]?.node ?? node.images?.edges?.[0]?.node ?? node.featuredImage
  return {
    handle: node.handle,
    title: node.title,
    imageUrl: heroImage?.url ?? node.featuredImage?.url ?? null,
    imageAlt: heroImage?.altText ?? node.featuredImage?.altText ?? null,
  }
}

export default async function Home() {
  const homePage = await client.fetch<{ sections?: HomePageSection[] } | null>(
    HOME_PAGE_QUERY
  )

  const sections: HomeSection[] = []

  if (homePage?.sections?.length) {
    for (const block of homePage.sections) {
      if (block._type === 'homeArticleBlock' && block.article) {
        sections.push({
          type: 'article',
          data: {
            _id: block.article._id,
            title: block.article.title,
            slug: block.article.slug,
            category: block.article.category,
            coverImage: block.article.coverImage,
            author: block.article.author,
          },
        })
      } else if (block._type === 'homeImageBlock' && block.image) {
        sections.push({
          type: 'image',
          data: {
            _key: block._key,
            image: block.image,
            alt: block.alt ?? '',
            title: block.title,
            linkUrl: block.linkUrl,
          },
        })
      } else if (block._type === 'homeProductBlock' && block.product) {
        sections.push({
          type: 'affiliateProduct',
          data: {
            _key: block._key,
            _id: block.product._id,
            title: block.product.title,
            image: block.product.image,
            affiliateUrl: block.product.affiliateUrl,
          },
        })
      } else if (block._type === 'homeNewsstandBlock' && block.handle) {
        try {
          const data = await shopifyFetch<{
            product: {
              handle: string
              title: string
              featuredImage?: { url: string; altText: string | null } | null
              images?: { edges: Array<{ node: { url: string; altText: string | null } }> }
            } | null
          }>({
            query: PRODUCT_BY_HANDLE_HERO_QUERY,
            variables: { handle: block.handle },
          })
          if (data?.product) {
            const fp = toFeaturedProduct(data.product)
            sections.push({
              type: 'newsstandProduct',
              data: fp,
            })
          }
        } catch (err) {
          console.error(`[Home] Shopify fetch for handle "${block.handle}":`, err)
        }
      }
    }
  }

  // Fallback: no config or empty — use legacy articles + first newsstand product
  if (sections.length === 0) {
    const articles = await client.fetch<
      Array<{
        _id: string
        title: string
        slug: string
        category: string
        coverImage: { asset?: { _ref: string }; alt?: string }
        author?: { name: string; slug: string } | null
      }>
    >(FEATURED_ARTICLES_HOME_QUERY)

    for (const a of articles ?? []) {
      sections.push({ type: 'article', data: a })
    }

    try {
      const [collectionData, allProductsData] = await Promise.all([
        shopifyFetch<{
          collection: { products: { edges: Array<{ node: unknown }> } } | null
        }>({ query: LATEST_NEWSSTAND_PRODUCT_QUERY }),
        shopifyFetch<{ products: { edges: Array<{ node: unknown }> } }>({
          query: FIRST_PRODUCT_QUERY,
        }),
      ])
      const collectionProduct = (collectionData?.collection?.products?.edges?.[0]
        ?.node) as {
        handle: string
        title: string
        featuredImage?: { url: string; altText: string | null }
        images?: { edges: Array<{ node: { url: string; altText: string | null } }> }
      } | undefined
      const allProductsNode = (allProductsData?.products?.edges?.[0]?.node) as {
        handle: string
        title: string
        featuredImage?: { url: string; altText: string | null }
        images?: { edges: Array<{ node: { url: string; altText: string | null } }> }
      } | undefined
      const node = collectionProduct ?? allProductsNode
      if (node) {
        sections.push({
          type: 'newsstandProduct',
          data: toFeaturedProduct(node),
        })
      }
    } catch (err) {
      console.error('[Home] Shopify fallback fetch error:', err)
    }
  }

  return (
    <div className="min-h-[calc(100vh-var(--header-height))]">
      <HomeScrollContainer sections={sections} />
    </div>
  )
}
