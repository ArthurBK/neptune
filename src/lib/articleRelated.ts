export type RelatedArticleForCard = {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage?: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug: string } | null
}

/** Related articles picked in Sanity (order preserved); drops broken refs. */
export function relatedArticlesFromSanity(
  raw: RelatedArticleForCard[] | null | undefined
): RelatedArticleForCard[] {
  return (raw ?? []).filter(
    (a): a is RelatedArticleForCard =>
      Boolean(
        a?._id &&
        typeof a.slug === 'string' &&
        a.slug.length > 0 &&
        typeof a.category === 'string' &&
        a.category.length > 0 &&
        typeof a.title === 'string'
      )
  )
}
