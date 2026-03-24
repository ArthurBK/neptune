import { getCliClient } from 'sanity/cli'

type ArticleRef = { _id: string }

async function run() {
  const client = getCliClient({ apiVersion: '2026-03-24' }).withConfig({
    useCdn: false,
    perspective: 'raw',
  })

  const docs = await client.fetch<ArticleRef[]>(
    `*[_type == "article" && categories == null && !(_id in path("versions.**"))]{ _id }`
  )

  if (docs.length === 0) {
    console.log('No article documents with null categories were found.')
    return
  }

  const tx = client.transaction()
  for (const doc of docs) {
    tx.patch(doc._id, { set: { categories: [] } })
  }

  await tx.commit()
  console.log(`Patched ${docs.length} article documents: categories null -> []`)
}

run().catch((error) => {
  console.error('Failed to normalize article categories:', error)
  process.exitCode = 1
})
