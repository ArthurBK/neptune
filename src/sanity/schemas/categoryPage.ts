import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

export const categoryPage = defineType({
  name: 'categoryPage',
  title: 'Category Pages',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'interiorsImage',
      title: 'Interiors — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the newsstand CTA on the Interiors page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
      ],
    }),
    defineField({
      name: 'artsImage',
      title: 'Arts — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the newsstand CTA on the Arts page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
      ],
    }),
    defineField({
      name: 'gardensImage',
      title: 'Gardens — bottom image',
      type: 'image',
      options: { hotspot: true },
      description: 'Image shown below the newsstand CTA on the Gardens page',
      fields: [
        { name: 'alt', title: 'Alt text', type: 'string' },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Category Pages' }),
  },
})
