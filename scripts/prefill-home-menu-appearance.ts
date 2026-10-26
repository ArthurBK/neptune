import { getCliClient } from 'sanity/cli'
import { getHeaderVariant, type HeaderAppearance } from '../src/lib/headerAppearance'

type Section = {
  _key: string
  _type: string
  menuAppearance?: HeaderAppearance | null
  photos?: Array<{ image?: { asset?: { _ref?: string } }; linkUrl?: string; ctaLabel?: string }> | null
}
type HomeDocument = { _id: string; _rev: string; sections?: Section[] }

function updatesFor(document: HomeDocument) {
  const updates: Record<string, HeaderAppearance> = {}
  for (const [index, section] of (document.sections ?? []).entries()) {
    const photos = section._type === 'homeNewsstandBlock' && section.photos?.some((photo) => {
      const href = photo.linkUrl?.trim()
      return photo.image?.asset?._ref && photo.ctaLabel?.trim() && href
        && (/^\/(?![\/\\])/.test(href) || /^https?:\/\//i.test(href))
    })
    const variant = getHeaderVariant(section.menuAppearance, photos ? 'newsstandPhotos' : section._type, index)
    const current = section.menuAppearance
    // Preserve explicit choices, including an editor's choice of Automatic.
    const next: HeaderAppearance = {
      ...current,
      textColor: current?.textColor ?? (variant === 'dark' || variant === 'white-on-white' ? 'white' : 'black'),
      background: current?.background ?? (variant === 'dark' || variant === 'transparent-light' ? 'transparent' : 'white'),
    }
    if (next.textColor !== current?.textColor || next.background !== current?.background) {
      updates[`sections[_key==${JSON.stringify(section._key)}].menuAppearance`] = next
    }
  }
  return updates
}

async function run() {
  const client = getCliClient({
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2026-03-06',
    token: process.env.SANITY_AUTH_TOKEN ?? process.env.SANITY_API_TOKEN
      ?? process.env.SANITY_WRITE_TOKEN ?? process.env.SANITY_STUDIO_TOKEN,
  }).withConfig({ perspective: 'raw', useCdn: false })
  const query = '*[_id in ["homePage", "drafts.homePage"]]{_id, _rev, sections}'
  const documents = await client.fetch<HomeDocument[]>(query)
  let transaction = client.transaction()
  let count = 0
  for (const document of documents) {
    const updates = updatesFor(document)
    if (!Object.keys(updates).length) continue
    console.log(JSON.stringify({ document: document._id, set: updates }, null, 2))
    transaction = transaction.patch(document._id, (patch) => patch.ifRevisionId(document._rev).set(updates))
    count += Object.keys(updates).length
  }
  if (!process.argv.includes('--apply')) {
    console.log(`Dry run: ${count} section(s) to prefill. Use --apply to save.`)
    return
  }
  if (count) await transaction.commit()
  const saved = await client.fetch<HomeDocument[]>(query)
  if (saved.some((document) => Object.keys(updatesFor(document)).length)) {
    throw new Error('Some sections still need prefilling; review and rerun.')
  }
  console.log(`Prefilled and verified ${count} section(s).`)
}

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
