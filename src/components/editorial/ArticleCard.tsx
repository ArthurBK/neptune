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
  author?: { name: string; slug: string } | null
  size?: 'default' | 'compact'
}

export function ArticleCard({
  title,
  slug,
  category,
  subcategory,
  coverImage,
  author,
  size = 'default',
}: ArticleCardProps) {
  const isCompact = size === 'compact'
  const imageUrl = coverImage?.asset
    ? urlFor(coverImage)
        .width(isCompact ? 200 : 600)
        .height(isCompact ? 267 : 800)
        .url()
    : null

  return (
    <article>
      <div className="group">
        <Link href={`/${category}/${slug}`} className="block overflow-hidden">
          <div className="aspect-[3/4] bg-[#E5E5E5] overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={coverImage?.alt ?? title}
                width={isCompact ? 200 : 600}
                height={isCompact ? 267 : 800}
                sizes={
                  isCompact
                    ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                }
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div
                className={`w-full h-full flex items-center justify-center text-[#6B6B6B] ${isCompact ? 'text-sm' : 'text-base'}`}
              >
                No image
              </div>
            )}
          </div>
        </Link>
        <div className={isCompact ? 'mt-3' : 'mt-4'}>
          {subcategory && (
            <p
              className={`tracking-[0.2em] uppercase text-[#6B6B6B] mb-1 ${isCompact ? 'text-xs' : 'text-sm'}`}
            >
              {subcategory}
            </p>
          )}
          <Link href={`/${category}/${slug}`}>
            <h3
              className={`font-serif text-[#1A1A1A] group-hover:underline line-clamp-2 ${isCompact ? 'text-lg' : 'text-2xl'}`}
            >
              {title}
            </h3>
          </Link>
        </div>
      </div>
      {author && (
        <Link
          href={`/contributors/${author.slug}`}
          className={`mt-1 block text-[#6B6B6B] hover:text-black hover:underline underline-offset-2 transition-colors ${isCompact ? 'text-sm' : 'text-base'}`}
        >
          By {author.name}
        </Link>
      )}
    </article>
  )
}
