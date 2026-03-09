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
import { ArticleGrid } from '@/components/editorial/ArticleGrid'

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
  bio: string
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

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
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
            <h1 className="font-serif text-5xl md:text-6xl text-[#1A1A1A] leading-tight">
              {contributor.name}
            </h1>
            {contributor.location && (
              <p className="mt-2 text-base text-[#6B6B6B]">{contributor.location}</p>
            )}
            <div className="mt-6 prose prose-lg max-w-none">
              <p className="text-[#1A1A1A] leading-relaxed whitespace-pre-line">
                {contributor.bio}
              </p>
            </div>
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
        <section>
          <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-8">
            Articles by {contributor.name}
          </h2>
          {articles.length > 0 ? (
            <ArticleGrid articles={articles} />
          ) : (
            <p className="text-[#6B6B6B] py-12">
              No articles yet.
            </p>
          )}
        </section>

        {/* Back to contributors */}
        <div className="mt-16 pt-16 border-t border-[#E5E5E5] text-center">
          <Link
            href="/contributors"
            className="text-sm tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
          >
            ← All contributors
          </Link>
        </div>
      </div>
    </main>
  )
}
