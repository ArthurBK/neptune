import type { SanityClient } from '@sanity/client'

type CreditDocument = {
  _id: string
  _rev: string
  _type: string
  name?: string
  author?: { _ref?: string }
  photographer?: { _ref?: string }
}

/** Preserve published and draft article credits atomically before deleting a person. */
export async function deleteContributor(client: SanityClient, documentId: string) {
  const id = documentId.replace(/^drafts\./, '')
  const ids = [id, `drafts.${id}`]
  const documents = await client.fetch<CreditDocument[]>(
    `*[_id in $ids || (_type == "article" && (author._ref in $ids || photographer._ref in $ids))] {
      _id, _rev, _type, name, author, photographer
    }`,
    { ids },
    { perspective: 'raw' },
  )
  const people = documents.filter((document) => ids.includes(document._id))
  if (!people.length) throw new Error('This contributor no longer exists. Refresh the Studio.')
  if (people.some((person) => !['contributor', 'photographer'].includes(person._type))) {
    throw new Error('Only contributor profiles can be deleted with this action.')
  }

  const publishedName = people.find((person) => person._id === id)?.name
  let transaction = client.transaction()
  let articleCount = 0

  for (const article of documents.filter((document) => document._type === 'article')) {
    const set: Record<string, string> = {}
    const unset: string[] = []
    for (const field of ['author', 'photographer'] as const) {
      const ref = article[field]?._ref
      if (!ref || !ids.includes(ref)) continue
      const name = people.find((person) => person._id === ref)?.name ?? publishedName ?? people[0].name
      if (!name?.trim()) throw new Error('Add a name to this contributor before deleting it so article credits can be preserved.')
      set[`${field}Name`] = name.trim()
      unset.push(field)
    }
    if (!unset.length) continue
    transaction = transaction.patch(article._id, (patch) =>
      patch.ifRevisionId(article._rev).set(set).unset(unset),
    )
    articleCount++
  }

  for (const person of people) {
    // Abort if the name changed while the article credits were being prepared.
    transaction = transaction.patch(person._id, (patch) =>
      patch.ifRevisionId(person._rev).setIfMissing({ name: person.name ?? '' }),
    ).delete(person._id)
  }

  // Strong references elsewhere or concurrent edits cause the entire transaction to fail.
  await transaction.commit({ visibility: 'sync' })
  return { articleCount }
}
