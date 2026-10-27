import type { SanityClient } from '@sanity/client'
import { articleReferenceUpdates } from './articleReferences.mjs'

/** Upgrade existing references before invoking Sanity's native unpublish/delete flow. */
export async function prepareArticleUnpublish(client: SanityClient, documentId: string) {
  const id = documentId.replace(/^drafts\./, '')
  const ids = [id, `drafts.${id}`]
  const documents = await client.fetch<Array<{ _id: string; _rev: string }>>(
    '*[references($ids)]',
    { ids },
    { perspective: 'raw' },
  )
  let transaction = client.transaction()
  let referenceCount = 0
  for (const document of documents) {
    const update = articleReferenceUpdates(document, new Set(ids))
    if (!update.referenceCount) continue
    referenceCount += update.referenceCount
    transaction = transaction.patch(document._id, (patch) =>
      patch.ifRevisionId(document._rev).set(update.set),
    )
  }
  if (referenceCount) await transaction.commit({ visibility: 'sync' })
  return referenceCount
}
