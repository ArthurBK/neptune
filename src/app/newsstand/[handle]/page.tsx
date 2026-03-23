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
import { NewsstandCta } from '@/components/shared/NewsstandCta'

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
        <div className="flex flex-col bg-white lg:justify-center">
          <div className="px-4 pt-4 pb-6 lg:px-8 lg:pt-4 lg:pb-16">
            <h1 className="font-serif text-xl md:text-2xl text-[#1A1A1A] uppercase tracking-wide">
              {product.title}
            </h1>

            <div className="lg:mt-1">
              <ProductForm variants={variants} productTitle={product.title} productHandle={product.handle} />
            </div>

            {(product.description || product.descriptionHtml) && (
              <div className="mt-6 lg:mt-6">
                <div
                  className="font-header font-light antialiased text-black text-sm leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_a]:hover:text-black [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_li]:mb-1"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Shopify product HTML from trusted source
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 ">

        {/* You May Also Like */}
        <div className="pt-16 border-t border-[#E5E5E5] text-center">
          <h2 className="font-serif text-4xl text-[#1A1A1A] mb-8">
            YOU MAY ALSO LIKE
          </h2>
          {relatedProducts.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          ) : null}
          <NewsstandCta />
        </div>
      </div>
    </main>
  )
}
