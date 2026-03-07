import Image from 'next/image'
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
    <main>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image gallery */}
          <div className="relative">
            <div className="space-y-6">
              {images.map((img) => (
                <div key={img.url} className="relative aspect-[3/4] bg-[#E5E5E5] overflow-hidden">
                  <Image
                    src={img.url}
                    alt={img.altText ?? product.title}
                    width={img.width ?? 800}
                    height={img.height ?? 1067}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <p className="mt-6 text-base tracking-[0.2em] uppercase text-[#6B6B6B] flex items-center gap-2">
                <span className="inline-block">↓</span>
                Scroll to see other images from the issue
              </p>
            )}
          </div>

          {/* Product details */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] uppercase tracking-wide">
              {product.title}
            </h1>

            <div className="mt-8">
              <ProductForm variants={variants} productTitle={product.title} />
            </div>

            {(product.description || product.descriptionHtml) && (
              <div className="mt-12 pt-8 border-t border-[#E5E5E5]">
                <div
                  className="text-[#6B6B6B] text-base leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0 [&_a]:underline [&_a]:hover:text-black"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Shopify product HTML from trusted source
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              </div>
            )}
          </div>
        </div>

        {/* You May Also Like */}
        <div className="mt-24 pt-16 border-t border-[#E5E5E5]">
          <h2 className="font-serif text-4xl text-[#1A1A1A] mb-8">
            You May Also Like
          </h2>
          {relatedProducts.length > 0 ? (
            <div className="flex flex-wrap gap-6 md:gap-8">
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
