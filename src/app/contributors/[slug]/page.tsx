import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client, sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLES_BY_CONTRIBUTOR_QUERY,
  CONTRIBUTOR_BY_SLUG_QUERY,
  CONTRIBUTOR_SLUGS_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleCard } from '@/components/editorial/ArticleCard'
import {
  PageIntroText,
  hasPortableTextContent,
  type PageIntroPortableText,
} from '@/components/shared/PageIntroText'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(CONTRIBUTOR_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

interface ContributorPageProps {
  params: Promise<{ slug: string }>
}

type ContributorData = {
  _id: string
  name: string
  slug: string
  role?: string | null
  bio?: string | null
  bioRichText?: PageIntroPortableText | null
  portrait?: { asset?: { _ref: string }; alt?: string } | null
  location?: string | null
}

type ArticleCardData = {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug: string } | null
}

export default async function ContributorPage({ params }: ContributorPageProps) {
  const { slug } = await params

  const [contributor, articles, adBanner] = await Promise.all([
    sanityFetch<ContributorData | null>(CONTRIBUTOR_BY_SLUG_QUERY, { slug }),
    sanityFetch<ArticleCardData[]>(ARTICLES_BY_CONTRIBUTOR_QUERY, {
      contributorSlug: slug,
    }),
    sanityFetch<{ image: { asset?: { _ref: string } }; linkUrl?: string | null; title?: string | null } | null>(
      AD_BANNER_BY_PLACEMENT_QUERY,
      { placement: 'category-top' }
    ),
  ])

  if (!contributor) notFound()

  const portraitUrl = contributor.portrait?.asset
    ? urlFor(contributor.portrait).width(600).height(800).url()
    : null
  const bioRichText = hasPortableTextContent(contributor.bioRichText)
    ? contributor.bioRichText
    : null
  const legacyBio = !bioRichText ? contributor.bio?.trim() : null

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24">
        {/* Contributor header */}
        <header className="flex flex-col md:flex-row gap-12 md:gap-16 items-start md:items-center mb-16">
          {portraitUrl && (
            <div className="flex-shrink-0 w-full md:w-[45%] max-w-md aspect-[3/4] bg-[#E5E5E5] overflow-hidden">
              <Image
                src={portraitUrl}
                alt={contributor.portrait?.alt ?? contributor.name}
                width={600}
                height={800}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}
          <div className="flex-1">
            {contributor.role && (
              <p className="text-sm tracking-[0.2em] uppercase text-[#6B6B6B] mb-2">
                {contributor.role}
              </p>
            )}
            <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] tracking-wide text-center">
              {contributor.name}
            </h1>
            {contributor.location && (
              <p className="mt-2 text-base text-[#6B6B6B]">{contributor.location}</p>
            )}
            {(bioRichText || legacyBio) && (
              <div className="mt-6 text-center">
                {bioRichText ? (
                  <PageIntroText value={bioRichText} />
                ) : (
                  <p className="mx-auto max-w-2xl whitespace-pre-line text-center text-sm leading-relaxed text-[#1A1A1A] font-[Helvetica,Arial,sans-serif] md:text-[15px]">
                    {legacyBio}
                  </p>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Ad banner */}
        {adBanner?.image && (
          <div className="mb-12 md:mb-16">
            <AdBanner
              image={adBanner.image}
              linkUrl={adBanner.linkUrl}
              title={adBanner.title}
            />
          </div>
        )}

        {/* Articles by this contributor */}
        <section className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
          {articles.length > 0 ? (
            articles.map((article) => (
              <div key={article._id} className="max-w-4xl mx-auto">
                <ArticleCard
                  title={article.title}
                  slug={article.slug}
                  category={article.category}
                  subcategory={article.subcategory}
                  coverImage={article.coverImage}
                  author={article.author}
                  horizontal
                  unoptimized
                  imageFit="contain"
                  titleClassName="text-lg md:text-2xl leading-tight"
                />
              </div>
            ))
          ) : (
            <p className="text-[#6B6B6B] py-12">
              No articles yet.
            </p>
          )}
        </section>

        {/* Back to contributors */}
        <div className="mt-8 pt-8 text-center">
          <Link
            href="/contributors"
            className="font-futura text-sm tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
          >
            All contributors
          </Link>
        </div>
      </div>
    </main>
  )
}
