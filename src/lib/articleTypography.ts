type ArticleTypography = {
  fontFamily?: 'serif' | 'futura' | 'header' | 'sans' | null
  textColor?: string | null
  titleSize?: 'sm' | 'md' | 'lg' | null
  bodySize?: 'sm' | 'md' | 'lg' | null
}

const TITLE_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-3xl md:text-4xl lg:text-5xl',
  md: 'text-4xl md:text-5xl lg:text-6xl',
  lg: 'text-5xl md:text-6xl lg:text-7xl',
}

const BODY_SIZE_CLASSES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'text-[18px] md:text-[20px]',
  md: 'text-[20px] md:text-[22px]',
  lg: 'text-[22px] md:text-[24px]',
}

const FONT_FAMILY_CLASSES: Record<'serif' | 'futura' | 'header' | 'sans', string> = {
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

export function resolveArticleTypography(typography: ArticleTypography | null | undefined) {
  const fontFamily = typography?.fontFamily ?? 'serif'
  const titleSize = typography?.titleSize ?? 'md'
  const bodySize = typography?.bodySize ?? 'md'
  const textColor = normalizedHexColor(typography?.textColor)

  return {
    fontFamilyClass: FONT_FAMILY_CLASSES[fontFamily] ?? FONT_FAMILY_CLASSES.serif,
    titleSizeClass: TITLE_SIZE_CLASSES[titleSize] ?? TITLE_SIZE_CLASSES.md,
    bodySizeClass: BODY_SIZE_CLASSES[bodySize] ?? BODY_SIZE_CLASSES.md,
    textColor,
  }
}

export type { ArticleTypography }
