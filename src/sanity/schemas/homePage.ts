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

// Home section: newsstand product (Shopify handle)
const homeNewsstandBlock = defineType({
  name: 'homeNewsstandBlock',
  title: 'Newsstand Product',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'handle',
      title: 'Product handle',
      type: 'string',
      description: 'Shopify product handle from Newsstand (e.g. neptune-issue-01)',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { handle: 'handle' },
    prepare: ({ handle }) => ({ title: handle ? `Newsstand: ${handle}` : 'Newsstand Product' }),
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
        defineArrayMember({ type: 'homeArticleBlock' }),
        defineArrayMember({ type: 'homeImageBlock' }),
        defineArrayMember({ type: 'homeProductBlock' }),
        defineArrayMember({ type: 'homeNewsstandBlock' }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Home Page' }),
  },
})

export { homeArticleBlock, homeImageBlock, homeProductBlock, homeNewsstandBlock }
