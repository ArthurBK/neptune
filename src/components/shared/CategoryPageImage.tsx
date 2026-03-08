import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

interface CategoryPageImageProps {
  image: { asset?: { _ref: string }; alt?: string } | null | undefined
}

export function CategoryPageImage({ image }: CategoryPageImageProps) {
  if (!image?.asset) return null

  const imageUrl = urlFor(image).width(2560).quality(90).url()

  return (
    <div className="mt-8 relative w-full h-[100vh] bg-[#E5E5E5] overflow-hidden">
      <Image
        src={imageUrl}
        alt={image.alt ?? ''}
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  )
}
