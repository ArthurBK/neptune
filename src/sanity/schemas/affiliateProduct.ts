import { BasketIcon } from '@sanity/icons'
import { defineField, defineType } from 'sanity'

const CATEGORIES = [
  { title: 'Objects', value: 'objects' },
  { title: 'Furniture', value: 'furniture' },
  { title: 'Books', value: 'books' },
  { title: 'Clothing', value: 'clothing' },
  { title: 'Fashion', value: 'fashion' },
  { title: 'Scents', value: 'scents' },
]

export const affiliateProduct = defineType({
  name: 'affiliateProduct',
  title: 'Affiliate Product',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'Store as string e.g. "€245"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'affiliateUrl',
      title: 'Affiliate URL',
      type: 'url',
      description: 'External link',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: { list: CATEGORIES },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      description: 'For homepage Market highlights',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'brand', media: 'image' },
  },
})
