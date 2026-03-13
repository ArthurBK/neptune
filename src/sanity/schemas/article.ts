import { DocumentTextIcon, ImageIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

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
      type: 'string',
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
          { title: 'Float left', value: 'left' },
          { title: 'Float right', value: 'right' },
        ],
        layout: 'radio',
      },
      initialValue: 'full',
    }),
  ],
  preview: {
    select: { title: 'caption', media: 'image' },
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
              type: 'string',
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
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: ARTICLE_CATEGORIES },
      validation: (rule) => rule.required(),
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
    select: { title: 'title', subtitle: 'category', media: 'coverImage' },
  },
})

export { pteImageBlock, pteImageGridBlock, adBannerEmbedBlock }

