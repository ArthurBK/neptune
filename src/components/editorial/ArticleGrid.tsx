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
}: {
  article: Article
  size: 'default' | 'compact' | 'featured'
  fillHeight?: boolean
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
  const gridClass = `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${gapClass}`

  const wrapperClass = size === 'compact' ? 'max-w-2xl mx-auto' : ''

  return (
    <div className={wrapperClass}>
      {useFeatured && (
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${gapClass} mb-8 md:mb-12`}>
          <div className="lg:col-span-2 lg:row-span-2 min-w-0">
            <CardFromArticle article={featuredArticles[0]} size="featured" fillHeight />
          </div>
          <div className="min-w-0">
            <CardFromArticle article={featuredArticles[1]} size="compact" />
          </div>
          <div className="min-w-0">
            <CardFromArticle article={featuredArticles[2]} size="compact" />
          </div>
        </div>
      )}
      {restArticles.length > 0 && (
        <div className={gridClass}>
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
