import { DocumentTextIcon, ImageIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

// Home section: article reference
const homeArticleBlock = defineType({
  name: 'homeArticleBlock',
  title: 'Article',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'article',
      title: 'Article',
      type: 'reference',
      to: [{ type: 'article' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'article.title', media: 'article.coverImage' },
    prepare: ({ title }) => ({ title: title || 'Article' }),
  },
})

// Home section: standalone image
const homeImageBlock = defineType({
  name: 'homeImageBlock',
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
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title overlay',
      type: 'string',
      description: 'Optional text overlay (e.g. headline)',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'url',
      description: 'Optional — where to go when clicked',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
    prepare: ({ title }) => ({ title: title || 'Image' }),
  },
})

// Home section: affiliate product reference
const homeProductBlock = defineType({
  name: 'homeProductBlock',
  title: 'Affiliate Product',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'product',
      title: 'Product',
      type: 'reference',
      to: [{ type: 'affiliateProduct' }],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'product.title', media: 'product.image' },
    prepare: ({ title }) => ({ title: title || 'Product' }),
  },
})

// Home section: fullscreen video (auto-play, muted)
const homeVideoBlock = defineType({
  name: 'homeVideoBlock',
  title: 'Video',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/mp4,video/webm,video/quicktime',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'video.asset.originalFilename' },
    prepare: ({ title }) => ({ title: title ? `Video: ${title}` : 'Video' }),
  },
})

// Home section: newsstand products (Shopify handles)
const homeNewsstandBlock = defineType({
  name: 'homeNewsstandBlock',
  title: 'Newsstand Hero',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'productHandles',
      title: 'Products',
      type: 'array',
      description: 'Exactly 6 Shopify product handles from Newsstand. Drag to reorder. First product is used for the CTA link.',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'handle',
              title: 'Product handle',
              type: 'string',
              description: 'e.g. neptune-issue-01',
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: { handle: 'handle' },
            prepare: ({ handle }) => ({ title: handle || 'Product' }),
          },
        },
      ],
      validation: (rule) => rule.required().length(6),
    }),
    defineField({
      name: 'title',
      title: 'Headline',
      type: 'string',
      description: 'Optional — overrides product title (e.g. "NEPTUNE 10")',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional body text for the right column',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      description: 'Optional — e.g. "DISCOVER OUR ANNIVERSARY ISSUE"',
    }),
  ],
  preview: {
    select: { productHandles: 'productHandles' },
    prepare: ({ productHandles }) => {
      const count = Array.isArray(productHandles) ? productHandles.length : 0
      return { title: `Newsstand Hero (${count} products)` }
    },
  },
})

// Home section: newsletter (image right, headline + text + subscribe left)
const homeNewsletterBlock = defineType({
  name: 'homeNewsletterBlock',
  title: 'Newsletter',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      description: 'Title on the left (e.g. "Newsletters"). Falls back to Site Settings → Newsletter if empty.',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle / description',
      type: 'text',
      description: 'Text below the headline on the left. Falls back to Site Settings → Newsletter if empty.',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image on the right. Falls back to Site Settings → Newsletter if empty.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { headline: 'headline', media: 'image' },
    prepare: ({ headline, media }) => ({
      title: headline ? `Newsletter: ${headline}` : 'Newsletter',
      media,
    }),
  },
})

export const homePage = defineType({
  name: 'homePage',
  title: 'Home Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      initialValue: 'Home Page',
      hidden: true,
    }),
    defineField({
      name: 'sections',
      title: 'Hero sections',
      type: 'array',
      description: 'Drag to reorder. Each section appears as a full-screen slide on the home page.',
      of: [
        defineArrayMember({ type: 'homeVideoBlock' }),
        defineArrayMember({ type: 'homeArticleBlock' }),
        defineArrayMember({ type: 'homeImageBlock' }),
        defineArrayMember({ type: 'homeProductBlock' }),
        defineArrayMember({ type: 'homeNewsstandBlock' }),
        defineArrayMember({ type: 'homeNewsletterBlock' }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
})

export { homeArticleBlock, homeImageBlock, homeProductBlock, homeNewsstandBlock, homeNewsletterBlock, homeVideoBlock }
