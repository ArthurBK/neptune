import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getCliClient } from 'sanity/cli'

type Ref = { _ref?: string }

type CategoryPageDoc = {
  storiesArticles?: Ref[] | null
  storiesDescription?: string | null
  storiesImage?: unknown
  interiorsArticles?: Ref[] | null
  artsArticles?: Ref[] | null
  gardensArticles?: Ref[] | null
  fashionArticles?: Ref[] | null
  travelArticles?: Ref[] | null
}

type StoriesPageDoc = {
  articles?: Ref[] | null
  description?: string | null
  image?: unknown
}

type ArticleRow = { _id: string }

try {
  const env = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {
  // .env.local is optional when running in an environment that already provides vars.
}

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET

if (!projectId || !dataset) {
  throw new Error('Missing Sanity projectId or dataset environment variables.')
}

const client = getCliClient({
  projectId,
  dataset,
  apiVersion: '2026-03-06',
}).withConfig({ perspective: 'raw' })

const LEGACY_ARTICLE_FIELDS: Array<keyof CategoryPageDoc> = [
  'storiesArticles',
  'interiorsArticles',
  'artsArticles',
  'gardensArticles',
  'fashionArticles',
  'travelArticles',
]

function refIds(list: Ref[] | null | undefined): string[] {
  if (!Array.isArray(list)) return []
  return list
    .map((item) => item?._ref)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
}

function uniqueRefs(ids: string[]) {
  const seen = new Set<string>()
  return ids
    .filter((id) => {
      if (seen.has(id)) return false
      seen.add(id)
      return true
    })
    .map((id) => ({ _type: 'reference', _ref: id }))
}

async function run() {
  const [legacy, existing, allArticles] = await Promise.all([
    client.fetch<CategoryPageDoc | null>(
      `*[_id == "categoryPage"][0]{
        storiesArticles[]{_ref},
        storiesDescription,
        storiesImage,
        interiorsArticles[]{_ref},
        artsArticles[]{_ref},
        gardensArticles[]{_ref},
        fashionArticles[]{_ref},
        travelArticles[]{_ref}
      }`
    ),
    client.fetch<StoriesPageDoc | null>(
      `*[_id == "storiesPage"][0]{ articles[]{_ref}, description, image }`
    ),
    client.fetch<ArticleRow[]>(
      `*[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc){ _id }`
    ),
  ])

  const existingIds = refIds(existing?.articles)
  const legacyIds = LEGACY_ARTICLE_FIELDS.flatMap((field) => refIds(legacy?.[field] as Ref[] | null | undefined))
  const fallbackIds = allArticles.map((article) => article._id)
  const articles = uniqueRefs([...(existingIds.length > 0 ? existingIds : legacyIds), ...fallbackIds])

  await client.createIfNotExists({ _id: 'storiesPage', _type: 'storiesPage' })

  const patch = client.patch('storiesPage').set({ articles })

  if (!existing?.description && legacy?.storiesDescription) {
    patch.set({ description: legacy.storiesDescription })
  }

  if (!existing?.image && legacy?.storiesImage) {
    patch.set({ image: legacy.storiesImage })
  }

  await patch.commit({ autoGenerateArrayKeys: true })

  console.log(`Updated storiesPage with ${articles.length} article reference(s).`)
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
