import { ArticleCard } from './ArticleCard'

interface Article {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug: string } | null
}

interface ArticleGridProps {
  articles: Article[]
  size?: 'default' | 'compact'
  /** When true, first 3 articles use 2-column layout: left 1 large, right 2 stacked (half height each). */
  featuredLayout?: boolean
  /** Disable Next image optimization for cards in this grid. */
  unoptimizedImages?: boolean
}

function CardFromArticle({
  article,
  size,
  fillHeight,
  horizontal,
  unoptimizedImages,
  imageFit,
  imageAspectClass,
  titleClassName,
}: {
  article: Article
  size: 'default' | 'compact' | 'featured'
  fillHeight?: boolean
  horizontal?: boolean
  unoptimizedImages?: boolean
  imageFit?: 'cover' | 'contain'
  imageAspectClass?: string
  titleClassName?: string
}) {
  return (
    <ArticleCard
      key={article._id}
      title={article.title}
      slug={article.slug}
      category={article.category}
      subcategory={article.subcategory}
      coverImage={article.coverImage}
      author={article.author}
      size={size}
      fillHeight={fillHeight}
      horizontal={horizontal}
      unoptimized={unoptimizedImages}
      imageFit={imageFit}
      imageAspectClass={imageAspectClass}
      titleClassName={titleClassName}
    />
  )
}

export function ArticleGrid({
  articles,
  size = 'default',
  featuredLayout = false,
  unoptimizedImages = false,
}: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-base text-[#6B6B6B] py-16">
        No articles yet. Add content in Sanity Studio.
      </p>
    )
  }

  const gapClass = size === 'compact' ? 'gap-6 md:gap-8' : 'gap-8 md:gap-12'

  const useFeatured = featuredLayout && articles.length >= 4

  if (!useFeatured) {
    const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`
    const wrapperClass = size === 'compact' ? 'max-w-2xl mx-auto' : ''
    return (
      <div className={`${gridClass} ${wrapperClass}`}>
        {articles.map((article) => (
          <CardFromArticle
            key={article._id}
            article={article}
            size={size}
            unoptimizedImages={unoptimizedImages}
            titleClassName="text-lg"
          />
        ))}
      </div>
    )
  }

  // Split all articles into groups of 4; any remainder renders as a plain grid
  const groups: Article[][] = []
  for (let i = 0; i < articles.length; i += 4) {
    groups.push(articles.slice(i, i + 4))
  }
  return (
    <div>
      {groups.map((group, groupIndex) => (
        <div key={group[0]._id} className="mb-8 md:mb-12">
          {/* Mobile: single column */}
          <div className={`grid grid-cols-1 ${gapClass} lg:hidden`}>
            {group.map((article) => (
              <CardFromArticle
                key={article._id}
                article={article}
                size={size === 'compact' ? 'compact' : 'default'}
                unoptimizedImages={unoptimizedImages}
                titleClassName="text-lg"
              />
            ))}
          </div>
          {/* Desktop: always the same 2-column structure; missing slots get empty boxes */}
          <div
            className={`hidden lg:grid ${gapClass} justify-center items-stretch ${
              groupIndex % 2 === 0
                ? 'grid-cols-[minmax(0,460px)_minmax(0,360px)]'
                : 'grid-cols-[minmax(0,360px)_minmax(0,460px)]'
            }`}
          >
            {groupIndex % 2 === 0 ? (
              <>
                {/* Default pattern: feature column left, stacked column right */}
                <div className="min-w-0 w-full h-full grid grid-rows-[1.6fr_0.8fr] gap-6 md:gap-8">
                  <div className="min-h-0">
                    <CardFromArticle article={group[0]} size="default" fillHeight unoptimizedImages={unoptimizedImages} titleClassName="text-lg" />
                  </div>
                  <div className="min-h-0 w-full">
                    {group[3] ? (
                      <CardFromArticle
                        article={group[3]}
                        size="compact"
                        unoptimizedImages={unoptimizedImages}
                        imageFit="cover"
                        imageAspectClass="aspect-[16/9]"
                        titleClassName="text-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 w-full flex flex-col gap-6 md:gap-8">
                  <div className="flex-1">
                    {group[1] ? (
                      <CardFromArticle article={group[1]} size="compact" unoptimizedImages={unoptimizedImages} imageFit="contain" titleClassName="text-lg" />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    {group[2] ? (
                      <CardFromArticle article={group[2]} size="compact" unoptimizedImages={unoptimizedImages} imageFit="contain" titleClassName="text-lg" />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Alternating pattern: stacked column left, feature column right */}
                <div className="min-w-0 w-full flex flex-col gap-6 md:gap-8">
                  <div className="flex-1">
                    {group[1] ? (
                      <CardFromArticle article={group[1]} size="compact" unoptimizedImages={unoptimizedImages} imageFit="contain" titleClassName="text-lg" />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    {group[2] ? (
                      <CardFromArticle article={group[2]} size="compact" unoptimizedImages={unoptimizedImages} imageFit="contain" titleClassName="text-lg" />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 w-full h-full grid grid-rows-[1.6fr_0.8fr] gap-6 md:gap-8">
                  <div className="min-h-0">
                    <CardFromArticle article={group[0]} size="default" fillHeight unoptimizedImages={unoptimizedImages} titleClassName="text-lg" />
                  </div>
                  <div className="min-h-0 w-full">
                    {group[3] ? (
                      <CardFromArticle
                        article={group[3]}
                        size="compact"
                        unoptimizedImages={unoptimizedImages}
                        imageFit="cover"
                        imageAspectClass="aspect-[16/9]"
                        titleClassName="text-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-white" />
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
