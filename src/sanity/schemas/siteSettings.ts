import { CogIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'
import { captionRichTextType } from './lib/captionRichText'

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
      of: [{ type: 'block' }],
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
