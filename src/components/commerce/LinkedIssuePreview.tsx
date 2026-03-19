import Image from 'next/image'
import Link from 'next/link'

import { shopifyFetch } from '@/lib/shopify/client'
import { PRODUCT_BY_HANDLE_HERO_QUERY } from '@/lib/shopify/queries'

type ShopifyFeaturedImage = {
  url: string
  altText: string | null
}

type ProductByHandleHeroResponse = {
  product:
    | {
        title: string
        handle: string
        featuredImage: ShopifyFeaturedImage | null
      }
    | null
}

export async function LinkedIssuePreview({ handle }: { handle: string }) {
  const data = await shopifyFetch<ProductByHandleHeroResponse>({
    query: PRODUCT_BY_HANDLE_HERO_QUERY,
    variables: { handle },
  })

  const product = data.product
  const featuredImageUrl = product?.featuredImage?.url
  const featuredImageAlt =
    product?.featuredImage?.altText ?? product?.title ?? 'Linked issue'

  return (
    <div className="mt-12 pb-16">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 text-center">
        <p className="font-header text-xs font-bold uppercase tracking-[0.25em] text-(--neptune-logo-red) mb-3">
          Linked Issue
        </p>

        {featuredImageUrl ? (
          <Link
            href={`/newsstand/${handle}`}
            className="group inline-flex items-center justify-center gap-6 rounded-sm transition-colors hover:text-black"
          >
            <span className="relative inline-block h-[160px] w-[120px] overflow-hidden bg-[#E5E5E5] md:h-[220px] md:w-[160px]">
              <Image
                src={featuredImageUrl}
                alt={featuredImageAlt}
                fill
                sizes="(max-width: 768px) 120px, 160px"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
              />
            </span>
            <span className="text-sm uppercase tracking-[0.2em] text-[#6B6B6B] group-hover:underline underline-offset-4">
              View the linked issue
            </span>
          </Link>
        ) : (
          <Link
            href={`/newsstand/${handle}`}
            className="inline-block text-xs uppercase tracking-[0.2em] text-[#6B6B6B] transition-colors hover:text-black hover:underline"
          >
            View the linked issue
          </Link>
        )}
      </div>
    </div>
  )
}

