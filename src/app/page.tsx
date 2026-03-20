import { sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  FEATURED_ARTICLES_HOME_QUERY,
  HOME_PAGE_QUERY,
  SITE_SETTINGS_QUERY,
} from '@/sanity/lib/queries'
import { shopifyFetch } from '@/lib/shopify/client'
import {
  FIRST_PRODUCT_QUERY,
  NEWSSTAND_6_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_HERO_QUERY,
} from '@/lib/shopify/queries'
import { HomeScrollContainer } from '@/components/home/HomeScrollContainer'
import type { HomeSection } from '@/components/home/StickyHeroStack'
import { Footer } from '@/components/layout/Footer'

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
  image?: { asset?: { _ref: string }; alt?: string } | null
  layout?: 'single' | 'split'
  alt?: string
  title?: string | null
  linkUrl?: string | null
  leftImage?: { asset?: { _ref: string }; alt?: string } | null
  leftAlt?: string
  leftLinkUrl?: string | null
  rightImage?: { asset?: { _ref: string }; alt?: string } | null
  rightAlt?: string
  rightLinkUrl?: string | null
  product?: {
    _id: string
    title: string
    image: { asset?: { _ref: string }; alt?: string }
    affiliateUrl: string
  }
  productHandles?: Array<{ handle: string }>
  description?: string | null
  ctaLabel?: string | null
  videoUrl?: string | null
  headline?: string | null
  subtitle?: string | null
}

type NewsstandProductNode = {
  handle: string
  title: string
  featuredImage?: { url: string; altText: string | null } | null
  images?: { edges: Array<{ node: { url: string; altText: string | null } }> }
}

type NewsstandResponse = {
  collection: {
    products: { edges: Array<{ node: NewsstandProductNode }> }
  } | null
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
  const [homePage, settings] = await Promise.all([
    sanityFetch<{ sections?: HomePageSection[] } | null>(HOME_PAGE_QUERY),
    sanityFetch<{
      instagramUrl?: string | null
      newsletterHeadline?: string | null
      newsletterSubtitle?: string | null
      newsletterImage?: { asset?: { _ref: string } } | null
    } | null>(SITE_SETTINGS_QUERY),
  ])

  const sections: HomeSection[] = []

  if (homePage?.sections?.length) {
    for (const block of homePage.sections) {
      if (block._type === 'homeVideoBlock' && block.videoUrl) {
        sections.push({
          type: 'video',
          data: { videoUrl: block.videoUrl },
        })
      } else if (block._type === 'homeArticleBlock' && block.article) {
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
      } else if (block._type === 'homeImageBlock') {
        if (
          block.layout === 'split' &&
          block.leftImage &&
          block.rightImage
        ) {
          sections.push({
            type: 'image',
            data: {
              _key: block._key,
              layout: 'split',
              leftImage: block.leftImage,
              leftAlt: block.leftAlt ?? '',
              leftLinkUrl: block.leftLinkUrl,
              rightImage: block.rightImage,
              rightAlt: block.rightAlt ?? '',
              rightLinkUrl: block.rightLinkUrl,
              title: block.title,
            },
          })
        } else if (block.image) {
          sections.push({
            type: 'image',
            data: {
              _key: block._key,
              layout: 'single',
              image: block.image,
              alt: block.alt ?? '',
              title: block.title,
              linkUrl: block.linkUrl,
            },
          })
        }
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
      } else if (block._type === 'homeNewsstandBlock' && block.productHandles?.length) {
        try {
          const handles = block.productHandles.map((p) => p.handle).filter(Boolean)
          const productResults = await Promise.all(
            handles.map((handle) =>
              shopifyFetch<{ product: NewsstandProductNode | null }>({
                query: PRODUCT_BY_HANDLE_HERO_QUERY,
                variables: { handle },
              })
            )
          )
          const products = productResults
            .map((r) => (r?.product ? toFeaturedProduct(r.product) : null))
            .filter((p): p is NonNullable<typeof p> => p != null)
          const featuredHandle = handles[0]
          if (products.length > 0 && featuredHandle) {
            sections.push({
              type: 'newsstandProduct',
              data: {
                products,
                featuredHandle,
                title: block.title,
                description: block.description,
                ctaLabel: block.ctaLabel,
              },
            })
          }
        } catch (err) {
          console.error('[Home] Shopify fetch for newsstand block:', err)
        }
      } else if (block._type === 'homeNewsletterBlock') {
        const newsletterImage = block.image ?? settings?.newsletterImage ?? null
        const newsletterImageUrl =
          newsletterImage?.asset != null
            ? urlFor(newsletterImage).width(2400).quality(95).format('webp').url()
            : null
        sections.push({
          type: 'newsletter',
          data: {
            imageUrl: newsletterImageUrl,
            headline: block.headline ?? settings?.newsletterHeadline ?? null,
            subtitle: block.subtitle ?? settings?.newsletterSubtitle ?? null,
          },
        })
      }
    }
  }

  // Fallback: no config or empty — use legacy articles + first newsstand product
  if (sections.length === 0) {
    const articles = await sanityFetch<
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
        shopifyFetch<NewsstandResponse>({ query: NEWSSTAND_6_PRODUCTS_QUERY }),
        shopifyFetch<{ products: { edges: Array<{ node: unknown }> } }>({
          query: FIRST_PRODUCT_QUERY,
        }),
      ])
      const collectionProducts =
        collectionData?.collection?.products?.edges?.map((e) => toFeaturedProduct(e.node)) ?? []
      const allProductsNode = allProductsData?.products?.edges?.[0]?.node as
        | {
            handle: string
            title: string
            featuredImage?: { url: string; altText: string | null }
            images?: { edges: Array<{ node: { url: string; altText: string | null } }> }
          }
        | undefined
      const products =
        collectionProducts.length > 0
          ? collectionProducts
          : allProductsNode
            ? [toFeaturedProduct(allProductsNode)]
            : []
      const featuredHandle = products[0]?.handle
      if (products.length > 0 && featuredHandle) {
        sections.push({
          type: 'newsstandProduct',
          data: {
            products,
            featuredHandle,
            title: null,
            description: null,
            ctaLabel: null,
          },
        })
      }
    } catch (err) {
      console.error('[Home] Shopify fallback fetch error:', err)
    }
  }

  return (
    <div className="min-h-screen">
      <HomeScrollContainer sections={sections}>
        <section className="h-[var(--section-height,100vh)] min-h-[var(--section-height,100vh)] w-full shrink-0 flex flex-col items-center justify-center bg-white">
          <Footer instagramUrl={settings?.instagramUrl ?? null} />
        </section>
      </HomeScrollContainer>
    </div>
  )
}
