export type HeaderVariant = 'light' | 'dark' | 'transparent-light' | 'white-on-white'

export type HeaderAppearance = {
  textColor?: 'auto' | 'black' | 'white' | null
  background?: 'auto' | 'white' | 'transparent' | null
}

export function getHeaderVariant(
  appearance: HeaderAppearance | null | undefined,
  sectionType: string | undefined,
  index: number,
): HeaderVariant {
  const isPhotoCarousel = sectionType === 'newsstandPhotos'
  const whiteText = appearance?.textColor === 'white'
    || (appearance?.textColor !== 'black' && !isPhotoCarousel && index === 0)
  const transparent = appearance?.background === 'transparent'
    || (appearance?.background !== 'white' && (isPhotoCarousel || index === 0))

  return transparent
    ? whiteText ? 'dark' : 'transparent-light'
    : whiteText ? 'white-on-white' : 'light'
}
