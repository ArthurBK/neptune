export const captionRichTextType = {
  type: 'array',
  of: [
    {
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
        annotations: [],
      },
    },
  ],
  validation: (rule) => rule.max(3),
}

