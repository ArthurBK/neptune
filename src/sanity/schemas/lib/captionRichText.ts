import { defineArrayMember } from 'sanity'
import { InlineTextStylePortableTextInput } from '../../components/InlineTextStylePortableTextInput'
import { textStyleAnnotation } from './textStyleAnnotation'

export const captionRichTextType = {
  type: 'array',
  components: { input: InlineTextStylePortableTextInput as never },
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{ title: 'Normal', value: 'normal' }],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Size: Small', value: 'captionSizeSm' },
          { title: 'Size: Medium', value: 'captionSizeMd' },
          { title: 'Size: Large', value: 'captionSizeLg' },
        ],
        annotations: [textStyleAnnotation],
      },
    }),
  ],
}
