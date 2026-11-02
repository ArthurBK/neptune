export type TextAlignment = 'left' | 'center' | 'right'

export function textAlignment(value: unknown): TextAlignment | undefined {
  return value === 'left' || value === 'center' || value === 'right' ? value : undefined
}

export function baseTextStyle(style: unknown) {
  return typeof style === 'string' ? style.replace(/-(left|center|right)$/, '') : 'normal'
}

export function blockTextAlignment(block: unknown) {
  if (!block || typeof block !== 'object' || !('style' in block) || typeof block.style !== 'string') return undefined
  return textAlignment(block.style.match(/-(left|center|right)$/)?.[1])
}

export function alignedTextStyles(styles: Array<{ title: string; value: string }>) {
  return styles.flatMap(style => [style, ...(['left', 'center', 'right'] as const)
    .filter(alignment => alignment !== (style.value === 'pullQuote' ? 'center' : 'left'))
    .map(alignment => ({ title: `${style.title} — ${alignment === 'center' ? 'Centered' : alignment === 'left' ? 'Left' : 'Right'}`, value: `${style.value}-${alignment}` }))])
}

export function alignedStyle(style: unknown, alignment: TextAlignment) {
  const base = baseTextStyle(style)
  return alignment === (base === 'pullQuote' ? 'center' : 'left') ? base : `${base}-${alignment}`
}
