/**
 * Manual order from Studio (category page singleton). Each entry is shown;
 * we do not filter by `article.categories` — the list is the source of truth.
 */
export function orderedCategoryPageArticles<T extends { _id?: unknown; slug?: unknown }>(
  list: T[] | null | undefined
): T[] {
  return (list ?? []).filter(
    (item): item is T =>
      typeof item._id === 'string' &&
      typeof item.slug === 'string' &&
      item.slug.length > 0
  )
}

/** For cards/links when coalesce(category, categories[0]) is empty on the document. */
export function articleLinkCategory<T extends { category?: string | null }>(
  article: T,
  sectionCategory: string
): string {
  const c = typeof article.category === 'string' ? article.category.trim() : ''
  return c.length > 0 ? c : sectionCategory
}
