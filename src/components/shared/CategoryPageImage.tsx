import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'

interface CategoryPageImageProps {
  image:
  | { asset?: { _ref: string }; alt?: string; caption?: unknown }
  | null
  | undefined
}

function getSanityImageDimensions(ref?: string): { width: number; height: number } {
  const match = ref?.match(/-(\d+)x(\d+)-/)
  const width = match ? Number.parseInt(match[1], 10) : 2560
  const height = match ? Number.parseInt(match[2], 10) : 1600
  return { width, height }
}

export function CategoryPageImage({ image }: CategoryPageImageProps) {
  if (!image?.asset) return null

  const imageUrl = urlFor(image).width(2560).quality(90).url()
  const { width, height } = getSanityImageDimensions(image.asset._ref)

  return (
    <div className="">
      <div className="relative w-full bg-[#E5E5E5] overflow-hidden md:h-screen">
        <Image
          src={imageUrl}
          alt={image.alt ?? ''}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, 100vw"
          unoptimized
          className="h-auto w-full object-contain md:absolute md:inset-0 md:h-full md:object-cover"
        />
      </div>
      {hasCaptionContent(image.caption) && (
        <p className="mt-3 text-center text-sm italic text-black">
          <SanityCaption value={image.caption} />
        </p>
      )}
    </div>
  )
}
