import Image from 'next/image'
import Link from 'next/link'

import { urlFor } from '@/sanity/lib/image'

interface ClientCardProps {
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: {
    asset?: { _ref: string }
    alt?: string
  }
  excerpt?: string | null
}

export function ClientCard({
  title,
  slug,
  subcategory,
  coverImage,
}: ClientCardProps) {
  const imageUrl = coverImage?.asset
    ? urlFor(coverImage).width(600).height(800).url()
    : null

  return (
    <article className="group">
      <Link href={`/clients/${slug}`} className="block overflow-hidden">
        <div className="aspect-3/4 bg-[#E5E5E5] overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={coverImage?.alt ?? title}
              width={600}
              height={800}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-base">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4">
        {subcategory && (
          <p className="text-sm tracking-[0.2em] uppercase text-[#6B6B6B] mb-1">
            {subcategory}
          </p>
        )}
        <Link href={`/clients/${slug}`}>
          <h3 className="font-serif text-2xl text-[#1A1A1A] group-hover:underline line-clamp-2">
            {title}
          </h3>
        </Link>
      </div>
    </article>
  )
}
