import { client } from '@/sanity/lib/client'
import { FEATURED_ARTICLES_HOME_QUERY } from '@/sanity/lib/queries'
import { shopifyFetch } from '@/lib/shopify/client'
import {
  FIRST_PRODUCT_QUERY,
  LATEST_NEWSSTAND_PRODUCT_QUERY,
} from '@/lib/shopify/queries'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { NewsletterSection } from '@/components/home/NewsletterSection'

export const revalidate = 3600

type ProductNode = {
  handle: string
  title: string
  featuredImage: { url: string; altText: string | null } | null
  images?: {
    edges: Array<{ node: { url: string; altText: string | null } }>
  }
}

/** Use 2nd image for hero if available, otherwise featuredImage */
function toFeaturedProduct(node: ProductNode) {
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
  const articles = await client.fetch<
    Array<{
      _id: string
      title: string
      slug: string
      category: string
      coverImage: { asset?: { _ref: string }; alt?: string }
      author?: { name: string } | null
    }>
  >(FEATURED_ARTICLES_HOME_QUERY)

  let featuredProduct: { handle: string; title: string; imageUrl: string | null; imageAlt: string | null } | null = null
  try {
    const [collectionData, allProductsData] = await Promise.all([
      shopifyFetch<{
        collection: { products: { edges: Array<{ node: ProductNode }> } } | null
      }>({ query: LATEST_NEWSSTAND_PRODUCT_QUERY }),
      shopifyFetch<{
        products: { edges: Array<{ node: ProductNode }> }
      }>({ query: FIRST_PRODUCT_QUERY }),
    ])
    const collectionProduct =
      collectionData?.collection?.products?.edges?.[0]?.node
    const allProductsNode = allProductsData?.products?.edges?.[0]?.node
    featuredProduct = collectionProduct
      ? toFeaturedProduct(collectionProduct)
      : allProductsNode
        ? toFeaturedProduct(allProductsNode)
        : null
  } catch (err) {
    console.error('[Home] Shopify fetch error:', err)
  }

  return (
    <div className="min-h-screen">
      <HeroCarousel articles={articles} featuredProduct={featuredProduct} />
      <NewsletterSection />
    </div>
  )
}
