import { defineField } from 'sanity'
import { HexColorInput } from '../../components/HexColorInput'

const PAGE_INTRO_FONT_FAMILIES = [
  { title: 'Serif', value: 'serif' },
  { title: 'Futura', value: 'futura' },
  { title: 'Header', value: 'header' },
  { title: 'Sans-serif', value: 'sans' },
]

const PAGE_INTRO_FONT_SIZE_OPTIONS = Array.from({ length: 45 }, (_, i) => {
  const px = i + 6
  return { title: `${px}px`, value: px }
})

export const pageIntroRichTextType = {
  type: 'array',
  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Blockquote', value: 'blockquote' },
        { title: 'Pull Quote', value: 'pullQuote' },
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Underline', value: 'underline' },
        ],
        annotations: [
          {
            name: 'textStyle',
            type: 'object',
            title: 'Text Style',
            fields: [
              defineField({
                name: 'textColor',
                title: 'Text color (hex)',
                type: 'string',
                description: 'Example: #1A1A1A',
                components: { input: HexColorInput },
                validation: (rule) =>
                  rule.custom((value) => {
                    if (!value) return true
                    if (typeof value !== 'string') return 'Must be a string'
                    const isHex = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value.trim())
                    return isHex ? true : 'Use a valid hex color like #1A1A1A'
                  }),
              }),
              defineField({
                name: 'fontFamily',
                title: 'Font family',
                type: 'string',
                options: { list: PAGE_INTRO_FONT_FAMILIES },
              }),
              defineField({
                name: 'fontSize',
                title: 'Font size',
                type: 'number',
                options: { list: PAGE_INTRO_FONT_SIZE_OPTIONS },
                validation: (rule) => rule.integer().min(6).max(50),
              }),
            ],
          },
        ],
      },
    },
  ],
}
