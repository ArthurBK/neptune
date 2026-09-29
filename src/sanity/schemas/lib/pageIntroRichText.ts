import { InlineTextStylePortableTextInput } from '../../components/InlineTextStylePortableTextInput'
import { textStyleAnnotation } from './textStyleAnnotation'

export const pageIntroRichTextType = {
  type: 'array',
  components: { input: InlineTextStylePortableTextInput as never },
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
          textStyleAnnotation,
        ],
      },
    },
  ],
}
