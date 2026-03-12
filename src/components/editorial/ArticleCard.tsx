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
  size?: 'default' | 'compact' | 'featured'
  /** When true, card fills container height; image uses flex-1, no fixed aspect. */
  fillHeight?: boolean
  /** When true, image and text are side by side (image left, text right). */
  horizontal?: boolean
}

export function ArticleCard({
  title,
  slug,
  category,
  subcategory,
  coverImage,
  author,
  size = 'default',
  fillHeight = false,
  horizontal = false,
}: ArticleCardProps) {
  const isCompact = size === 'compact'
  const isFeatured = size === 'featured'
  const imageWidth = isCompact ? 400 : 600
  const imageHeight = isCompact ? 533 : 800
  const imageUrl = coverImage?.asset
    ? urlFor(coverImage).width(imageWidth).height(imageHeight).url()
    : null

  const imageSizes =
    size === 'featured'
      ? '(max-width: 1024px) 100vw, 50vw'
      : isCompact
        ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
        : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  const imageContainerClass = fillHeight
    ? 'flex-1 min-h-0 bg-[#E5E5E5] overflow-hidden'
    : 'aspect-[3/4] bg-[#E5E5E5] overflow-hidden'

  const titleSizeClass = isCompact ? 'text-lg' : isFeatured ? 'text-2xl' : 'text-2xl'

  if (horizontal) {
    return (
      <article className="group h-full">
        <div className="flex h-full gap-3">
          <Link
            href={`/${category}/${slug}`}
            className="block w-4/5 shrink-0 overflow-hidden"
          >
            <div className="relative h-full bg-[#E5E5E5] overflow-hidden">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={coverImage?.alt ?? title}
                  fill
                  sizes="(max-width: 1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-sm">
                  No image
                </div>
              )}
            </div>
          </Link>
          <div className="flex flex-col justify-center min-w-0">
            {subcategory && (
              <p className="tracking-[0.2em] uppercase text-[#6B6B6B] mb-1 text-xs">
                {subcategory}
              </p>
            )}
            <Link href={`/${category}/${slug}`}>
              <h3 className="font-serif text-[#1A1A1A] group-hover:underline line-clamp-3 text-sm leading-snug">
                {title}
              </h3>
            </Link>
            {author && (
              <Link
                href={`/contributors/${author.slug}`}
                className="mt-1 block text-[#6B6B6B] hover:text-black hover:underline underline-offset-2 transition-colors text-xs"
              >
                By {author.name}
              </Link>
            )}
          </div>
        </div>
      </article>
    )
  }

  if (fillHeight) {
    return (
      <article className="group lg:h-full lg:flex lg:flex-col">
        <Link
          href={`/${category}/${slug}`}
          className="block lg:flex-1 lg:min-h-0 overflow-hidden"
        >
          <div className="aspect-[3/4] lg:aspect-auto lg:h-full bg-[#E5E5E5] overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={coverImage?.alt ?? title}
                width={imageWidth}
                height={imageHeight}
                sizes={imageSizes}
                className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#6B6B6B] text-sm">
                No image
              </div>
            )}
          </div>
        </Link>
        <div className="mt-2 lg:shrink-0">
          {subcategory && (
            <p className="tracking-[0.2em] uppercase text-[#6B6B6B] mb-1 text-xs">
              {subcategory}
            </p>
          )}
          <Link href={`/${category}/${slug}`}>
            <h3 className={`font-serif text-[#1A1A1A] group-hover:underline line-clamp-2 ${titleSizeClass}`}>
              {title}
            </h3>
          </Link>
        </div>
        {author && (
          <Link
            href={`/contributors/${author.slug}`}
            className="mt-1 block lg:shrink-0 text-[#6B6B6B] hover:text-black hover:underline underline-offset-2 transition-colors text-sm"
          >
            By {author.name}
          </Link>
        )}
      </article>
    )
  }

  return (
    <article>
      <div className="group">
        <Link href={`/${category}/${slug}`} className="block overflow-hidden">
          <div className={imageContainerClass}>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={coverImage?.alt ?? title}
                width={imageWidth}
                height={imageHeight}
                sizes={imageSizes}
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
              className={`font-serif text-[#1A1A1A] group-hover:underline line-clamp-2 ${titleSizeClass}`}
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
