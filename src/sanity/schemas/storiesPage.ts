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
      name: 'isVisible',
      title: 'Show Stories page',
      type: 'boolean',
      initialValue: true,
      description:
        'Turn off to hide Stories from the site navigation and disable access to the Stories listing page. Publish to apply changes. Existing pages remain visible until explicitly turned off.',
    }),
    defineField({
      name: 'articles',
      title: 'Stories - articles (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          weak: true,
          to: [{ type: 'article' }],
        }),
      ],
      validation: (rule) => rule.unique(),
      description:
        'Only the articles selected here appear on /stories and public contributor profiles. Drag to set their order on /stories. Leave empty to show no articles. Publish to apply changes.',
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
