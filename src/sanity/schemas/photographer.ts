import { defineType } from 'sanity'
import { contributor } from './contributor'

// Compatibility schema for existing documents. New people use contributor.
// Reuse the same editing fields without rewriting IDs or breaking references.
export const photographer = defineType({
  ...contributor,
  name: 'photographer',
  title: 'Contributor',
  initialValue: { role: 'Photographer' },
  preview: {
    select: { title: 'name', subtitle: 'role', media: 'portrait' },
    prepare({ title, subtitle, media }) {
      return { title, subtitle: subtitle || 'Photographer', media }
    },
  },
})
