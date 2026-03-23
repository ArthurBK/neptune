import { getCliClient } from 'sanity/cli'

type ArticleDoc = {
  _id: string
  category?: string
  categories?: unknown
}

const client = getCliClient({
  apiVersion: '2026-03-06',
}).withConfig({ perspective: 'raw' })

function firstCategory(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined
  const first = value.find((item) => typeof item === 'string' && item.length > 0)
  return typeof first === 'string' ? first : undefined
}

async function run() {
  const articles = await client.fetch<ArticleDoc[]>(
    `*[_type == "article" && defined(categories)]{
      _id,
      category,
      categories
    }`
  )

  if (articles.length === 0) {
    console.log('No articles need single-category migration.')
    return
  }

  let updated = 0

  for (const article of articles) {
    const derivedCategory = firstCategory(article.categories)

    const patch = client.patch(article._id)

    if (!article.category && derivedCategory) {
      patch.set({ category: derivedCategory })
    }

    patch.unset(['categories'])
    await patch.commit()
    updated += 1
  }

  console.log(`Migrated ${updated} article(s) to single category.`)
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
