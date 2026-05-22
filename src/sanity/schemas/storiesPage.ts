import { DocumentTextIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { captionRichTextType } from './lib/captionRichText'
import { pageIntroRichTextType } from './lib/pageIntroRichText'

export const storiesPage = defineType({
  name: 'storiesPage',
  title: 'Stories Page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'articles',
      title: 'Stories - articles (drag to prioritize)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'article' }],
        }),
      ],
      validation: (rule) => rule.unique(),
      description:
        'Optional. Drag to prioritize stories on /stories. Articles not listed here are appended by publication date.',
    }),
    defineField({
      name: 'introText',
      title: 'Stories - intro text block',
      ...pageIntroRichTextType,
      description:
        'Optional rich text block shown at the top of /stories, above the article list.',
    }),
    defineField({
      name: 'description',
      title: 'Legacy Stories intro text',
      type: 'text',
      hidden: true,
      description: 'Deprecated fallback for older content. Use Stories - intro text block instead.',
    }),
    defineField({
      name: 'image',
      title: 'Stories - bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Optional full-screen image shown at the bottom of the Stories page.',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
        defineField({ name: 'caption', title: 'Caption', ...captionRichTextType }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Stories Page' }),
  },
})
