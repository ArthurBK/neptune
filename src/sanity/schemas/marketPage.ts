import { BasketIcon } from '@sanity/icons'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const marketPage = defineType({
  name: 'marketPage',
  title: 'Market Page',
  type: 'document',
  icon: BasketIcon,
  fields: [
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
})

