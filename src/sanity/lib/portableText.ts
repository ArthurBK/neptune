export type SimplePortableTextBlock = {
  _type: 'block'
  _key: string
  style: 'normal'
  markDefs: []
  children: Array<{
    _type: 'span'
    _key: string
    text: string
    marks: []
  }>
}

function keySafe(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'text'
}

export function plainTextToPortableText(
  value: string,
  keyPrefix = 'default',
): SimplePortableTextBlock[] {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return paragraphs.map((text, index) => {
    const key = `${keySafe(keyPrefix)}${index}`

    return {
      _type: 'block',
      _key: key,
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `${key}Span`,
          text,
          marks: [],
        },
      ],
    }
  })
}
