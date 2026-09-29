import { CogIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { InlineTextStylePortableTextInput } from '../components/InlineTextStylePortableTextInput'
import { plainTextToPortableText } from '../lib/portableText'
import { captionRichTextType } from './lib/captionRichText'
import { pageIntroRichTextType } from './lib/pageIntroRichText'
import { textStyleAnnotation } from './lib/textStyleAnnotation'

const DEFAULT_NEWSLETTER_DESCRIPTION =
  'Sign up to the Neptune newsletters for an exclusive access to great interiors and great conversations.'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'social', title: 'Social' },
    { name: 'newsletter', title: 'Newsletter' },
    { name: 'content', title: 'Content' },
    { name: 'contact', title: 'Contact' },
  ],
  fields: [
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
      group: 'social',
    }),
    defineField({
      name: 'advertisingEmail',
      title: 'Advertising Email',
      type: 'string',
      description: 'Opens mailto',
      group: 'contact',
    }),
    defineField({
      name: 'newsletterHeadline',
      title: 'Newsletter Headline',
      type: 'string',
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterSubtitle',
      title: 'Newsletter Subtitle',
      type: 'string',
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterDescriptionRichText',
      title: 'Newsletter Page Description',
      ...pageIntroRichTextType,
      description:
        'Rich text description shown at the top of /newsletters, above the subscribe button.',
      initialValue: plainTextToPortableText(
        DEFAULT_NEWSLETTER_DESCRIPTION,
        'newsletterDescription',
      ),
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterImage',
      title: 'Newsletter Background Image',
      type: 'image',
      options: { hotspot: true },
      group: 'newsletter',
    }),
    defineField({
      name: 'newsletterImageLegend',
      title: 'Newsletter Image Legend',
      ...captionRichTextType,
      description: 'Small italic caption shown below the image',
      group: 'newsletter',
    }),
    defineField({
      name: 'aboutText',
      title: 'About Text',
      type: 'array',
      components: { input: InlineTextStylePortableTextInput as never },
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            // Keep the default link annotation and all existing block styles
            // and decorators when adding typography controls.
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [defineField({ name: 'href', title: 'URL', type: 'url' })],
              },
              textStyleAnnotation,
            ],
          },
        }),
      ],
      group: 'content',
    }),
    defineField({
      name: 'aboutImageLeft',
      title: 'About Image (Left)',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          ...captionRichTextType,
        }),
      ],
    }),
    defineField({
      name: 'aboutImageRight',
      title: 'About Image (Right)',
      type: 'image',
      options: { hotspot: true },
      group: 'content',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          ...captionRichTextType,
        }),
      ],
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'contact',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Site Settings' }),
  },
})
