import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { getCliClient } from 'sanity/cli'

type RichTextDoc = {
  _id: string
  bio?: string | null
  bioRichText?: SimplePortableTextBlock[] | null
}

type SiteSettingsDoc = {
  newsletterSubtitle?: string | null
  newsletterDescriptionRichText?: SimplePortableTextBlock[] | null
}

type StoriesPageDoc = {
  description?: string | null
  introText?: SimplePortableTextBlock[] | null
}

type ContributorsPageDoc = {
  description?: SimplePortableTextBlock[] | null
}

type HomePageSectionDoc = {
  _type?: string
  title?: string | null
  titleRichText?: SimplePortableTextBlock[] | null
  description?: string | null
  descriptionRichText?: SimplePortableTextBlock[] | null
  subtitle?: string | null
  subtitleRichText?: SimplePortableTextBlock[] | null
  [key: string]: unknown
}

type HomePageDoc = {
  sections?: HomePageSectionDoc[] | null
}

const DEFAULT_NEWSLETTER_DESCRIPTION =
  'Sign up to the Neptune newsletters for an exclusive access to great interiors and great conversations.'

const DEFAULT_CONTRIBUTORS_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

type SimplePortableTextBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: []
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks: []
  }>
}

function keySafe(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'text'
}

function plainTextToPortableText(value: string, keyPrefix = 'default'): SimplePortableTextBlock[] {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return paragraphs.map((text, index) => {
    const key = `${keySafe(keyPrefix)}${index}`

    return {
      _type: 'block',
      _key: key,
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `${key}Span`,
          text,
          marks: [],
        },
      ],
    }
  })
}

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
const token =
  process.env.SANITY_AUTH_TOKEN ??
  process.env.SANITY_API_TOKEN ??
  process.env.SANITY_WRITE_TOKEN ??
  process.env.SANITY_STUDIO_TOKEN

if (!projectId || !dataset) {
  throw new Error('Missing Sanity projectId or dataset environment variables.')
}

const client = getCliClient({
  projectId,
  dataset,
  apiVersion: '2026-03-06',
  token,
}).withConfig({ perspective: 'raw' })

function hasRichText(value: SimplePortableTextBlock[] | null | undefined) {
  return Array.isArray(value) && value.length > 0
}

async function migrateSiteSettings() {
  const settings = await client.fetch<SiteSettingsDoc | null>(
    `*[_id == "siteSettings"][0]{
      newsletterSubtitle,
      newsletterDescriptionRichText
    }`,
  )

  await client.createIfNotExists({ _id: 'siteSettings', _type: 'siteSettings' })

  if (hasRichText(settings?.newsletterDescriptionRichText)) return false

  const text = settings?.newsletterSubtitle?.trim() || DEFAULT_NEWSLETTER_DESCRIPTION

  await client
    .patch('siteSettings')
    .set({
      newsletterDescriptionRichText: plainTextToPortableText(text, 'newsletterDescription'),
    })
    .commit({ autoGenerateArrayKeys: true })

  return true
}

async function migrateContributorsPage() {
  const contributorsPage = await client.fetch<ContributorsPageDoc | null>(
    `*[_id == "contributorsPage"][0]{ description }`,
  )

  await client.createIfNotExists({ _id: 'contributorsPage', _type: 'contributorsPage' })

  if (hasRichText(contributorsPage?.description)) return false

  await client
    .patch('contributorsPage')
    .set({
      description: plainTextToPortableText(
        DEFAULT_CONTRIBUTORS_DESCRIPTION,
        'contributorsDescription',
      ),
    })
    .commit({ autoGenerateArrayKeys: true })

  return true
}

async function migrateStoriesPage() {
  const storiesPage = await client.fetch<StoriesPageDoc | null>(
    `*[_id == "storiesPage"][0]{ description, introText }`,
  )

  if (!storiesPage?.description?.trim() || hasRichText(storiesPage.introText)) return false

  await client
    .patch('storiesPage')
    .set({
      introText: plainTextToPortableText(storiesPage.description, 'storiesIntro'),
    })
    .commit({ autoGenerateArrayKeys: true })

  return true
}

async function migrateContributorBios() {
  const contributors = await client.fetch<RichTextDoc[]>(
    `*[_type == "contributor" && defined(bio)]{
      _id,
      bio,
      bioRichText
    }`,
  )

  let updated = 0

  for (const contributor of contributors) {
    const bio = contributor.bio?.trim()
    if (!bio || hasRichText(contributor.bioRichText)) continue

    await client
      .patch(contributor._id)
      .set({ bioRichText: plainTextToPortableText(bio, `contributorBio${updated}`) })
      .commit({ autoGenerateArrayKeys: true })
    updated += 1
  }

  return updated
}

async function migrateHomeRichTextBlocks() {
  const homePage = await client.fetch<HomePageDoc | null>(
    `*[_id == "homePage"][0]{
      sections[] {
        ...,
        titleRichText,
        descriptionRichText,
        subtitleRichText
      }
    }`,
  )

  if (!Array.isArray(homePage?.sections) || homePage.sections.length === 0) return 0

  let updated = 0
  const sections = homePage.sections.map((section, index) => {
    if (section._type === 'homeNewsstandBlock') {
      const next = { ...section }
      const title = section.title?.trim()
      const description = section.description?.trim()

      if (title && !hasRichText(section.titleRichText)) {
        next.titleRichText = plainTextToPortableText(title, `homeNewsstandTitle${index}`)
        updated += 1
      }

      if (description && !hasRichText(section.descriptionRichText)) {
        next.descriptionRichText = plainTextToPortableText(
          description,
          `homeNewsstandDescription${index}`,
        )
        updated += 1
      }

      return next
    }

    if (section._type === 'homeNewsletterBlock') {
      const next = { ...section }
      const subtitle = section.subtitle?.trim()

      if (subtitle && !hasRichText(section.subtitleRichText)) {
        next.subtitleRichText = plainTextToPortableText(subtitle, `homeNewsletterSubtitle${index}`)
        updated += 1
      }

      return next
    }

    return section
  })

  if (updated === 0) return 0

  await client.patch('homePage').set({ sections }).commit({ autoGenerateArrayKeys: true })

  return updated
}

async function run() {
  const [
    siteSettingsUpdated,
    contributorsPageUpdated,
    storiesPageUpdated,
    contributorBiosUpdated,
    homeRichTextFieldsUpdated,
  ] = await Promise.all([
    migrateSiteSettings(),
    migrateContributorsPage(),
    migrateStoriesPage(),
    migrateContributorBios(),
    migrateHomeRichTextBlocks(),
  ])

  console.log(
    [
      `siteSettings newsletter description: ${siteSettingsUpdated ? 'updated' : 'unchanged'}`,
      `contributorsPage description: ${contributorsPageUpdated ? 'updated' : 'unchanged'}`,
      `storiesPage intro text: ${storiesPageUpdated ? 'updated' : 'unchanged'}`,
      `contributor bios: ${contributorBiosUpdated} updated`,
      `home rich text fields: ${homeRichTextFieldsUpdated} updated`,
    ].join('\n'),
  )
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Migration failed: ${message}`)
  process.exit(1)
})
