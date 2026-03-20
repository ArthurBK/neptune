import Link from 'next/link'

import { AffiliateProductCard } from '@/components/market/AffiliateProductCard'

export type ArticleAffiliateProduct = {
  _id: string
  title?: string | null
  brand?: string | null
  price?: string | null
  image?: { asset?: { _ref: string }; alt?: string }
  affiliateUrl?: string | null
}

export function ArticleAffiliateProductsSection({
  products,
}: {
  products: ArticleAffiliateProduct[] | null | undefined
}) {
  const valid = (products ?? []).filter(
    (p): p is ArticleAffiliateProduct & { affiliateUrl: string } =>
      Boolean(p?._id && p?.affiliateUrl)
  )
  if (valid.length === 0) return null

  return (
    <section
      className="mt-6 pt-8 pb-12 md:pb-10"
      aria-label="Featured products from this story"
    >
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl uppercase tracking-wide text-black md:text-3xl">
            Shop the edit
          </h2>
          <Link
            href="/the-market"
            className="mt-3 inline-block text-xs uppercase tracking-[0.2em] text-[#6B6B6B] transition-colors hover:text-black hover:underline"
          >
            Neptune Market
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          {valid.map((p) => (
            <div key={p._id} className="flex-none w-[220px]">
              <AffiliateProductCard
                title={p.title ?? ''}
                brand={p.brand ?? ''}
                price={p.price ?? ''}
                image={p.image ?? {}}
                affiliateUrl={p.affiliateUrl}
              />
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-xl text-center text-sm italic text-[#6B6B6B]">
          Our editors independently curate all products. We may receive compensation from
          purchases through these links.
        </p>
      </div>
    </section>
  )
}
