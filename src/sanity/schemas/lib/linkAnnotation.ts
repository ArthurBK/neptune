import { defineField } from 'sanity'
import { LinkIcon } from '@sanity/icons'
import { LinkAnnotation } from '../../components/LinkAnnotation'

export const linkAnnotation = defineField({
  name: 'link',
  title: 'Link',
  type: 'object',
  icon: LinkIcon,
  components: { annotation: LinkAnnotation },
  fields: [
    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description: 'Website address, internal path (e.g. /newsstand), email (mailto:), or phone number (tel:). Leave empty to remove the link when closing.',
      validation: (rule) => rule
        .uri({ allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel'] })
        .error('Enter a valid link URL, or remove the link.'),
    }),
    defineField({
      name: 'blank',
      title: 'Open in a new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
