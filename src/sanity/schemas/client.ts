import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

import { GalleryUploadInput } from '../components/GalleryUploadInput'

const CLIENT_CATEGORIES = [
  { title: 'Interiors', value: 'interiors' },
  { title: 'Gardens', value: 'gardens' },
  { title: 'Fashion', value: 'fashion' },
  { title: 'Arts', value: 'arts' },
]

export const client = defineType({
  name: 'client',
  title: 'Client',
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
      options: { list: CLIENT_CATEGORIES },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      description: 'e.g. "Interior Design Legend"',
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. Art Direction, Communication, Copywriting, Photography',
      options: {
        layout: 'tags',
      },
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
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      description: 'Additional images. Drop multiple images or click to select.',
      options: { layout: 'grid' },
      components: { input: GalleryUploadInput },
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
              description: 'Optional — add later for accessibility',
            }),
            defineField({
              name: 'caption',
              title: 'Caption',
              type: 'string',
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Used for client cards',
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
        defineArrayMember({ type: 'adBannerEmbedBlock' }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'relatedClients',
      title: 'Related Clients',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'client' }] })],
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
