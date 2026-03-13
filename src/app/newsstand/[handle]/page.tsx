import Link from 'next/link'
import { notFound } from 'next/navigation'

import { shopifyFetch } from '@/lib/shopify/client'
import {
  ALL_PRODUCTS_QUERY,
  NEWSSTAND_PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
} from '@/lib/shopify/queries'
import type {
  AllProductsResponse,
  NewsstandProductsResponse,
  ProductByHandleResponse,
} from '@/lib/shopify/types'

import { ProductCard } from '@/components/commerce/ProductCard'
import { ProductForm } from '@/components/commerce/ProductForm'
import { HorizontalImageCarousel } from '@/components/commerce/HorizontalImageCarousel'
import { VerticalImageCarousel } from '@/components/commerce/VerticalImageCarousel'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const data = await shopifyFetch<NewsstandProductsResponse>({
      query: NEWSSTAND_PRODUCTS_QUERY,
    })
    const products = data.collection?.products.edges.map((e) => e.node) ?? []
    return products.map((p) => ({ handle: p.handle }))
  } catch {
    return []
  }
}

interface ProductPageProps {
  params: Promise<{ handle: string }>
}

export default async function NewsstandProductPage({ params }: ProductPageProps) {
  const { handle } = await params

  const [productData, collectionData, allProductsData] = await Promise.all([
    shopifyFetch<ProductByHandleResponse>({
      query: PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
    }),
    shopifyFetch<NewsstandProductsResponse>({
      query: NEWSSTAND_PRODUCTS_QUERY,
    }),
    shopifyFetch<AllProductsResponse>({
      query: ALL_PRODUCTS_QUERY,
    }),
  ])

  const product = productData.product
  if (!product) notFound()

  const collectionProducts =
    collectionData.collection?.products.edges.map((e) => e.node) ?? []
  const allProductsList = allProductsData.products?.edges.map((e) => e.node) ?? []
  const allProducts =
    collectionProducts.length > 0 ? collectionProducts : allProductsList
  const relatedProducts = allProducts
    .filter((p) => p.handle !== handle)
    .slice(0, 3)

  const images = product.images.edges.map((e) => e.node)
  const variants = product.variants.edges.map((e) => e.node)

  return (
    <main className="min-h-[calc(100vh-var(--header-height))]">
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:min-h-[calc(100vh-var(--header-height))]">
        {/* Box 1 — empty on large screens */}
        <div className="hidden lg:block" />

        {/* Box 2 — images */}
        {/* Mobile / tablet: horizontal carousel (swipe left/right); vertical scroll = page scroll */}
        <div className="px-4 pt-3 lg:hidden">
          <HorizontalImageCarousel images={images} productTitle={product.title} />
        </div>

        {/* Desktop: vertical image carousel with controlled scroll */}
        <div
          className="hidden lg:block px-6 pt-4"
          style={{ height: 'calc(100vh - var(--header-height))' }}
        >
          <VerticalImageCarousel images={images} productTitle={product.title} />
        </div>

        {/* Box 3 — product info */}
        <div className="flex flex-col border-t border-[#E5E5E5] bg-white lg:border-t-0 lg:border-l lg:justify-center">
          <div className="px-4 pt-4 pb-6 lg:px-8 lg:pt-4 lg:pb-16">
            <h1 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] uppercase tracking-wide">
              {product.title}
            </h1>

            <div className="mt-4 lg:mt-8">
              <ProductForm variants={variants} productTitle={product.title} />
            </div>

            {(product.description || product.descriptionHtml) && (
              <div className="mt-6 pt-6 border-t border-[#E5E5E5] lg:mt-12 lg:pt-8">
                <div
                  className="text-[#6B6B6B] text-base leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_a]:hover:text-black"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Shopify product HTML from trusted source
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">

        {/* You May Also Like */}
        <div className="mt-16 pt-16 border-t border-[#E5E5E5] text-center">
          <h2 className="font-serif text-4xl text-[#1A1A1A] mb-8">
            You May Also Like
          </h2>
          {relatedProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          ) : null}
          <Link
            href="/newsstand"
            className="mt-8 inline-block text-base tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
          >
            ← Discover all available issues
          </Link>
        </div>
      </div>
    </main>
  )
}
