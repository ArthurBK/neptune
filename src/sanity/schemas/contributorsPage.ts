import { DocumentTextIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { plainTextToPortableText } from '../lib/portableText'
import { pageIntroRichTextType } from './lib/pageIntroRichText'

const DEFAULT_CONTRIBUTORS_DESCRIPTION =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

export const contributorsPage = defineType({
  name: 'contributorsPage',
  title: 'Contributors Page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'description',
      title: 'Contributors - description rich text',
      ...pageIntroRichTextType,
      description:
        'Optional rich text block shown at the top of /contributors, above the contributors list.',
      initialValue: plainTextToPortableText(
        DEFAULT_CONTRIBUTORS_DESCRIPTION,
        'contributorsDescription',
      ),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Contributors Page' }),
  },
})
