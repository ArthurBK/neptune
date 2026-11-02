import { alignedTextStyles } from '@/lib/textAlignment'
import { AlignedTextBlock } from '../../components/AlignedTextBlock'
import { defineArrayMember } from 'sanity'
import { InlineTextStylePortableTextInput } from '../../components/InlineTextStylePortableTextInput'
import { textStyleAnnotation } from './textStyleAnnotation'
import { linkAnnotation } from './linkAnnotation'

export const captionRichTextType = {
  type: 'array',
  components: { input: InlineTextStylePortableTextInput as never },
  of: [
    defineArrayMember({
      type: 'block',
      components: { block: AlignedTextBlock },
      styles: alignedTextStyles([{ title: 'Normal', value: 'normal' }]),
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Size: Small', value: 'captionSizeSm' },
          { title: 'Size: Medium', value: 'captionSizeMd' },
          { title: 'Size: Large', value: 'captionSizeLg' },
        ],
        annotations: [linkAnnotation, textStyleAnnotation],
      },
    }),
  ],
}
