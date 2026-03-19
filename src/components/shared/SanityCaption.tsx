import { PortableText, type PortableTextComponents } from 'next-sanity'

const captionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => <span className="block">{children}</span>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    captionSizeSm: ({ children }) => (
      <span className="text-xs leading-snug">{children}</span>
    ),
    captionSizeMd: ({ children }) => (
      <span className="text-sm leading-snug">{children}</span>
    ),
    captionSizeLg: ({ children }) => (
      <span className="text-base leading-snug">{children}</span>
    ),
  },
}

function hasCaptionContent(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (!Array.isArray(value)) return false

  return value.some((block) => {
    if (!block || typeof block !== 'object') return false
    const maybeChildren = (block as { children?: unknown }).children
    if (!Array.isArray(maybeChildren)) return false

    return maybeChildren.some((child) => {
      if (!child || typeof child !== 'object') return false
      const text = (child as { text?: unknown }).text
      return typeof text === 'string' && text.trim().length > 0
    })
  })
}

export { hasCaptionContent }

export function SanityCaption({ value }: { value: unknown }) {
  if (!hasCaptionContent(value)) return null

  if (typeof value === 'string') return value.trim()

  return <PortableText value={value as unknown} components={captionComponents} />
}

