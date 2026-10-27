import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/lib/client'
import { isStoriesVisible } from '@/sanity/lib/stories'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  STORIES_PAGE_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleCard } from '@/components/editorial/ArticleCard'
import { CategoryPageImage } from '@/components/shared/CategoryPageImage'
import { NewsstandCta } from '@/components/shared/NewsstandCta'
import {
  PageIntroText,
  hasPortableTextContent,
  type PageIntroPortableText,
} from '@/components/shared/PageIntroText'

export const revalidate = 3600

type ArticleCardData = {
  _id: string
  title: string
  slug: string
  category?: string | null
  categories?: string[] | null
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug?: string | null } | null
}

type StoriesPageData = {
  description?: string | null
  introText?: PageIntroPortableText | null
  articles?: (ArticleCardData | null)[] | null
  image?: { asset?: { _ref: string }; alt?: string; caption?: unknown } | null
}

export default async function StoriesPage() {
  if (!(await isStoriesVisible())) notFound()

  const [storiesPage, adBanner] = await Promise.all([
    sanityFetch<StoriesPageData | null>(STORIES_PAGE_QUERY),
    sanityFetch<{
      image: { asset?: { _ref: string } }
      linkUrl?: string | null
      title?: string | null
    } | null>(AD_BANNER_BY_PLACEMENT_QUERY, { placement: 'category-top' }),
  ])

  const displayArticles = (storiesPage?.articles ?? []).filter(
    (article): article is ArticleCardData => Boolean(article?._id && article.slug)
  )
  const introText = hasPortableTextContent(storiesPage?.introText) ? storiesPage.introText : null
  const legacyIntroText = !introText ? storiesPage?.description?.trim() : null

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-6 md:pb-10">
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

        {(introText || legacyIntroText) && (
          <section className="mb-8 md:mb-12 text-center">
            {introText ? (
              <PageIntroText value={introText} />
            ) : (
              <p
                className="text-sm md:text-[16px] text-black max-w-2xl mx-auto whitespace-pre-line"
                style={{ fontFamily: 'var(--font-gill-sans)', fontWeight: 300 }}
              >
                {legacyIntroText}
              </p>
            )}
          </section>
        )}

        <section className="space-y-6 md:space-y-8 max-w-5xl mx-auto">
          {displayArticles.length > 0 ? (
            displayArticles.map((article) => (
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
            <p className="text-center text-base text-[#6B6B6B] py-16">
              No stories yet.
            </p>
          )}
        </section>

        <div className="my-10 md:my-14">
          <NewsstandCta unoptimizedLogo />
        </div>
      </div>

      <CategoryPageImage image={storiesPage?.image} />
    </main>
  )
}
