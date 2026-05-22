import type { PortableTextBlock } from '@portabletext/types'
import { PortableText, type PortableTextComponents } from 'next-sanity'
import type { CSSProperties } from 'react'

export type PageIntroPortableText = PortableTextBlock[]

const inlineFontClassByValue: Record<string, string> = {
  serif: 'font-serif',
  futura: 'font-futura',
  header: 'font-header',
  sans: 'font-[Helvetica,Arial,sans-serif]',
}

function normalizedHexColor(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const isHex = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed)
  return isHex ? trimmed : undefined
}

const pageIntroTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className="mx-auto max-w-2xl whitespace-pre-line text-sm leading-relaxed text-black md:text-[16px]"
        style={{ fontFamily: 'var(--font-gill-sans)', fontWeight: 300 }}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mx-auto max-w-2xl font-serif text-2xl leading-tight text-black md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mx-auto max-w-2xl font-serif text-xl leading-tight text-black md:text-2xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mx-auto max-w-2xl font-serif text-2xl leading-relaxed text-black md:text-3xl">
        {children}
      </blockquote>
    ),
    pullQuote: ({ children }) => (
      <blockquote className="mx-auto max-w-3xl font-serif text-3xl leading-snug text-black md:text-4xl">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-medium">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    underline: ({ children }) => <u>{children}</u>,
    textStyle: ({ value, children }) => {
      const fontFamilyValue =
        typeof value?.fontFamily === 'string' ? value.fontFamily : undefined
      const fontSizeValue = typeof value?.fontSize === 'number' ? value.fontSize : undefined
      const color = normalizedHexColor(value?.textColor)
      const className = fontFamilyValue ? inlineFontClassByValue[fontFamilyValue] : undefined
      const style: CSSProperties = {
        ...(color ? { color } : {}),
        ...(fontSizeValue ? { fontSize: `${fontSizeValue}px` } : {}),
      }

      return (
        <span className={className} style={style}>
          {children}
        </span>
      )
    },
  },
}

export function hasPortableTextContent(
  value: PageIntroPortableText | null | undefined,
): value is PageIntroPortableText {
  return Array.isArray(value) && value.length > 0
}

export function portableTextToPlainText(value: PageIntroPortableText | null | undefined): string {
  if (!Array.isArray(value)) return ''

  return value
    .map((block) => {
      const children = Array.isArray(block.children) ? block.children : []
      return children
        .map((child) => (typeof child.text === 'string' ? child.text : ''))
        .join('')
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function PageIntroText({ value }: { value: PageIntroPortableText }) {
  return <PortableText value={value} components={pageIntroTextComponents} />
}
