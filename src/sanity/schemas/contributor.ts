import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const contributor = defineType({
  name: 'contributor',
  title: 'Contributor',
  type: 'document',
  icon: UserIcon,
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
      name: 'role',
      title: 'Role',
      type: 'string',
      description: 'e.g. "Photographer", "Writer", "Contributing Editor"',
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
    select: { title: 'name', subtitle: 'role', media: 'portrait' },
  },
})
