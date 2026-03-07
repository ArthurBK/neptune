import { ImageIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const photographer = defineType({
  name: 'photographer',
  title: 'Photographer',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'string',
      description: 'e.g. "New York", "Paris"',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'location', media: 'portrait' },
  },
})
