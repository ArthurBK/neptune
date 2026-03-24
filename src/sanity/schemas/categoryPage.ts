import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { captionRichTextType } from './lib/captionRichText'

type ArticleRefItem = {
  _ref?: string
}

type FieldValidation = NonNullable<Parameters<typeof defineField>[0]['validation']>

function categoryArticlesValidation(expectedCategory: string) {
  return ((rule: {
    unique: () => {
      custom: (
        validator: (
          items: unknown,
          context: { getClient: (args: { apiVersion: string }) => { fetch: <T>(query: string, params?: unknown) => Promise<T> } }
        ) => Promise<true | string> | true | string
      ) => unknown
    }
  }) =>
    rule.unique().custom(async (items, context) => {
      if (!Array.isArray(items) || items.length === 0) return true

      const refs = (items as ArticleRefItem[])
        .map((item) => item?._ref)
        .filter((ref): ref is string => typeof ref === 'string' && ref.length > 0)

      if (refs.length === 0) return true

      const client = context.getClient({ apiVersion: '2026-03-06' })
      const rows = await client.fetch<Array<{ _id: string; category?: string | null; categories?: string[] | null }>>(
        `*[_type == "article" && _id in $ids]{ _id, category, categories }`,
        { ids: refs }
      )

      const wrong = rows.filter((row) => {
        const inPrimary = row.category === expectedCategory
        const inAdditional = Array.isArray(row.categories) && row.categories.includes(expectedCategory)
        return !inPrimary && !inAdditional
      })
      if (wrong.length === 0) return true

      const ids = wrong.map((row) => row._id).join(', ')
      return `Contains article(s) not in "${expectedCategory}": ${ids}`
    })) as FieldValidation
}

export const categoryPage = defineType({
  name: 'categoryPage',
  title: 'Category Pages',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'interiorsArticles',
      title: 'Interiors — articles (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: categoryArticlesValidation('interiors'),
      description: 'Only interiors articles should be added here.',
    }),
    defineField({
      name: 'artsArticles',
      title: 'Arts — articles (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: categoryArticlesValidation('arts'),
      description: 'Only arts articles should be added here.',
    }),
    defineField({
      name: 'gardensArticles',
      title: 'Gardens — articles (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: categoryArticlesValidation('gardens'),
      description: 'Only gardens articles should be added here.',
    }),
    defineField({
      name: 'fashionArticles',
      title: 'Fashion — articles (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: categoryArticlesValidation('fashion'),
      description: 'Only fashion articles should be added here.',
    }),
    defineField({
      name: 'travelArticles',
      title: 'Travel — articles (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: categoryArticlesValidation('travel'),
      description: 'Only travel articles should be added here.',
    }),
    defineField({
      name: 'interiorsImage',
      title: 'Interiors — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the newsstand CTA on the Interiors page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        defineField({ name: 'caption', title: 'Caption', ...captionRichTextType }),
      ],
    }),
    defineField({
      name: 'artsImage',
      title: 'Arts — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the newsstand CTA on the Arts page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        defineField({ name: 'caption', title: 'Caption', ...captionRichTextType }),
      ],
    }),
    defineField({
      name: 'gardensImage',
      title: 'Gardens — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the newsstand CTA on the Gardens page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        defineField({ name: 'caption', title: 'Caption', ...captionRichTextType }),
      ],
    }),
    defineField({
      name: 'fashionImage',
      title: 'Fashion — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-screen image shown at the bottom of the Fashion page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        defineField({ name: 'caption', title: 'Caption', ...captionRichTextType }),
      ],
    }),
    defineField({
      name: 'travelImage',
      title: 'Travel — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Full-screen image shown at the bottom of the Travel page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        defineField({ name: 'caption', title: 'Caption', ...captionRichTextType }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Category Pages' }),
  },
})
