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
    <div className="mt-0 md:mt-12">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 text-center">
        <Link
          href={`/newsstand/${handle}`}
          className="block mx-auto mb-4 text-center font-serif text-3xl md:text-4xl text-[#1A1A1A] uppercase tracking-[0.02em] transition-colors hover:text-black"
        >
          Read the full issue
        </Link>

        {featuredImageUrl ? (
          <Link
            href={`/newsstand/${handle}`}
            className="group inline-flex items-center justify-center gap-6 rounded-sm transition-colors hover:text-black"
          >
            <span className="relative inline-block h-[260px] w-[200px] overflow-hidden bg-[#E5E5E5] md:h-[350px] md:w-[260px]">
              <Image
                src={featuredImageUrl}
                alt={featuredImageAlt}
                fill
                sizes="(max-width: 768px) 200px, 260px"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.06]"
              />
            </span>
          </Link>
        ) : null}
      </div>
    </div>
  )
}

