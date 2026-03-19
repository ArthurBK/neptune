import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'

interface CategoryPageImageProps {
  image:
    | { asset?: { _ref: string }; alt?: string; caption?: unknown }
    | null
    | undefined
}

export function CategoryPageImage({ image }: CategoryPageImageProps) {
  if (!image?.asset) return null

  const imageUrl = urlFor(image).width(2560).quality(90).url()

  return (
    <div className="mt-8">
      <div className="relative w-full h-screen bg-[#E5E5E5] overflow-hidden">
        <Image
          src={imageUrl}
          alt={image.alt ?? ''}
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      {hasCaptionContent(image.caption) && (
        <p className="mt-3 text-center text-sm italic text-[#6B6B6B]">
          <SanityCaption value={image.caption} />
        </p>
      )}
    </div>
  )
}
