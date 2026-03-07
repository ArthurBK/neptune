import { client } from '@/sanity/lib/client'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleGrid } from '@/components/editorial/ArticleGrid'
import Link from 'next/link'

export const revalidate = 3600

const CATEGORY_DESCRIPTION: Record<string, string> = {
  interiors:
    'Explore the world of interior design through the lens of renowned designers, architects, and tastemakers. From intimate at-home conversations to grand architectural statements.',
  gardens:
    'Discover landscapes, outdoor spaces, and the art of garden design. Stories from the world\'s most inspiring outdoor environments.',
  fashion:
    'Fashion as expression—profiles, runway moments, and the people who shape how we dress.',
  arts:
    'Art, culture, and the creative forces that define our visual world.',
}

export default async function InteriorsPage() {
  const [articles, adBanner] = await Promise.all([
    client.fetch<unknown[]>(ARTICLES_BY_CATEGORY_QUERY, { category: 'interiors' }),
    client.fetch<{
      image: { asset?: { _ref: string } }
      linkUrl?: string | null
      title?: string | null
    } | null>(AD_BANNER_BY_PLACEMENT_QUERY, { placement: 'category-top' }),
  ])

  const typedArticles = articles as Array<{
    _id: string
    title: string
    slug: string
    category: string
    subcategory?: string | null
    coverImage: { asset?: { _ref: string }; alt?: string }
    author?: { name: string; slug: string } | null
  }>

  return (
    <main>
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-16 md:py-24">
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

        {/* Category header */}
        <header className="mb-12 md:mb-16 text-center">
          <h1 className="font-serif text-6xl md:text-7xl text-[#1A1A1A] uppercase tracking-wide">
            Interiors
          </h1>
          <p className="mt-4 text-base text-[#6B6B6B] max-w-2xl mx-auto">
            {CATEGORY_DESCRIPTION.interiors}
          </p>
        </header>

        {/* Article grid */}
        <ArticleGrid articles={typedArticles} />

        {/* Newsstand CTA */}
        <div className="mt-16 md:mt-24 pt-16 border-t border-[#E5E5E5] text-center">
          <Link
            href="/newsstand"
            className="text-sm tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
          >
            Discover all available issues →
          </Link>
        </div>
      </div>
    </main>
  )
}
