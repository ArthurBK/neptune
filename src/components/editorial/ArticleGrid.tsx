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
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <p className="text-center text-base text-[#6B6B6B] py-16">
        No articles yet. Add content in Sanity Studio.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
      {articles.map((article) => (
        <ArticleCard
          key={article._id}
          title={article.title}
          slug={article.slug}
          category={article.category}
          subcategory={article.subcategory}
          coverImage={article.coverImage}
          author={article.author}
        />
      ))}
    </div>
  )
}
