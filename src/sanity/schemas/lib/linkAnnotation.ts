import { defineField } from 'sanity'
import { LinkIcon } from '@sanity/icons'

export const linkAnnotation = defineField({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'Website address, internal path (e.g. /newsstand), email (mailto:), or phone number (tel:).',
      validation: (rule) => rule.required().uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
    defineField({
      name: 'blank',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
