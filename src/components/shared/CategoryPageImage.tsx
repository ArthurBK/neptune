import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

interface CategoryPageImageProps {
  image:
    | { asset?: { _ref: string }; alt?: string; caption?: string }
    | null
    | undefined
}

export function CategoryPageImage({ image }: CategoryPageImageProps) {
  if (!image?.asset) return null

  const imageUrl = urlFor(image).width(2560).quality(90).url()

  const caption = image.caption?.trim() || null

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
      {caption && (
        <p className="mt-3 text-center text-sm italic text-[#6B6B6B]">{caption}</p>
      )}
    </div>
  )
}
