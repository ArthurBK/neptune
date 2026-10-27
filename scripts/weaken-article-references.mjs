import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createClient } from '@sanity/client'
import { articleReferenceUpdates } from '../src/sanity/lib/articleReferences.mjs'

async function run() {
  const token = process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_API_TOKEN ?? process.env.SANITY_AUTH_TOKEN
  if (!token) throw new Error('A server-side Sanity write token is required.')
  const client = createClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2026-03-06',
    token,
    perspective: 'raw',
    useCdn: false,
  })
  const ids = await client.fetch('*[_type == "article"]._id')
  const articleIds = new Set(ids.flatMap((id) => {
    const publishedId = id.startsWith('drafts.') ? id.slice(7)
      : id.startsWith('versions.') ? id.split('.').slice(2).join('.') : id
    return [id, publishedId]
  }))
  const query = '*[references($ids)]'
  const params = { ids: [...articleIds] }
  const documents = await client.fetch(query, params)
  const updates = documents.map((document) => ({
    document,
    ...articleReferenceUpdates(document, articleIds),
  })).filter(({ referenceCount }) => referenceCount > 0)
  const referenceCount = updates.reduce((count, update) => count + update.referenceCount, 0)
  for (const update of updates) {
    console.log(JSON.stringify({ id: update.document._id, type: update.document._type, references: update.referenceCount }))
  }
  if (!process.argv.includes('--apply')) {
    console.log(`Dry run: ${referenceCount} article references in ${updates.length} documents. Use --apply to update.`)
    return
  }

  if (updates.length) {
    const backup = join(tmpdir(), `neptune-article-references-${Date.now()}.json`)
    await writeFile(backup, JSON.stringify(updates.map(({ document }) => document), null, 2), { mode: 0o600, flag: 'wx' })
    console.log(`Backup: ${backup}`)
    let transaction = client.transaction()
    for (const { document, set } of updates) {
      transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(set))
    }
    await transaction.commit({ visibility: 'sync' })
  }
  const saved = await client.fetch(query, params)
  if (saved.some((document) => articleReferenceUpdates(document, articleIds).referenceCount > 0)) {
    throw new Error('Some article references still block unpublishing. Review and rerun.')
  }
  console.log(`Updated and verified ${referenceCount} article references. No articles were unpublished or deleted.`)
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
