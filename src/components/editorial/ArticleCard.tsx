import Image from 'next/image'
import Link from 'next/link'

import { urlFor } from '@/sanity/lib/image'

interface ArticleCardProps {
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: {
    asset?: { _ref: string }
    alt?: string
  }
  excerpt?: string | null
  author?: { name: string; slug: string } | null
}

export function ArticleCard({
  title,
  slug,
  category,
  subcategory,
  coverImage,
  author,
}: ArticleCardProps) {
  const imageUrl = coverImage?.asset
    ? urlFor(coverImage).width(600).height(800).url()
    : null

  return (
    <article className="group">
      <Link href={`/${category}/${slug}`} className="block overflow-hidden">
        <div className="aspect-[3/4] bg-[#E5E5E5] overflow-hidden">
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
            <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-sm">
              No image
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4">
        {subcategory && (
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] mb-1">
            {subcategory}
          </p>
        )}
        <Link href={`/${category}/${slug}`}>
          <h3 className="font-serif text-lg text-[#1A1A1A] group-hover:underline line-clamp-2">
            {title}
          </h3>
        </Link>
        {author && (
          <Link
            href={`/contributors/${author.slug}`}
            className="mt-1 block text-sm text-[#6B6B6B] hover:text-black transition-colors"
          >
            By {author.name}
          </Link>
        )}
      </div>
    </article>
  )
}
