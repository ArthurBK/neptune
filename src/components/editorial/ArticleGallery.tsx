import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

type GalleryImage = {
  asset?: { _ref?: string }
  alt?: string
  caption?: string
}

interface ArticleGalleryProps {
  images: GalleryImage[]
}

export function ArticleGallery({ images }: ArticleGalleryProps) {
  if (!images?.length) return null

  return (
    <div className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {images.map((item, i) => {
        const imageUrl = item?.asset
          ? urlFor(item).width(800).height(600).url()
          : null
        if (!imageUrl) return null

        return (
          <figure key={`${item.asset?._ref ?? 'img'}-${i}`} className="group">
            <div className="relative aspect-[4/3] bg-[#E5E5E5] overflow-hidden">
              <Image
                src={imageUrl}
                alt={item.alt ?? ''}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              />
            </div>
            {item.caption && (
              <figcaption className="mt-2 text-base text-[#6B6B6B] italic">
                {item.caption}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
