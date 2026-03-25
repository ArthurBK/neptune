import { articleLinkCategory, orderedCategoryPageArticles } from '@/lib/categoryLanding'
import { sanityFetch } from '@/sanity/lib/client'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLES_BY_CATEGORY_QUERY,
  CATEGORY_PAGE_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleCard } from '@/components/editorial/ArticleCard'
import { CategoryPageImage } from '@/components/shared/CategoryPageImage'
import { NewsstandCta } from '@/components/shared/NewsstandCta'

export const revalidate = 3600

const DEFAULT_ARTS_DESCRIPTION =
  'Art, culture, and the creative forces that define our visual world.'

export default async function ArtsPage() {
  const [articles, adBanner, categoryPage] = await Promise.all([
    sanityFetch<unknown[]>(ARTICLES_BY_CATEGORY_QUERY, { category: 'arts' }),
    sanityFetch<{
      image: { asset?: { _ref: string } }
      linkUrl?: string | null
      title?: string | null
    } | null>(AD_BANNER_BY_PLACEMENT_QUERY, { placement: 'category-top' }),
    sanityFetch<{
      artsDescription?: string | null
      interiorsArticles?: ArticleCardData[] | null
      artsArticles?: ArticleCardData[] | null
      gardensArticles?: ArticleCardData[] | null
      fashionArticles?: ArticleCardData[] | null
      interiorsImage?: { asset?: { _ref: string }; alt?: string; caption?: unknown } | null
      artsImage?: { asset?: { _ref: string }; alt?: string; caption?: unknown } | null
      gardensImage?: { asset?: { _ref: string }; alt?: string; caption?: unknown } | null
    } | null>(CATEGORY_PAGE_QUERY),
  ])

  const typedArticles = (articles ?? []) as ArticleCardData[]
  const orderedArticles = orderedCategoryPageArticles(categoryPage?.artsArticles)
  const displayArticles = orderedArticles.length > 0 ? orderedArticles : typedArticles
  const artsDescription = categoryPage?.artsDescription?.trim() || DEFAULT_ARTS_DESCRIPTION

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-6 md:pb-10">
        {/* Ad banner */}
        {adBanner?.image && (
          <div className="mb-12 md:mb-16">
            <AdBanner
              image={adBanner.image}
              linkUrl={adBanner.linkUrl}
              title={adBanner.title}
              unoptimized
            />
          </div>
        )}

        <div className="mx-auto mb-6 md:mb-8 h-px w-1/3 max-w-md bg-(--neptune-logo-red)" />

        {/* Category header */}
        <header className="mb-6 md:mb-12 text-center font-futura">
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] uppercase tracking-wide">
            Arts
          </h1>
          <p className="mt-2 text-sm md:text-[15px] text-black max-w-2xl mx-auto whitespace-pre-line font-[Helvetica,Arial,sans-serif]">
            {artsDescription}
          </p>
        </header>

        {/* Article list: one row per story (image left, text right) */}
        <section className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
          {displayArticles.map((article) => (
            <div key={article._id} className="max-w-4xl mx-auto">
              <ArticleCard
                title={article.title}
                slug={article.slug}
                category={articleLinkCategory(article, 'arts')}
                subcategory={article.subcategory}
                coverImage={article.coverImage}
                author={article.author}
                horizontal
                unoptimized
                imageFit="contain"
                titleClassName="text-lg md:text-2xl leading-tight"
              />
            </div>
          ))}
        </section>

        {/* Newsstand CTA */}
        <div className="my-10 md:my-14">
          <NewsstandCta unoptimizedLogo />
        </div>
      </div>

      {/* Category page image — fullscreen */}
      <CategoryPageImage image={categoryPage?.artsImage} />
    </main>
  )
}

type ArticleCardData = {
  _id: string
  title: string
  slug: string
  category: string
  categories?: string[] | null
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug: string } | null
}
