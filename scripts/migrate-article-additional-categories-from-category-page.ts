import { getCliClient } from 'sanity/cli'

type Ref = { _ref?: string }
type CategoryPageDoc = {
  interiorsArticles?: Ref[]
  artsArticles?: Ref[]
  gardensArticles?: Ref[]
  fashionArticles?: Ref[]
}

type ArticleDoc = {
  _id: string
  category?: string
  categories?: string[] | null
}

const CATEGORY_FIELDS: Array<{ field: keyof CategoryPageDoc; category: string }> = [
  { field: 'interiorsArticles', category: 'interiors' },
  { field: 'artsArticles', category: 'arts' },
  { field: 'gardensArticles', category: 'gardens' },
  { field: 'fashionArticles', category: 'fashion' },
]

const client = getCliClient({
  apiVersion: '2026-03-06',
}).withConfig({ perspective: 'raw' })

function safeRefs(list: Ref[] | undefined): string[] {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => item?._ref)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
}

async function run() {
  const categoryPage = await client.fetch<CategoryPageDoc | null>(
    `*[_id == "categoryPage"][0]{
      interiorsArticles[]{_ref},
      artsArticles[]{_ref},
      gardensArticles[]{_ref},
      fashionArticles[]{_ref}
    }`
  )

  if (!categoryPage) {
    console.log('No categoryPage document found.')
    return
  }

  const map = new Map<string, Set<string>>()
  for (const { field, category } of CATEGORY_FIELDS) {
    for (const ref of safeRefs(categoryPage[field])) {
      if (!map.has(ref)) map.set(ref, new Set())
      map.get(ref)!.add(category)
    }
  }

  const ids = Array.from(map.keys())
  if (ids.length === 0) {
    console.log('No referenced articles to migrate.')
    return
  }

  const articles = await client.fetch<ArticleDoc[]>(
    `*[_type == "article" && _id in $ids]{ _id, category, categories }`,
    { ids }
  )

  let updated = 0
  for (const article of articles) {
    const desired = map.get(article._id)
    if (!desired) continue

    const primary = article.category ?? null
    const existing = new Set(
      (Array.isArray(article.categories) ? article.categories : []).filter(
        (value): value is string => typeof value === 'string' && value.length > 0
      )
    )

    for (const category of desired) {
      if (category !== primary) existing.add(category)
    }

    const next = Array.from(existing)
    await client.patch(article._id).set({ categories: next.length > 0 ? next : null }).commit()

    const draftId = `drafts.${article._id}`
    await client
      .patch(draftId)
      .setIfMissing({ _type: 'article' })
      .set({ categories: next.length > 0 ? next : null })
      .commit({ autoGenerateArrayKeys: true })
      .catch(() => {
        // Ignore when matching draft doesn't exist.
      })

    updated += 1
  }

  console.log(`Updated additional categories for ${updated} article(s).`)
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
