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
  author?: { name: string; slug: string } | null
}

export interface FeaturedProduct {
  handle: string
  title: string
  imageUrl: string | null
  imageAlt: string | null
}

export type HomeSection =
  | { type: 'article'; data: CarouselArticle }
  | {
      type: 'image'
      data: {
        _key?: string
        image: { asset?: { _ref: string }; alt?: string }
        alt: string
        title?: string | null
        linkUrl?: string | null
      }
    }
  | {
      type: 'affiliateProduct'
      data: {
        _key?: string
        _id: string
        title: string
        image: { asset?: { _ref: string }; alt?: string }
        affiliateUrl: string
      }
    }
  | { type: 'newsstandProduct'; data: FeaturedProduct }

interface StickyHeroStackProps {
  sections: HomeSection[]
}

function HeroSection({
  children,
  zIndex,
  keyProp,
  bgWhite = false,
}: {
  children: React.ReactNode
  zIndex: number
  keyProp: string
  bgWhite?: boolean
}) {
  return (
    <section
      key={keyProp}
      className={`sticky top-0 min-h-[480px] h-[calc(100vh-var(--header-height))] w-full min-w-0 snap-start overflow-hidden ${bgWhite ? 'bg-white' : 'bg-[#0a0a0a]'}`}
      style={{ zIndex }}
    >
      {children}
    </section>
  )
}

/** Plain image only — no overlay, no text, with background blur (for image blocks) */
function ImageOnlyContent({
  imageUrl,
  blurBgUrl,
  alt,
  href,
  asLink = true,
  priority = false,
}: {
  imageUrl: string | null
  blurBgUrl?: string | null
  alt: string
  href: string
  asLink?: boolean
  priority?: boolean
}) {
  const inner = (
    <div className="relative w-full h-full min-w-0 flex items-center justify-center overflow-hidden">
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
                priority={priority}
              />
            </div>
          </div>
          <div className="relative w-full h-full z-10">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority={priority}
            />
          </div>
        </>
      ) : (
        <div className="w-full h-64 bg-[#E5E5E5]" />
      )}
    </div>
  )

  if (asLink && href && href !== '#') {
    const isExternal = href.startsWith('http')
    const linkClass = "block h-full w-full cursor-pointer"
    return isExternal ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        {inner}
      </a>
    ) : (
      <Link href={href} className={linkClass}>
        {inner}
      </Link>
    )
  }
  return <div className="block h-full w-full">{inner}</div>
}

/** Product with title and DISCOVER button above the image */
function ProductContent({
  imageUrl,
  alt,
  title,
  href,
  priority = false,
}: {
  imageUrl: string | null
  alt: string
  title: string
  href: string
  priority?: boolean
}) {
  const buttonClass =
    'px-6 py-2.5 text-sm tracking-[0.2em] uppercase border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors'
  const DiscoverButton = href.startsWith('http') ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClass}
    >
      Discover
    </a>
  ) : (
    <Link href={href} className={buttonClass}>
      Discover
    </Link>
  )

  const imageContent = imageUrl ? (
    <Image
      src={imageUrl}
      alt={alt}
      fill
      className="object-contain"
      sizes="100vw"
      priority={priority}
    />
  ) : (
    <div className="w-full h-full bg-[#E5E5E5]" />
  )

  const ImageWrapper = href.startsWith('http') ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block relative w-full min-w-0 flex-1 min-h-[200px] cursor-pointer overflow-hidden"
    >
      {imageContent}
    </a>
  ) : (
    <Link
      href={href}
      className="block relative w-full min-w-0 flex-1 min-h-[200px] cursor-pointer overflow-hidden"
    >
      {imageContent}
    </Link>
  )

  return (
    <div className="flex flex-col items-center justify-start h-full w-full min-w-0 gap-6 pt-6 md:pt-12">
      <div className="flex flex-col items-center gap-4 shrink-0 px-4 sm:px-6 md:px-12 w-full max-w-full">
        <h2 className="font-serif text-xl md:text-2xl text-[#1A1A1A] text-center break-words max-w-full">
          {title}
        </h2>
        {DiscoverButton}
      </div>
      {ImageWrapper}
    </div>
  )
}

function HeroContent({
  imageUrl,
  blurBgUrl,
  alt,
  title,
  subtitle,
  subtitleHref,
  categoryHref,
  cta,
  href,
  priority = false,
  asLink = true,
}: {
  imageUrl: string | null
  blurBgUrl?: string | null
  alt: string
  title: string
  subtitle?: React.ReactNode
  subtitleHref?: string
  categoryHref?: string
  cta: string
  href: string
  priority?: boolean
  asLink?: boolean
}) {
  const overlayContent =
    subtitleHref && subtitle ? (
      <>
        <Link
          href={href}
          className="absolute inset-0 z-10"
          aria-label={`Read article: ${title}`}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center z-20 pointer-events-none w-full max-w-full box-border">
          {categoryHref && (
            <Link
              href={categoryHref}
              className="pointer-events-auto text-xs tracking-[0.25em] uppercase text-white/80 hover:text-white hover:underline underline-offset-2 transition-colors mb-3"
            >
              Cover Story
            </Link>
          )}
          <Link
            href={href}
            className="pointer-events-auto font-serif text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white tracking-wide max-w-full break-words [text-shadow:0_2px_20px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.6)] hover:opacity-90 transition-opacity"
          >
            {title}
          </Link>
          <Link
            href={subtitleHref}
            className="pointer-events-auto mt-3 text-base sm:text-lg md:text-xl text-white tracking-[0.15em] uppercase font-bold italic break-words [text-shadow:0_2px_12px_rgba(0,0,0,0.8)] hover:underline underline-offset-2 transition-colors"
          >
            {subtitle}
          </Link>
          <Link
            href={href}
            className="pointer-events-auto mt-4 font-accent text-sm tracking-[0.2em] lowercase text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)] hover:opacity-90 transition-opacity"
          >
            {cta}
          </Link>
        </div>
      </>
    ) : (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 text-center w-full max-w-full box-border">
        {categoryHref && (
          <Link
            href={categoryHref}
            className="text-xs tracking-[0.25em] uppercase text-white/80 hover:text-white hover:underline underline-offset-2 transition-colors mb-3"
          >
            Cover Story
          </Link>
        )}
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-white tracking-wide max-w-full break-words [text-shadow:0_2px_20px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.6)]">
          {title}
        </h2>
        {subtitle}
        <p className="mt-4 font-accent text-sm tracking-[0.2em] lowercase text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.8)]">
          {cta}
        </p>
      </div>
    )

  const inner = (
    <>
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
                priority={priority}
              />
            </div>
          </div>
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain"
            sizes="100vw"
            unoptimized={priority}
            priority={priority}
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
      {overlayContent}
    </>
  )

  const useSubtitleLink = !!subtitleHref && asLink && href && href !== '#'

  if (useSubtitleLink) {
    return <div className="block h-full w-full relative">{inner}</div>
  }

  if (asLink && href && href !== '#') {
    const isExternal = href.startsWith('http')
    return isExternal ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full w-full relative"
      >
        {inner}
      </a>
    ) : (
      <Link href={href} className="block h-full w-full relative">
        {inner}
      </Link>
    )
  }
  return <div className="block h-full w-full relative">{inner}</div>
}

/** Sticky stack: each section is position: sticky; top: 0; 100vh. As you scroll, each slides over the previous. */
export function StickyHeroStack({ sections }: StickyHeroStackProps) {
  if (sections.length === 0) return null

  return (
    <div className="w-full min-w-0">
      {sections.map((item, i) => {
        const zIndex = i + 1
        const priority = i === 0

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
            <HeroSection key={article._id} keyProp={article._id} zIndex={zIndex}>
              <HeroContent
                imageUrl={imageUrl}
                blurBgUrl={blurBgUrl}
                alt={article.coverImage?.alt ?? article.title}
                title={article.title}
                subtitle={article.author?.name}
                subtitleHref={
                  article.author?.slug
                    ? `/contributors/${article.author.slug}`
                    : undefined
                }
                categoryHref={`/${article.category}`}
                cta="read more"
                href={`/${article.category}/${article.slug}`}
                priority={priority}
              />
            </HeroSection>
          )
        }

        if (item.type === 'image') {
          const { image, alt, linkUrl } = item.data
          const imageUrl = image?.asset ? urlFor(image).width(3840).height(2160).quality(95).format('webp').url() : null
          const blurBgUrl = image?.asset ? urlFor(image).width(1280).height(720).quality(60).url() : null

          return (
            <HeroSection
              key={item.data._key ?? `image-${i}`}
              keyProp={item.data._key ?? `image-${i}`}
              zIndex={zIndex}
              bgWhite
            >
              <ImageOnlyContent
                imageUrl={imageUrl}
                blurBgUrl={blurBgUrl}
                alt={alt ?? ''}
                href={linkUrl ?? '#'}
                asLink={!!linkUrl}
                priority={priority}
              />
            </HeroSection>
          )
        }

        if (item.type === 'affiliateProduct') {
          const product = item.data
          const imageUrl = product.image?.asset
            ? urlFor(product.image).width(3840).height(2160).quality(95).format('webp').url()
            : null

          return (
            <HeroSection key={product._id} keyProp={product._id} zIndex={zIndex} bgWhite>
              <ProductContent
                imageUrl={imageUrl}
                alt={product.image?.alt ?? product.title}
                title={product.title}
                href={product.affiliateUrl}
                priority={priority}
              />
            </HeroSection>
          )
        }

        if (item.type === 'newsstandProduct') {
          const product = item.data
          return (
            <HeroSection key={`product-${product.handle}`} keyProp={`product-${product.handle}`} zIndex={zIndex} bgWhite>
              <ProductContent
                imageUrl={product.imageUrl}
                alt={product.imageAlt ?? product.title}
                title={product.title}
                href={`/newsstand/${product.handle}`}
                priority={priority}
              />
            </HeroSection>
          )
        }

        return null
      })}
    </div>
  )
}
