import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client, sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLE_SLUGS_BY_CATEGORY_QUERY,
} from '@/sanity/lib/queries'

import { articleTitleSingleLine } from '@/lib/articleTitle'
import { formatPersonName } from '@/lib/personName'
import {
  relatedArticlesFromSanity,
  type RelatedArticleForCard,
} from '@/lib/articleRelated'
import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { ArticleCard } from '@/components/editorial/ArticleCard'
import {
  ArticleAffiliateProductsSection,
  type ArticleAffiliateProduct,
} from '@/components/editorial/ArticleAffiliateProductsSection'
import { NewsstandCta } from '@/components/shared/NewsstandCta'
import { LinkedIssuePreview } from '@/components/commerce/LinkedIssuePreview'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(
    ARTICLE_SLUGS_BY_CATEGORY_QUERY,
    { category: 'fashion' }
  )
  return slugs.map((s) => ({ slug: s.slug }))
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function FashionArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params

  const [article, adTop, adMid, adBottom] = await Promise.all([
    sanityFetch<ArticleData | null>(ARTICLE_BY_SLUG_QUERY, {
      slug,
      category: 'fashion',
    }),
    sanityFetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-top',
    }),
    sanityFetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-mid',
    }),
    sanityFetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-bottom',
    }),
  ])

  if (!article) notFound()

  const coverImageUrl = article.coverImage?.asset
    ? urlFor(article.coverImage).width(2400).height(1600).quality(90).url()
    : null

  const relatedArticles = relatedArticlesFromSanity(article.relatedArticles)

  return (
    <main>
      <article>
        {/* Hero — title above (black), image below */}
        <header className="px-6 md:px-12 lg:px-16 pt-8 md:pt-10 pb-8 md:pb-10 text-center text-black">
          {article.subcategory && (
            <p className="mb-3 font-header text-xs font-bold uppercase tracking-[0.25em] text-(--neptune-logo-red)">
              {article.subcategory}
            </p>
          )}
          <h1 className="mx-auto max-w-3xl whitespace-pre-line font-serif text-4xl leading-tight tracking-tight text-black md:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-col items-center gap-1 text-sm text-black/80">
            {article.author && (
              <p>
                Words by{' '}
                <Link
                  href={`/contributors/${article.author.slug}`}
                  className="text-black hover:underline underline-offset-2 transition-colors"
                >
                  {formatPersonName(article.author.name)}
                </Link>
              </p>
            )}
            {article.photographer && (
              <p>
                Photography by{' '}
                <Link
                  href={`/contributors/photographer/${article.photographer.slug}`}
                  className="text-black hover:underline underline-offset-2 transition-colors"
                >
                  {formatPersonName(article.photographer.name)}
                </Link>
              </p>
            )}
          </div>
        </header>
        {coverImageUrl && (
          <>
            <div className="relative w-full aspect-4/5 bg-[#0a0a0a] md:aspect-3/2 lg:aspect-video">
              <Image
                src={coverImageUrl}
                alt={article.coverImage?.alt ?? articleTitleSingleLine(article.title)}
                fill
                sizes="100vw"
                className="object-cover"
                priority
                unoptimized
              />
            </div>
            {hasCaptionContent(article.coverImage?.caption) && (
              <div className="px-6 md:px-12 lg:px-16 mt-3 text-center">
                <p className="text-sm italic text-[#6B6B6B]">
                  <SanityCaption value={article.coverImage?.caption} />
                </p>
              </div>
            )}
          </>
        )}

        {/* Ad banner top */}
        {adTop?.image && (
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16">
            <AdBanner image={adTop.image} linkUrl={adTop.linkUrl} title={adTop.title} />
          </div>
        )}

        {/* Article body — text → 3 images row → text → full-width hero → repeat */}
        <div className="pt-2 pb-4">
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

        {/* Linked Issue — Shopify product handle stored in Sanity */}
        {article.linkedIssue ? (
          <LinkedIssuePreview handle={article.linkedIssue} />
        ) : null}

        {/* Newsstand CTA */}
        <div className="mt-6">
          <NewsstandCta />
        </div>

        {/* Related articles — from Sanity */}
        {relatedArticles.length > 0 && (
          <div className="mt-6 pt-12">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-10 text-center uppercase tracking-[0.02em]">
                YOU MAY ALSO LIKE
              </h2>
              <div className="flex flex-wrap justify-center gap-10 md:gap-16">
                {relatedArticles.map((a) => (
                  <div
                    key={a._id}
                    className="max-w-[260px]"
                  >
                    <ArticleCard
                      title={a.title}
                      slug={a.slug}
                      category={a.category}
                      subcategory={a.subcategory}
                      coverImage={a.coverImage ?? {}}
                      author={a.author}
                      size="compact"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <ArticleAffiliateProductsSection products={article.affiliateProducts} />

      </article>
    </main>
  )
}

type ArticleData = {
  _id: string
  title: string
  slug: { current: string }
  category: string
  subcategory?: string | null
  linkedIssue?: string | null
  coverImage?: { asset?: { _ref: string }; alt?: string; caption?: unknown }
  body: unknown
  author?: { name: string; slug: string } | null
  photographer?: { name: string; slug: string } | null
  relatedArticles?: RelatedArticleForCard[]
  affiliateProducts?: ArticleAffiliateProduct[]
}

type AdData = {
  image: { asset?: { _ref: string } }
  linkUrl?: string | null
  title?: string | null
}

