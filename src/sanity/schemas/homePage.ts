import { DocumentTextIcon, ImageIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { pageIntroRichTextType } from './lib/pageIntroRichText'

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

// Home section: row of three article references
const homeThreeArticlesBlock = defineType({
  name: 'homeThreeArticlesBlock',
  title: '3 articles',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'titleRichText',
      title: 'Title',
      ...pageIntroRichTextType,
      description: 'Section title displayed as entered. Select text to change its font, size, color or formatting.',
    }),
    defineField({
      name: 'title',
      title: 'Legacy title',
      type: 'string',
      hidden: true,
      readOnly: true,
    }),
    defineField({
      name: 'heroArticle',
      title: 'Hero article',
      type: 'reference',
      description: 'Optional larger article shown above the row of three articles.',
      to: [{ type: 'article' }],
    }),
    defineField({
      name: 'articles',
      title: 'Articles',
      type: 'array',
      description: 'Select exactly 3 articles. They render on the same line on the home page.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: (rule) => rule.required().length(3).unique(),
    }),
  ],
  preview: {
    select: { title: 'title', titleRichText: 'titleRichText', heroTitle: 'heroArticle.title', articles: 'articles' },
    prepare: ({ title, titleRichText, heroTitle, articles }) => {
      const count = Array.isArray(articles) ? articles.length : 0
      const richTitle = Array.isArray(titleRichText)
        ? titleRichText.map((block) => block.children?.map((child: { text?: string }) => child.text ?? '').join('') ?? '').join(' ')
        : undefined
      return {
        title: (richTitle ?? title) || `3 articles${heroTitle ? ' + hero' : ''} (${count}/3)`,
        subtitle: heroTitle ? `Hero: ${heroTitle}` : undefined,
      }
    },
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
      name: 'layout',
      title: 'Layout',
      type: 'string',
      initialValue: 'single',
      options: {
        list: [
          { title: 'Single (full page)', value: 'single' },
          { title: 'Split (left + right)', value: 'split' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image (single layout)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.layout === 'split',
      validation: (rule) =>
        rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout ?? 'single'
          if (layout === 'single' && !value) return 'Image is required for single layout.'
          return true
        }),
    }),
    defineField({
      name: 'alt',
      title: 'Alt text (single layout)',
      type: 'string',
      hidden: ({ parent }) => parent?.layout === 'split',
      validation: (rule) =>
        rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout ?? 'single'
          if (layout === 'single' && !value) return 'Alt text is required for single layout.'
          return true
        }),
    }),
    defineField({
      name: 'title',
      title: 'Title overlay',
      type: 'string',
      description: 'Optional text overlay (e.g. headline)',
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL (single layout)',
      type: 'url',
      hidden: ({ parent }) => parent?.layout === 'split',
      description: 'Optional - where to go when clicked',
    }),
    defineField({
      name: 'leftImage',
      title: 'Left image (split layout)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.layout !== 'split',
      validation: (rule) =>
        rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout ?? 'single'
          if (layout === 'split' && !value) return 'Left image is required for split layout.'
          return true
        }),
    }),
    defineField({
      name: 'leftAlt',
      title: 'Left alt text (split layout)',
      type: 'string',
      hidden: ({ parent }) => parent?.layout !== 'split',
      validation: (rule) =>
        rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout ?? 'single'
          if (layout === 'split' && !value) return 'Left alt text is required for split layout.'
          return true
        }),
    }),
    defineField({
      name: 'leftLinkUrl',
      title: 'Left link URL (split layout)',
      type: 'url',
      hidden: ({ parent }) => parent?.layout !== 'split',
      description: 'Optional - where to go when clicking the left image.',
    }),
    defineField({
      name: 'rightImage',
      title: 'Right image (split layout)',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ parent }) => parent?.layout !== 'split',
      validation: (rule) =>
        rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout ?? 'single'
          if (layout === 'split' && !value) return 'Right image is required for split layout.'
          return true
        }),
    }),
    defineField({
      name: 'rightAlt',
      title: 'Right alt text (split layout)',
      type: 'string',
      hidden: ({ parent }) => parent?.layout !== 'split',
      validation: (rule) =>
        rule.custom((value, context) => {
          const layout = (context.parent as { layout?: string } | undefined)?.layout ?? 'single'
          if (layout === 'split' && !value) return 'Right alt text is required for split layout.'
          return true
        }),
    }),
    defineField({
      name: 'rightLinkUrl',
      title: 'Right link URL (split layout)',
      type: 'url',
      hidden: ({ parent }) => parent?.layout !== 'split',
      description: 'Optional - where to go when clicking the right image.',
    }),
  ],
  preview: {
    select: { title: 'title', layout: 'layout', media: 'image', splitMedia: 'leftImage' },
    prepare: ({ title, layout, media, splitMedia }) => ({
      title: title || (layout === 'split' ? 'Image (split)' : 'Image'),
      media: layout === 'split' ? splitMedia : media,
    }),
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

// Home section: fullscreen photos with individual destinations.
const homeNewsstandBlock = defineType({
  name: 'homeNewsstandBlock',
  title: 'Photo Carousel',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'photos',
      title: 'Photos',
      type: 'array',
      description: 'Full-screen photos that advance automatically every 5 seconds. Drag to reorder. Each photo has its own button and destination.',
      of: [
        defineArrayMember({
          name: 'newsstandPhoto',
          title: 'Photo',
          type: 'object',
          icon: ImageIcon,
          fields: [
            defineField({
              name: 'image',
              title: 'Photo',
              type: 'image',
              options: { hotspot: true },
              description: 'Use the hotspot to choose the area to keep visible on smaller screens.',
              validation: (rule) => rule.required().assetRequired(),
            }),
            defineField({
              name: 'alt',
              title: 'Image description',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'ctaLabel',
              title: 'Button label',
              type: 'string',
              initialValue: 'Discover',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'linkUrl',
              title: 'Button destination',
              type: 'url',
              description: 'A page on this site (e.g. /newsstand) or a complete https:// URL.',
              validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ['http', 'https'] }),
            }),
          ],
          preview: {
            select: { title: 'ctaLabel', subtitle: 'linkUrl', media: 'image' },
            prepare: ({ title, subtitle, media }) => ({ title: title || 'Photo', subtitle, media }),
          },
        }),
      ],
      validation: (rule) => rule.custom((value, context) => {
        const parent = context.parent as { productHandles?: unknown[] } | undefined
        return value?.length || parent?.productHandles?.length
          ? true
          : 'Add at least one photo.'
      }),
    }),
    defineField({
      name: 'productHandles',
      title: 'Previous products',
      type: 'array',
      description: 'Used until photos are added above.',
      readOnly: true,
      hidden: ({ parent, value }) => !value || Boolean(parent?.photos?.length),
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'handle',
              title: 'Product handle or URL',
              type: 'string',
              description: 'e.g. neptune-issue-01 or https://www.neptune-papers.com/products/neptune-issue-01',
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: { handle: 'handle' },
            prepare: ({ handle }) => ({ title: handle || 'Product' }),
          },
        },
      ],
    }),
    defineField({
      name: 'titleRichText',
      title: 'Headline',
      ...pageIntroRichTextType,
      readOnly: true,
      hidden: ({ parent, value }) => !value || Boolean(parent?.photos?.length),
      description: 'Optional rich text headline shown above the Newsstand carousel.',
    }),
    defineField({
      name: 'descriptionRichText',
      title: 'Description',
      ...pageIntroRichTextType,
      readOnly: true,
      hidden: ({ parent, value }) => !value || Boolean(parent?.photos?.length),
      description: 'Optional rich text description shown below the headline.',
    }),
    defineField({
      name: 'title',
      title: 'Legacy Headline',
      type: 'string',
      hidden: true,
      description: 'Optional — overrides product title (e.g. "NEPTUNE 10")',
    }),
    defineField({
      name: 'description',
      title: 'Legacy Description',
      type: 'text',
      hidden: true,
      description: 'Optional body text for the right column',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA label',
      type: 'string',
      readOnly: true,
      hidden: ({ parent, value }) => !value || Boolean(parent?.photos?.length),
      description: 'Optional — e.g. "DISCOVER OUR ANNIVERSARY ISSUE"',
    }),
  ],
  preview: {
    select: { photos: 'photos', productHandles: 'productHandles', media: 'photos.0.image' },
    prepare: ({ photos, productHandles, media }) => {
      if (Array.isArray(photos) && photos.length > 0) {
        return { title: `Photo Carousel (${photos.length} photos)`, media }
      }
      const count = Array.isArray(productHandles) ? productHandles.length : 0
      return { title: 'Photo Carousel', subtitle: `${count} previous products — add photos to replace them` }
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
      name: 'subtitleRichText',
      title: 'Subtitle / description',
      ...pageIntroRichTextType,
      description: 'Rich text shown below the headline on the left. Falls back to Site Settings → Newsletter if empty.',
    }),
    defineField({
      name: 'subtitle',
      title: 'Legacy Subtitle / description',
      type: 'text',
      hidden: true,
      description: 'Text below the headline on the left. Falls back to Site Settings → Newsletter if empty.',
    }),
    defineField({
      name: 'leftImage',
      title: 'Left image',
      type: 'image',
      options: { hotspot: true },
      description: 'Large image shown on the left side of the newsletter section.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Left alt text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'rightImage',
      title: 'Right image (below text)',
      type: 'image',
      options: { hotspot: true },
      description: 'Smaller image shown below the text on the right side.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Right alt text',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: { headline: 'headline', media: 'leftImage' },
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
        defineArrayMember({ type: 'homeThreeArticlesBlock' }),
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

export {
  homeArticleBlock,
  homeThreeArticlesBlock,
  homeImageBlock,
  homeProductBlock,
  homeNewsstandBlock,
  homeNewsletterBlock,
  homeVideoBlock,
}
