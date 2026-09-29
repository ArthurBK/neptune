import { urlFor } from '@/sanity/lib/image'
import type { NewsstandPhotoSlide } from '@/components/home/NewsstandPhotoHero'

export interface NewsstandPhoto {
  _key: string
  image?: {
    asset?: { _ref: string }
    crop?: { top: number; bottom: number; left: number; right: number }
    hotspot?: { x: number; y: number; width: number; height: number }
  } | null
  alt?: string | null
  ctaLabel?: string | null
  linkUrl?: string | null
}

export function getNewsstandPhotoSlides(photos?: NewsstandPhoto[] | null): NewsstandPhotoSlide[] {
  return (photos ?? []).flatMap((photo) => {
    const href = photo.linkUrl?.trim()
    if (!photo.image?.asset?._ref || !href || !photo.ctaLabel?.trim()) return []
    // Accept local destinations and web URLs, never executable URL schemes.
    if (!/^\/(?![\/\\])/.test(href) && !/^https?:\/\//i.test(href)) return []

    const hotspot = photo.image.hotspot
    return [{
      _key: photo._key,
      imageUrl: urlFor(photo.image).width(2400).quality(90).auto('format').url(),
      alt: photo.alt ?? '',
      ctaLabel: photo.ctaLabel.trim(),
      linkUrl: href,
      objectPosition: hotspot ? `${hotspot.x * 100}% ${hotspot.y * 100}%` : 'center',
    }]
  })
}
