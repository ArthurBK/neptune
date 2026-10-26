import { BasketIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

const defaultDescription =
  'Discover our curated shopping edit, featuring a variety of products, including books, objects of all kinds, furniture, and fashion gems that our editors adore and have on their wish lists (and soon, you will too!).'

const defaultAffiliateDisclosure =
  'Our editors independently curate all products featured on Neptune.\nWe may receive compensation from retailers and/or from purchases of products through these links.'

export const marketPage = defineType({
  name: 'marketPage',
  title: 'Market Page',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'isVisible',
      title: 'Show Shop page',
      type: 'boolean',
      initialValue: true,
      description:
        'Turn off to hide Shop from the site navigation and disable access to the Market page. Publish to apply changes. Existing pages remain visible until explicitly turned off.',
    }),
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      initialValue: 'Neptune Market',
      description: 'Shown at the top of /the-market.',
    }),
    defineField({
      name: 'description',
      title: 'Intro text',
      type: 'text',
      rows: 4,
      initialValue: defaultDescription,
      description: 'Shown below the page title on /the-market.',
    }),
    defineField({
      name: 'affiliateDisclosure',
      title: 'Affiliate disclosure',
      type: 'text',
      rows: 3,
      initialValue: defaultAffiliateDisclosure,
      description: 'Shown below the intro text on /the-market.',
    }),
    defineField({
      name: 'products',
      title: 'Products (drag to reorder)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'affiliateProduct' }],
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: title || 'Market Page' }),
  },
})
