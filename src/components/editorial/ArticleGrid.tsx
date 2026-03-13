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
}

function CardFromArticle({
  article,
  size,
  fillHeight,
  horizontal,
}: {
  article: Article
  size: 'default' | 'compact' | 'featured'
  fillHeight?: boolean
  horizontal?: boolean
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
    />
  )
}

export function ArticleGrid({
  articles,
  size = 'default',
  featuredLayout = false,
}: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-base text-[#6B6B6B] py-16">
        No articles yet. Add content in Sanity Studio.
      </p>
    )
  }

  const useFeatured = featuredLayout && articles.length >= 3
  const featuredArticles = useFeatured ? articles.slice(0, 3) : []
  const restArticles = useFeatured ? articles.slice(3) : articles
  const gapClass = size === 'compact' ? 'gap-6 md:gap-8' : 'gap-8 md:gap-12'
  const gridClass = `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${gapClass}`

  const wrapperClass = size === 'compact' ? 'max-w-2xl mx-auto' : ''

  return (
    <div>
      {useFeatured && (
        <>
          {/* Mobile: single column, same card style one by one */}
          <div className={`grid grid-cols-1 ${gapClass} mb-8 md:mb-12 lg:hidden`}>
            {featuredArticles.map((article) => (
              <CardFromArticle key={article._id} article={article} size={size === 'compact' ? 'compact' : 'default'} />
            ))}
          </div>
          {/* Desktop: featured 2-column layout */}
          <div className={`hidden lg:grid grid-cols-[3fr_2fr] ${gapClass} mb-8 md:mb-12 lg:max-h-[80vh]`}>
            <div className="min-w-0 lg:max-h-[80vh]">
              <CardFromArticle article={featuredArticles[0]} size="featured" fillHeight />
            </div>
            <div className="min-w-0 flex flex-col gap-6 md:gap-8 lg:max-h-[80vh]">
              <div className="flex-1 min-h-0">
                <CardFromArticle article={featuredArticles[1]} size="compact" horizontal />
              </div>
              <div className="flex-1 min-h-0">
                <CardFromArticle article={featuredArticles[2]} size="compact" horizontal />
              </div>
            </div>
          </div>
        </>
      )}
      {restArticles.length > 0 && (
        <div className={`${gridClass} ${wrapperClass}`}>
          {restArticles.map((article) => (
            <ArticleCard
              key={article._id}
              title={article.title}
              slug={article.slug}
              category={article.category}
              subcategory={article.subcategory}
              coverImage={article.coverImage}
              author={article.author}
              size={size}
            />
          ))}
        </div>
      )}
    </div>
  )
}
