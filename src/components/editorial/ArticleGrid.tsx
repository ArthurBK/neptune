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
}

export function ArticleGrid({ articles, size = 'default' }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-base text-[#6B6B6B] py-16">
        No articles yet. Add content in Sanity Studio.
      </p>
    )
  }

  return (
    <div
      className={
        size === 'compact'
          ? 'mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8'
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12'
      }
    >
      {articles.map((article) => (
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
  )
}
