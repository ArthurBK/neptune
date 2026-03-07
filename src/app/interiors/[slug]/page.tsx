import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLE_BY_SLUG_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { ArticleCard } from '@/components/editorial/ArticleCard'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(
    `*[_type == "article" && category == "interiors"] { "slug": slug.current }`
  )
  return slugs.map((s) => ({ slug: s.slug }))
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function InteriorsArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params

  const [article, adTop, adMid, adBottom] = await Promise.all([
    client.fetch<ArticleData | null>(ARTICLE_BY_SLUG_QUERY, {
      slug,
      category: 'interiors',
    }),
    client.fetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-top',
    }),
    client.fetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-mid',
    }),
    client.fetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-bottom',
    }),
  ])

  if (!article) notFound()

  const coverImageUrl = article.coverImage?.asset
    ? urlFor(article.coverImage).width(1400).height(933).url()
    : null

  const relatedArticles = (article.relatedArticles ?? []) as ArticleCardData[]

  return (
    <main>
      <article>
        {/* Hero — full-bleed with title + author overlay */}
        {coverImageUrl && (
          <div className="relative w-full aspect-[4/5] md:aspect-[3/2] lg:aspect-[16/9] bg-[#0a0a0a]">
            <Image
              src={coverImageUrl}
              alt={article.coverImage?.alt ?? article.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-6 md:px-12 text-center">
              {article.subcategory && (
                <p className="text-xs tracking-[0.25em] uppercase text-white/80 mb-3">
                  {article.subcategory}
                </p>
              )}
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight max-w-3xl">
                {article.title}
              </h1>
              <div className="mt-4 flex flex-col items-center gap-1 text-sm text-white/90">
                {article.author && (
                  <p>
                    Written by{' '}
                    <Link
                      href={`/contributors/${article.author.slug}`}
                      className="uppercase hover:text-white transition-colors"
                    >
                      {article.author.name}
                    </Link>
                  </p>
                )}
                {article.photographer && (
                  <p>
                    Photographed by{' '}
                    <span className="uppercase">{article.photographer.name}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ad banner top */}
        {adTop?.image && (
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16">
            <AdBanner image={adTop.image} linkUrl={adTop.linkUrl} title={adTop.title} />
          </div>
        )}

        {/* Article body — text → 3 images row → text → full-width hero → repeat */}
        <div className="pt-2 pb-8">
          <ArticleBody value={article.body} />
        </div>

        {/* Ad banner mid */}
        {adMid?.image && (
          <div className="mt-16 max-w-[1400px] mx-auto px-6 md:px-12">
            <AdBanner image={adMid.image} linkUrl={adMid.linkUrl} title={adMid.title} />
          </div>
        )}

        {/* Ad banner bottom */}
        {adBottom?.image && (
          <div className="mt-16 max-w-[1400px] mx-auto px-6 md:px-12">
            <AdBanner image={adBottom.image} linkUrl={adBottom.linkUrl} title={adBottom.title} />
          </div>
        )}

        {/* Newsstand CTA */}
        <div className="mt-20 max-w-[580px] mx-auto px-6 md:px-12 text-center">
          <Link
            href="/newsstand"
            className="text-xs tracking-[0.25em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
          >
            Discover all available issues
          </Link>
        </div>

        {/* You May Also Like */}
        {relatedArticles.length > 0 && (
          <div className="mt-24 pt-20 border-t border-[#E5E5E5]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-12">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                {relatedArticles.map((a) => (
                  <ArticleCard
                    key={a._id}
                    title={a.title}
                    slug={a.slug}
                    category={a.category}
                    subcategory={a.subcategory}
                    coverImage={a.coverImage}
                    excerpt={a.excerpt}
                    author={a.author}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Affiliate disclosure */}
        {article.affiliateProducts && article.affiliateProducts.length > 0 && (
          <div className="max-w-[580px] mx-auto px-6 md:px-12 pb-20">
            <p className="text-sm text-[#6B6B6B] italic">
              Our editors independently curate all products. We may receive
              compensation from purchases through these links.
            </p>
          </div>
        )}
      </article>
    </main>
  )
}

type ArticleData = {
  title: string
  slug: { current: string }
  subcategory?: string | null
  coverImage?: { asset?: { _ref: string }; alt?: string }
  body: unknown
  author?: { name: string; slug: string } | null
  photographer?: { name: string } | null
  relatedArticles?: unknown[]
  affiliateProducts?: unknown[]
}

type AdData = {
  image: { asset?: { _ref: string } }
  linkUrl?: string | null
  title?: string | null
}

type ArticleCardData = {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  excerpt?: string | null
  author?: { name: string; slug: string } | null
}
