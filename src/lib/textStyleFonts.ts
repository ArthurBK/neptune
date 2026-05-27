export type TextStyleFontFamily =
  | 'serif'
  | 'ebGaramond'
  | 'gill'
  | 'futura'
  | 'header'
  | 'helvetica'
  | 'avenir'
  | 'inter'
  | 'georgia'
  | 'times'
  | 'garamond'
  | 'arial'
  | 'mono'
  | 'sans'

export const TEXT_STYLE_FONT_FAMILIES: { title: string; value: TextStyleFontFamily }[] = [
  { title: 'Cormorant Garamond', value: 'serif' },
  { title: 'EB Garamond', value: 'ebGaramond' },
  { title: 'Gill Sans', value: 'gill' },
  { title: 'Futura', value: 'futura' },
  { title: 'Helvetica Neue', value: 'header' },
  { title: 'Helvetica', value: 'helvetica' },
  { title: 'Avenir', value: 'avenir' },
  { title: 'Inter', value: 'inter' },
  { title: 'Georgia', value: 'georgia' },
  { title: 'Times New Roman', value: 'times' },
  { title: 'Garamond', value: 'garamond' },
  { title: 'Arial', value: 'arial' },
  { title: 'Courier New', value: 'mono' },
  { title: 'Sans-serif', value: 'sans' },
]

export const TEXT_STYLE_FONT_CLASS_BY_VALUE: Record<TextStyleFontFamily, string> = {
  serif: 'font-serif',
  ebGaramond: 'font-eb-garamond',
  gill: 'font-gill',
  futura: 'font-futura',
  header: 'font-header',
  helvetica: 'font-helvetica',
  avenir: 'font-avenir',
  inter: 'font-inter-ui',
  georgia: 'font-georgia',
  times: 'font-times',
  garamond: 'font-garamond',
  arial: 'font-arial',
  mono: 'font-editorial-mono',
  sans: 'font-system-sans',
}

export function getOptionalTextStyleFontClass(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return TEXT_STYLE_FONT_CLASS_BY_VALUE[value as TextStyleFontFamily]
}

export function getTextStyleFontClass(
  value: unknown,
  fallback: TextStyleFontFamily = 'serif',
): string {
  return getOptionalTextStyleFontClass(value) ?? TEXT_STYLE_FONT_CLASS_BY_VALUE[fallback]
}
