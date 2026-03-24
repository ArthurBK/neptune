'use client'

import type { SanityClient } from '@sanity/client'
import { useEffect, useRef } from 'react'
import { useClient, type ArrayOfObjectsInputProps } from 'sanity'
import { apiVersion } from '../env'

type RefItem = { _ref?: string }

function extractRefs(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((item) =>
      item && typeof item === 'object' && '_ref' in item ? (item as RefItem)._ref : undefined
    )
    .filter((ref): ref is string => typeof ref === 'string' && ref.length > 0)
}

function expandRefIds(ref: string): string[] {
  if (ref.startsWith('drafts.')) {
    const base = ref.slice('drafts.'.length)
    return [ref, base]
  }
  return [ref, `drafts.${ref}`]
}

async function ensureArticleHasCategory(client: SanityClient, ref: string, category: string): Promise<void> {
  const ids = [...new Set(expandRefIds(ref))]
  const rows = await client.fetch<Array<{ _id: string; categories?: string[] | null }>>(
    `*[_type == "article" && _id in $ids]{ _id, categories }`,
    { ids }
  )
  if (rows.length === 0) return

  const target = rows.find((r) => r._id.startsWith('drafts.')) ?? rows[0]
  const existing = Array.isArray(target.categories) ? [...target.categories] : []
  if (existing.includes(category)) return

  await client.patch(target._id).set({ categories: [...existing, category] }).commit()
}

export function CategoryArticleOrderInput(props: ArrayOfObjectsInputProps) {
  const client = useClient({ apiVersion })
  const categoryTag = (props.schemaType.options as { categoryTag?: string } | undefined)?.categoryTag
  const initialized = useRef(false)
  const prevRefs = useRef<string[]>([])

  useEffect(() => {
    if (!categoryTag) return

    const refs = extractRefs(props.value)
    if (!initialized.current) {
      initialized.current = true
      prevRefs.current = refs
      return
    }

    const prev = prevRefs.current
    prevRefs.current = refs
    const added = refs.filter((id) => !prev.includes(id))
    if (added.length === 0) return

    let cancelled = false
    void (async () => {
      for (const ref of added) {
        if (cancelled) return
        try {
          await ensureArticleHasCategory(client, ref, categoryTag)
        } catch (err) {
          console.error('[categoryPage] could not tag article with category', categoryTag, ref, err)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [props.value, client, categoryTag])

  return props.renderDefault(props)
}
