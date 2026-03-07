import { ImageIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

const PLACEMENTS = [
  { title: 'Article Top', value: 'article-top' },
  { title: 'Article Mid', value: 'article-mid' },
  { title: 'Article Bottom', value: 'article-bottom' },
  { title: 'Category Top', value: 'category-top' },
]

export const adBanner = defineType({
  name: 'adBanner',
  title: 'Ad Banner',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Internal name only',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'linkUrl',
      title: 'Link URL',
      type: 'url',
    }),
    defineField({
      name: 'placement',
      title: 'Placement',
      type: 'string',
      options: { list: PLACEMENTS },
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'startDate',
      title: 'Start Date',
      type: 'datetime',
    }),
    defineField({
      name: 'endDate',
      title: 'End Date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'image' },
  },
})
