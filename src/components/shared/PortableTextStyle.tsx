import type { PortableTextMarkComponentProps } from '@portabletext/react'
import { getOptionalTextStyleFontClass } from '@/lib/textStyleFonts'

export function PortableTextStyle({ value, children }: PortableTextMarkComponentProps) {
  const color = typeof value?.textColor === 'string' ? value.textColor.trim() : ''
  const fontSize = typeof value?.fontSize === 'number' ? value.fontSize : undefined

  return (
    <span
      className={getOptionalTextStyleFontClass(value?.fontFamily)}
      style={{
        ...(/^#(?:[0-9a-fA-F]{3}){1,2}$/.test(color) ? { color } : {}),
        ...(fontSize ? { fontSize: `${fontSize}px` } : {}),
      }}
    >
      {children}
    </span>
  )
}
