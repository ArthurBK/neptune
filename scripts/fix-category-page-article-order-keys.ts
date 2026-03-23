import { randomUUID } from 'node:crypto'
import { getCliClient } from 'sanity/cli'

type RefItem = {
  _type?: string
  _ref?: string
  _key?: string
}

type CategoryPageDoc = {
  interiorsArticles?: RefItem[]
  artsArticles?: RefItem[]
  gardensArticles?: RefItem[]
  fashionArticles?: RefItem[]
}

const client = getCliClient({
  apiVersion: '2026-03-06',
}).withConfig({ perspective: 'raw' })

function ensureKeys(items: RefItem[] | undefined): RefItem[] {
  if (!Array.isArray(items)) return []

  return items
    .filter((item) => typeof item?._ref === 'string' && item._ref.length > 0)
    .map((item) => ({
      _type: 'reference',
      _ref: item._ref!,
      _key: typeof item._key === 'string' && item._key.length > 0 ? item._key : randomUUID(),
    }))
}

async function run() {
  const page = await client.fetch<CategoryPageDoc | null>(
    `*[_id == "categoryPage"][0]{
      interiorsArticles,
      artsArticles,
      gardensArticles,
      fashionArticles
    }`
  )

  if (!page) {
    console.log('No categoryPage document found.')
    return
  }

  const interiorsArticles = ensureKeys(page.interiorsArticles)
  const artsArticles = ensureKeys(page.artsArticles)
  const gardensArticles = ensureKeys(page.gardensArticles)
  const fashionArticles = ensureKeys(page.fashionArticles)

  await client
    .patch('categoryPage')
    .set({
      interiorsArticles,
      artsArticles,
      gardensArticles,
      fashionArticles,
    })
    .commit()

  console.log(
    `Fixed _key values: interiors=${interiorsArticles.length}, arts=${artsArticles.length}, gardens=${gardensArticles.length}, fashion=${fashionArticles.length}`
  )
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Key repair failed: ${message}`)
  process.exit(1)
})
