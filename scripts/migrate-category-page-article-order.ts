import { getCliClient } from 'sanity/cli'

type Row = { _id: string }

const client = getCliClient({
  apiVersion: '2026-03-06',
}).withConfig({ perspective: 'raw' })

const CATEGORY_FIELDS = {
  interiors: 'interiorsArticles',
  arts: 'artsArticles',
  gardens: 'gardensArticles',
  fashion: 'fashionArticles',
} as const

async function articleRefsForCategory(category: keyof typeof CATEGORY_FIELDS) {
  const rows = await client.fetch<Row[]>(
    `*[
      _type == "article" &&
      category == $category &&
      !(_id in path("drafts.**"))
    ] | order(publishedAt desc){
      _id
    }`,
    { category }
  )

  return rows.map((row) => ({ _type: 'reference', _ref: row._id }))
}

async function run() {
  const interiorsRefs = await articleRefsForCategory('interiors')
  const artsRefs = await articleRefsForCategory('arts')
  const gardensRefs = await articleRefsForCategory('gardens')
  const fashionRefs = await articleRefsForCategory('fashion')

  await client.createIfNotExists({
    _id: 'categoryPage',
    _type: 'categoryPage',
  })

  await client
    .patch('categoryPage')
    .set({
      [CATEGORY_FIELDS.interiors]: interiorsRefs,
      [CATEGORY_FIELDS.arts]: artsRefs,
      [CATEGORY_FIELDS.gardens]: gardensRefs,
      [CATEGORY_FIELDS.fashion]: fashionRefs,
    })
    .commit()

  console.log(
    `Updated categoryPage order arrays: interiors=${interiorsRefs.length}, arts=${artsRefs.length}, gardens=${gardensRefs.length}, fashion=${fashionRefs.length}`
  )
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
