'use client'

import Image from 'next/image'
import Link from 'next/link'

import { urlFor } from '@/sanity/lib/image'

export interface CarouselArticle {
  _id: string
  title: string
  slug: string
  category: string
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string } | null
}

export interface FeaturedProduct {
  handle: string
  title: string
  imageUrl: string | null
  imageAlt: string | null
}

interface StickyHeroStackProps {
  articles: CarouselArticle[]
  featuredProduct?: FeaturedProduct | null
}

/** Sticky stack: each section is position: sticky; top: 0; 100vh. As you scroll, each slides over the previous. */
export function StickyHeroStack({ articles, featuredProduct }: StickyHeroStackProps) {
  const sections: Array<{ type: 'article'; data: CarouselArticle } | { type: 'product'; data: FeaturedProduct }> = [
    ...articles.map((a) => ({ type: 'article' as const, data: a })),
    ...(featuredProduct ? [{ type: 'product' as const, data: featuredProduct }] : []),
  ]

  if (sections.length === 0) return null

  return (
    <div>
      {sections.map((item, i) => {
        const zIndex = i + 1
        if (item.type === 'article') {
          const article = item.data
          const imageUrl = article.coverImage?.asset
            ? urlFor(article.coverImage)
                .width(3840)
                .height(2160)
                .quality(95)
                .format('webp')
                .url()
            : null
          const blurBgUrl = article.coverImage?.asset
            ? urlFor(article.coverImage).width(1280).height(720).quality(60).url()
            : null

          return (
            <section
              key={article._id}
              className="sticky top-0 min-h-[480px] h-[calc(100vh-var(--header-height))] snap-start overflow-hidden bg-[#0a0a0a]"
              style={{ zIndex }}
            >
              <Link
                href={`/${article.category}/${article.slug}`}
                className="block h-full w-full relative"
              >
                {imageUrl ? (
                  <>
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0 scale-[1.15]">
                        <Image
                          src={blurBgUrl ?? imageUrl}
                          alt=""
                          fill
                          className="object-cover blur-2xl"
                          sizes="100vw"
                          priority={i === 0}
                        />
                      </div>
                    </div>
                    <Image
                      src={imageUrl}
                      alt={article.coverImage?.alt ?? article.title}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      unoptimized
                      priority={i === 0}
                    />
                  </>
                ) : (
                  <div className="h-full w-full bg-[#1a1a1a]" />
                )}
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/50"
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,0,0,0.5),transparent)]"
                  aria-hidden
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                  <h2 className="font-serif text-5xl md:text-6xl lg:text-8xl text-white tracking-wide max-w-4xl [text-shadow:0_2px_20px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.6)]">
                    {article.title}
                  </h2>
                  {article.author && (
                    <p className="mt-3 text-lg md:text-xl text-white tracking-[0.15em] uppercase font-bold italic [text-shadow:0_2px_12px_rgba(0,0,0,0.8)]">
                      {article.author.name}
                    </p>
                  )}
                  <p className="mt-4 font-accent text-sm tracking-[0.2em] lowercase text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                    read more
                  </p>
                </div>
              </Link>
            </section>
          )
        }

        const product = item.data
        return (
          <section
            key={`product-${product.handle}`}
            className="sticky top-0 min-h-[480px] h-[calc(100vh-var(--header-height))] snap-start overflow-hidden bg-[#0a0a0a]"
            style={{ zIndex }}
          >
            <Link
              href={`/newsstand/${product.handle}`}
              className="block h-full w-full relative"
            >
              {product.imageUrl ? (
                <>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 scale-[1.15]">
                      <Image
                        src={product.imageUrl}
                        alt=""
                        fill
                        className="object-cover blur-2xl"
                        sizes="100vw"
                        priority={false}
                      />
                    </div>
                  </div>
                  <Image
                    src={product.imageUrl}
                    alt={product.imageAlt ?? product.title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                  />
                </>
              ) : (
                <div className="h-full w-full bg-[#1a1a1a]" />
              )}
              <div
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/50"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,0,0,0.5),transparent)]"
                aria-hidden
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
                <h2 className="font-serif text-5xl md:text-6xl lg:text-8xl text-white tracking-wide max-w-4xl [text-shadow:0_2px_20px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.6)]">
                  {product.title}
                </h2>
                <p className="mt-4 font-accent text-sm tracking-[0.2em] lowercase text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                  order now
                </p>
              </div>
            </Link>
          </section>
        )
      })}
    </div>
  )
}
