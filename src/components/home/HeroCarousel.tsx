'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

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

interface HeroCarouselProps {
  articles: CarouselArticle[]
  featuredProduct?: FeaturedProduct | null
}

export function HeroCarousel({ articles, featuredProduct }: HeroCarouselProps) {
  const slidesCount = articles.length + (featuredProduct ? 1 : 0)
  const [current, setCurrent] = useState(0)

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % slidesCount) + slidesCount) % slidesCount)
    },
    [slidesCount]
  )

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    if (slidesCount <= 1) return
    const id = setInterval(next, 6000)
    return () => clearInterval(id)
  }, [slidesCount, next])

  if (slidesCount === 0) return null

  return (
    <section className="relative h-[100vh] min-h-[480px] overflow-hidden bg-[#0a0a0a]">
      {articles.map((article, i) => {
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
        const isActive = i === current

        return (
          <div
            key={article._id}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? 'z-10 opacity-100' : 'z-0 opacity-0'
            }`}
            aria-hidden={!isActive}
          >
            <Link
              href={`/${article.category}/${article.slug}`}
              className="block h-full w-full relative"
            >
              {imageUrl ? (
                <>
                  {/* Arrière-plan : zoom + flou quand l'image ne remplit pas */}
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
                  {/* Image principale en contain — unoptimized pour netteté maximale */}
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
              {/* Overlay for text readability */}
              <div
                className="absolute inset-0 bg-linear-to-t from-black/70 via-black/40 to-black/50"
                aria-hidden
              />
              {/* Radial vignette to darken center where text sits */}
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(0,0,0,0.5),transparent)]"
                aria-hidden
              />
              {/* Titre centré */}
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
          </div>
        )
      })}

      {/* Product slide — latest issue, Order now */}
      {featuredProduct && (
        <div
          className={`absolute inset-0 transition-opacity duration-700 ease-out ${
            current === articles.length ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
          aria-hidden={current !== articles.length}
        >
          <Link
            href={`/newsstand/${featuredProduct.handle}`}
            className="block h-full w-full relative"
          >
            {featuredProduct.imageUrl ? (
              <>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 scale-[1.15]">
                    <Image
                      src={featuredProduct.imageUrl}
                      alt=""
                      fill
                      className="object-cover blur-2xl"
                      sizes="100vw"
                      priority={false}
                    />
                  </div>
                </div>
                <Image
                  src={featuredProduct.imageUrl}
                  alt={featuredProduct.imageAlt ?? featuredProduct.title}
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
                {featuredProduct.title}
              </h2>
              <p className="mt-4 font-accent text-sm tracking-[0.2em] lowercase text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
                order now
              </p>
            </div>
          </Link>
        </div>
      )}

      {/* Navigation */}
      {slidesCount > 1 && (
        <>
          {/* Flèches */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              prev()
            }}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-white/70 transition-colors hover:text-white hover:bg-white/10"
            aria-label="Article précédent"
          >
            <svg
              width="24"
              height="24"
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Précédent</title>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              next()
            }}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full p-2 text-white/70 transition-colors hover:text-white hover:bg-white/10"
            aria-label="Article suivant"
          >
            <svg
              width="24"
              height="24"
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>Suivant</title>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {[...articles.map((a) => a._id), ...(featuredProduct ? ['product'] : [])].map((id, i) => (
              <button
                key={id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  goTo(i)
                }}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Aller au slide ${i + 1}`}
                aria-current={i === current}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
