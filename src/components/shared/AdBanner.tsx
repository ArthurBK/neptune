import Image from 'next/image'
import Link from 'next/link'

import { urlFor } from '@/sanity/lib/image'

interface AdBannerProps {
  image: { asset?: { _ref: string } }
  linkUrl?: string | null
  title?: string | null
}

export function AdBanner({ image, linkUrl, title }: AdBannerProps) {
  const imageUrl = image?.asset ? urlFor(image).width(1200).url() : null

  if (!imageUrl) return null

  const content = (
    <div className="relative h-[72px] w-full bg-[#E5E5E5] sm:h-[88px] md:h-[100px] overflow-hidden">
      <Image
        src={imageUrl}
        alt={title ?? 'Advertisement'}
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  )

  if (linkUrl) {
    return (
      <Link
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full"
      >
        {content}
      </Link>
    )
  }

  return content
}
