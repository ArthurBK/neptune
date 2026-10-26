import { defineField } from 'sanity'

export const menuAppearanceField = defineField({
  name: 'menuAppearance',
  title: 'Menu appearance',
  type: 'object',
  description: 'Appearance of the top navigation while this section is on screen, on mobile and desktop.',
  fields: [
    defineField({
      name: 'textColor',
      title: 'Text, logo and icon colour',
      type: 'string',
      initialValue: 'auto',
      options: {
        layout: 'radio',
        list: [
          { title: 'Automatic (default)', value: 'auto' },
          { title: 'Black', value: 'black' },
          { title: 'White', value: 'white' },
        ],
      },
    }),
    defineField({
      name: 'background',
      title: 'Background',
      type: 'string',
      initialValue: 'auto',
      options: {
        layout: 'radio',
        list: [
          { title: 'Automatic (default)', value: 'auto' },
          { title: 'White', value: 'white' },
          { title: 'Transparent', value: 'transparent' },
        ],
      },
    }),
  ],
})
