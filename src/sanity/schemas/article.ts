import { DocumentTextIcon, ImageIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { captionRichTextType } from './lib/captionRichText'

function captionToPlainText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (!Array.isArray(value)) return ''

  return value
    .map((block) => {
      if (!block || typeof block !== 'object') return ''
      const children = (block as { children?: unknown }).children
      if (!Array.isArray(children)) return ''
      return children
        .map((child) => {
          if (!child || typeof child !== 'object') return ''
          const text = (child as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        })
        .join('')
    })
    .join(' ')
    .trim()
}

// Portable Text block: image with caption and alt
const pteImageBlock = defineType({
  name: 'pteImageBlock',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      ...captionRichTextType,
    }),
    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full width', value: 'full' },
          { title: 'Wide (bleed)', value: 'wide' },
          { title: 'Center', value: 'center' },
          { title: 'Float left', value: 'left' },
          { title: 'Float right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
    }),
  ],
  preview: {
    select: { caption: 'caption', media: 'image' },
    prepare: ({ caption, media }) => {
      const title = captionToPlainText(caption)
      return { title: title || 'Caption', media }
    },
  },
})

// Portable Text block: image grid (n images)
const pteImageGridBlock = defineType({
  name: 'pteImageGridBlock',
  title: 'Image Grid',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Images displayed in a grid (3 columns)',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              ...captionRichTextType,
            }),
            defineField({
              name: 'captionSpansGrid',
              title: 'Caption spans full grid',
              type: 'boolean',
              initialValue: false,
              description:
                'When enabled, this image’s caption is rendered once below the whole grid (spanning the full width).',
              validation: (rule) =>
                rule.custom((value, context) => {
                  if (!value) return true
                  const caption = (context.parent as { caption?: unknown } | undefined)?.caption
                  if (!Array.isArray(caption) || caption.length === 0) {
                    return 'Caption is required when “Caption spans full grid” is enabled.'
                  }
                  return true
                }),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { media: 'images.0', images: 'images' },
    prepare: ({ media, images }) => ({
      title: `Image Grid (${Array.isArray(images) ? images.length : 0})`,
      media,
    }),
  },
})

// Portable Text block: ad banner embed
const adBannerEmbedBlock = defineType({
  name: 'adBannerEmbedBlock',
  title: 'Ad Banner',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'adBanner',
      title: 'Ad Banner',
      type: 'reference',
      to: [{ type: 'adBanner' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'adBanner.title' },
    prepare: ({ title }) => ({ title: title || 'Ad Banner' }),
  },
})

const ARTICLE_CATEGORIES = [
  { title: 'Interiors', value: 'interiors' },
  { title: 'Gardens', value: 'gardens' },
  { title: 'Arts', value: 'arts' },
  { title: 'Fashion', value: 'fashion' },
]

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'text',
      rows: 4,
      description: 'Press Enter for a line break (shown on the article page only).',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc) =>
          typeof doc?.title === 'string'
            ? doc.title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
            : '',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: ARTICLE_CATEGORIES },
      validation: (rule) => rule.required().min(1),
      description: 'Select one or more categories this article belongs to.',
    }),
    defineField({
      name: 'category',
      title: 'Legacy Category',
      type: 'string',
      options: { list: ARTICLE_CATEGORIES },
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      description: 'e.g. "Interior Design Legend"',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          ...captionRichTextType,
          description: 'Optional caption shown under the cover image on the article page.',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'contributor' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'photographer',
      title: 'Photographer',
      type: 'reference',
      to: [{ type: 'photographer' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Blockquote', value: 'blockquote' },
            { title: 'Pull Quote', value: 'pullQuote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'affiliateProductEmbed',
                type: 'object',
                title: 'Affiliate Product',
                fields: [
                  defineField({
                    name: 'product',
                    title: 'Product',
                    type: 'reference',
                    to: [{ type: 'affiliateProduct' }],
                    validation: (rule) => rule.required(),
                  }),
                ],
              },
            ],
          },
        },
        defineArrayMember({ type: 'pteImageBlock' }),
        defineArrayMember({ type: 'pteImageGridBlock' }),
        defineArrayMember({ type: 'adBannerEmbedBlock' }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'affiliateProducts',
      title: 'Affiliate Products',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'affiliateProduct' }] })],
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'article' }] })],
      validation: (rule) => rule.max(3),
    }),
    defineField({
      name: 'linkedIssue',
      title: 'Linked Issue',
      type: 'string',
      description: 'Shopify product handle for Newsstand link',
    }),
  ],
  preview: {
    select: { title: 'title', categories: 'categories', legacyCategory: 'category', media: 'coverImage' },
    prepare: ({ title, categories, legacyCategory, media }) => {
      const categoryList = Array.isArray(categories)
        ? categories.filter((value): value is string => typeof value === 'string' && value.length > 0)
        : []
      const subtitle = categoryList.length > 0 ? categoryList.join(', ') : (legacyCategory ?? '')
      return { title, subtitle, media }
    },
  },
})

export { pteImageBlock, pteImageGridBlock, adBannerEmbedBlock }

