import { client } from '@/sanity/lib/client'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
  CATEGORY_PAGE_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleGrid } from '@/components/editorial/ArticleGrid'
import { CategoryPageImage } from '@/components/shared/CategoryPageImage'
import { NewsstandCta } from '@/components/shared/NewsstandCta'

export const revalidate = 3600

const CATEGORY_DESCRIPTION: Record<string, string> = {
  interiors:
    'Explore the world of interior design through the lens of renowned designers, architects, and tastemakers. From intimate at-home conversations to grand architectural statements.',
  gardens:
    'Discover landscapes, outdoor spaces, and the art of garden design. Stories from the world\'s most inspiring outdoor environments.',
  arts:
    'Art, culture, and the creative forces that define our visual world.',
}

export default async function ArtsPage() {
  const [articles, adBanner, categoryPage] = await Promise.all([
    client.fetch<unknown[]>(ARTICLES_BY_CATEGORY_QUERY, { category: 'arts' }),
    client.fetch<{
      image: { asset?: { _ref: string } }
      linkUrl?: string | null
      title?: string | null
    } | null>(AD_BANNER_BY_PLACEMENT_QUERY, { placement: 'category-top' }),
    client.fetch<{
      interiorsImage?: { asset?: { _ref: string }; alt?: string } | null
      artsImage?: { asset?: { _ref: string }; alt?: string } | null
      gardensImage?: { asset?: { _ref: string }; alt?: string } | null
    } | null>(CATEGORY_PAGE_QUERY),
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
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 pt-8 md:pt-12 pb-16 md:pb-24">
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
          <h1 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] uppercase tracking-wide">
            Arts
          </h1>
          <p className="mt-4 text-base text-[#6B6B6B] max-w-2xl mx-auto">
            {CATEGORY_DESCRIPTION.arts}
          </p>
        </header>

        {/* Article grid */}
        <ArticleGrid articles={typedArticles} />

        {/* Newsstand CTA */}
        <NewsstandCta />
      </div>

      {/* Category page image — fullscreen */}
      <CategoryPageImage image={categoryPage?.artsImage} />
    </main>
  )
}
