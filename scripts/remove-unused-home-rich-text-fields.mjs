import { getCliClient } from 'sanity/cli'

// These fields are valid only on their respective section types.
const allowedFields = {
  homeArticleBlock: [],
  homeThreeArticlesBlock: ['titleRichText'],
  homeImageBlock: [],
  homeProductBlock: [],
  homeVideoBlock: [],
  homeNewsstandBlock: ['titleRichText', 'descriptionRichText'],
  homeNewsletterBlock: ['subtitleRichText'],
}
const richTextFields = ['descriptionRichText', 'subtitleRichText', 'titleRichText']

function cleanupPaths(document) {
  return (document.sections ?? []).flatMap((section) => {
    const allowed = allowedFields[section._type]
    if (!allowed || typeof section._key !== 'string') return []

    return richTextFields
      .filter((field) => !allowed.includes(field) && section[field] === null)
      .map((field) => `sections[_key==${JSON.stringify(section._key)}].${field}`)
  })
}

async function run() {
  const client = getCliClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2026-03-06',
    token: process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_API_TOKEN ??
      process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_STUDIO_TOKEN,
  }).withConfig({ perspective: 'raw' })

  // Include drafts so the warning is removed from both published and edited content.
  const query = '*[_type == "homePage"]{_id, _rev, sections}'
  const documents = await client.fetch(query)
  const updates = documents
    .map((document) => ({ document, paths: cleanupPaths(document) }))
    .filter(({ paths }) => paths.length > 0)

  for (const { document, paths } of updates) {
    console.log(JSON.stringify({ document: document._id, unset: paths }))
  }

  if (!process.argv.includes('--apply')) {
    console.log(`Dry run: ${updates.length} document(s) to clean. Use --apply to remove the listed null fields.`)
    return
  }

  if (updates.length > 0) {
    let transaction = client.transaction()
    for (const { document, paths } of updates) {
      transaction = transaction.patch(document._id, (patch) =>
        patch.ifRevisionId(document._rev).unset(paths),
      )
    }
    await transaction.commit()
  }

  const remaining = (await client.fetch(query)).flatMap(cleanupPaths)
  if (remaining.length > 0) throw new Error('Unused null fields remain; rerun the cleanup.')
  console.log(`Cleaned ${updates.length} document(s). Verified no unused null rich-text fields remain.`)
}

run().catch((error) => {
  // Avoid logging request objects, which may include authorization headers.
  console.error(error.message)
  process.exitCode = 1
})
