import { defineMigration, set } from 'sanity/migrate'

function portableTextFromString(text: string) {
  // Convert a legacy plain string caption into the Portable Text structure
  // expected by the new caption schema (array of blocks).
  return [
    {
      _type: 'block',
      _key: 'caption-block',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'caption-span',
          text,
          marks: [],
        },
      ],
    },
  ]
}

export default defineMigration({
  title: 'Convert legacy caption strings to Portable Text',
  documentTypes: ['article', 'categoryPage', 'siteSettings'],
  migrate: {
    string(node, path) {
      const last = path[path.length - 1]
      if (typeof last !== 'string') return

      if (last === 'caption') {
        return set(portableTextFromString(node))
      }

      if (last === 'newsletterImageLegend') {
        return set(portableTextFromString(node))
      }
    },
  },
})

