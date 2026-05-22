import { UserIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { pageIntroRichTextType } from './lib/pageIntroRichText'

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
      name: 'bioRichText',
      title: 'Bio',
      ...pageIntroRichTextType,
      validation: (rule) =>
        rule.custom((value, context) => {
          const legacyBio = (context.document as { bio?: unknown } | undefined)?.bio
          if (Array.isArray(value) && value.length > 0) return true
          if (typeof legacyBio === 'string' && legacyBio.trim().length > 0) return true
          return 'Bio is required'
        }),
    }),
    defineField({
      name: 'bio',
      title: 'Legacy Bio',
      type: 'text',
      hidden: true,
      description: 'Deprecated fallback for older contributor content. Use Bio instead.',
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
