import { getCliClient } from 'sanity/cli'

type ArticleDoc = {
  _id: string
  category?: string
  categories?: unknown
}

const client = getCliClient({
  apiVersion: '2026-03-06',
}).withConfig({ perspective: 'raw' })

async function run() {
  const articles = await client.fetch<ArticleDoc[]>(
    `*[
      _type == "article" &&
      defined(category) &&
      (!defined(categories) || categories == null || count(categories) == 0)
    ]{
      _id,
      category,
      categories
    }`
  )

  if (articles.length === 0) {
    console.log('No articles need migration.')
    return
  }

  console.log(`Found ${articles.length} article(s) to migrate.`)

  let migrated = 0
  for (const article of articles) {
    if (!article.category) continue

    await client
      .patch(article._id)
      .setIfMissing({ categories: [] })
      .append('categories', [article.category])
      .commit()

    migrated += 1
  }

  console.log(`Migrated ${migrated} article(s).`)
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
