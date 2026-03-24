import type { ArrayOptions } from '@sanity/types'
import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { CategoryArticleOrderInput } from '../components/CategoryArticleOrderInput'
import { captionRichTextType } from './lib/captionRichText'

type CategoryArticleListOptions = ArrayOptions & { categoryTag: string }

function categoryListOptions(tag: string): CategoryArticleListOptions {
  return { categoryTag: tag }
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
      options: categoryListOptions('interiors'),
      components: { input: CategoryArticleOrderInput },
      validation: (rule) => rule.unique(),
      description: 'Adding an article here adds the Interiors category on that article. Drag to reorder.',
    }),
    defineField({
      name: 'interiorsDescription',
      title: 'Interiors — description',
      type: 'text',
      rows: 3,
      description: 'Description text shown under the Interiors page title.',
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
      options: categoryListOptions('arts'),
      components: { input: CategoryArticleOrderInput },
      validation: (rule) => rule.unique(),
      description: 'Adding an article here adds the Arts category on that article. Drag to reorder.',
    }),
    defineField({
      name: 'artsDescription',
      title: 'Arts — description',
      type: 'text',
      rows: 3,
      description: 'Description text shown under the Arts page title.',
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
      options: categoryListOptions('gardens'),
      components: { input: CategoryArticleOrderInput },
      validation: (rule) => rule.unique(),
      description: 'Adding an article here adds the Gardens category on that article. Drag to reorder.',
    }),
    defineField({
      name: 'gardensDescription',
      title: 'Gardens — description',
      type: 'text',
      rows: 3,
      description: 'Description text shown under the Gardens page title.',
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
      options: categoryListOptions('fashion'),
      components: { input: CategoryArticleOrderInput },
      validation: (rule) => rule.unique(),
      description: 'Adding an article here adds the Fashion category on that article. Drag to reorder.',
    }),
    defineField({
      name: 'fashionDescription',
      title: 'Fashion — description',
      type: 'text',
      rows: 3,
      description: 'Description text shown under the Fashion page title.',
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
      options: categoryListOptions('travel'),
      components: { input: CategoryArticleOrderInput },
      validation: (rule) => rule.unique(),
      description: 'Adding an article here adds the Travel category on that article. Drag to reorder.',
    }),
    defineField({
      name: 'travelDescription',
      title: 'Travel — description',
      type: 'text',
      rows: 3,
      description: 'Description text shown under the Travel page title.',
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
