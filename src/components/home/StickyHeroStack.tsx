'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { urlFor } from '@/sanity/lib/image'
import { NewsstandCta } from '@/components/shared/NewsstandCta'

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
  | {
      type: 'newsstandProduct'
      data: {
        products: FeaturedProduct[]
        featuredHandle: string
        title?: string | null
        description?: string | null
        ctaLabel?: string | null
      }
    }
  | { type: 'video'; data: { videoUrl: string } }

interface StickyHeroStackProps {
  sections: HomeSection[]
  /** When set, the first 100vh block shows this + first section; remaining sections use full 100vh */
  headerSlot?: ReactNode
}

function HeroSection({
  children,
  zIndex,
  keyProp,
  bgWhite = false,
  bgTransparent = false,
  fullHeight = false,
}: {
  children: React.ReactNode
  zIndex: number
  keyProp: string
  bgWhite?: boolean
  bgTransparent?: boolean
  fullHeight?: boolean
}) {
  const bgClass = bgTransparent
    ? 'bg-transparent'
    : bgWhite
      ? 'bg-white'
      : 'bg-[#0a0a0a]'
  const heightClass = fullHeight
    ? 'h-screen max-h-screen'
    : 'h-[calc(100vh-var(--header-height))] max-h-[calc(100vh-var(--header-height))]'
  return (
    <section
      key={keyProp}
      className={`sticky top-0 box-border w-full min-w-0 shrink-0 overflow-hidden snap-start ${heightClass} ${bgClass}`}
      style={{ zIndex }}
    >
      {children}
    </section>
  )
}

/** Fullscreen video: auto-play, muted, loop (for home video block) */
function VideoSectionContent({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        src={videoUrl}
        aria-label="Background video"
      />
    </div>
  )
}

/** Plain image only — no overlay, no text (for image blocks) */
function ImageOnlyContent({
  imageUrl,
  alt,
  href,
  asLink = true,
  priority = false,
}: {
  imageUrl: string | null
  alt: string
  href: string
  asLink?: boolean
  priority?: boolean
}) {
  const inner = (
    <div className="relative w-full h-full min-w-0 flex items-center justify-center overflow-hidden">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority={priority}
        />
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

/** Newsstand hero: 6 product covers (left) + text (right) */
function NewsstandHeroContent({
  products,
  featuredHandle,
  title,
  description,
  ctaLabel,
  priority = false,
}: {
  products: FeaturedProduct[]
  featuredHandle: string
  title?: string | null
  description?: string | null
  ctaLabel?: string | null
  priority?: boolean
}) {
  const headline = title ?? products[0]?.title ?? ''
  const cta = ctaLabel ?? 'Discover our anniversary issue'

  return (
    <div className="flex flex-col md:flex-row w-full min-w-0 h-full gap-0 items-stretch overflow-hidden bg-white">
      {/* Left: 6 product covers in 3x2 grid, no padding on left/right/top */}
      <div className="flex-1 min-w-0 min-h-0 flex overflow-hidden">
        <div className="grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4 w-full h-full overflow-hidden">
          {products.slice(0, 6).map((p, i) => (
            <Link
              key={`${p.handle}-${i}`}
              href={`/newsstand/${p.handle}`}
              className={`relative flex flex-col overflow-hidden bg-white w-full h-full min-h-0 ${i < 3 ? 'justify-end' : 'justify-start'}`}
            >
              <div className="relative w-full aspect-3/4 shrink-0">
                {p.imageUrl ? (
                  <Image
                    src={p.imageUrl}
                    alt={p.imageAlt ?? p.title}
                    fill
                    className={`object-contain ${i < 3 ? 'object-bottom' : 'object-top'}`}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    priority={priority && products.indexOf(p) < 2}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#6B6B6B] text-sm">
                    {p.title}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right: text content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center px-6 md:px-10 lg:px-16 py-6 md:py-8">
        <h2 className="font-header font-medium text-2xl md:text-3xl lg:text-4xl text-[#1A1A1A] mb-4 md:mb-6">
          {headline}
        </h2>
        {description ? (
          <p className="text-base md:text-lg text-[#6B6B6B] mb-6 md:mb-8 leading-relaxed">
            {description}
          </p>
        ) : null}
        <Link
          href={`/newsstand/${featuredHandle}`}
          className="font-header font-medium text-sm md:text-base tracking-[0.2em] uppercase text-[#1A1A1A] hover:underline underline-offset-4 w-fit"
        >
          {cta}
        </Link>
      </div>
    </div>
  )
}

/** Article layout: left = image, right = text; below = Discover All Issues CTA */
function ArticleSplitContent({
  imageUrl,
  alt,
  title,
  subtitle,
  subtitleHref,
  categoryHref,
  href,
  priority = false,
}: {
  imageUrl: string | null
  alt: string
  title: string
  subtitle?: React.ReactNode
  subtitleHref?: string
  categoryHref?: string
  href: string
  priority?: boolean
}) {
  return (
    <div className="flex flex-col h-full w-full min-w-0 bg-white">
      <div className="flex flex-col md:flex-row flex-1 min-h-0 w-full">
        {/* Left: image */}
        <div className="flex-1 min-w-0 min-h-[40vh] md:min-h-0 relative bg-[#0a0a0a]">
          {imageUrl ? (
            <Link href={href} className="block absolute inset-0">
              <Image
                src={imageUrl}
                alt={alt}
                fill
                className="object-cover"
                sizes="50vw"
                priority={priority}
              />
            </Link>
          ) : (
            <div className="absolute inset-0 bg-[#1a1a1a]" />
          )}
        </div>
        {/* Right: text */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-6 md:px-10 lg:px-16 py-8 md:py-12">
          {categoryHref && (
            <Link
              href={categoryHref}
              className="text-xs tracking-[0.25em] uppercase text-[#6B6B6B] hover:text-black hover:underline underline-offset-2 transition-colors mb-3"
            >
              Cover Story
            </Link>
          )}
          <Link href={href} className="group">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] tracking-wide max-w-full break-words group-hover:opacity-80 transition-opacity">
              {title}
            </h2>
          </Link>
          {subtitleHref && subtitle ? (
            <Link
              href={subtitleHref}
              className="mt-3 text-base md:text-lg text-[#6B6B6B] hover:text-black hover:underline underline-offset-2 transition-colors"
            >
              {subtitle}
            </Link>
          ) : (
            subtitle && (
              <p className="mt-3 text-base md:text-lg text-[#6B6B6B]">{subtitle}</p>
            )
          )}
          <Link
            href={href}
            className="mt-4 font-accent text-sm tracking-[0.2em] lowercase text-[#1A1A1A] hover:opacity-80 transition-opacity inline-block"
          >
            read more
          </Link>
        </div>
      </div>
      {/* Below: Discover All Issues CTA (same as other pages: logo + text, centered, top/bottom border) */}
      <div className="shrink-0 mt-auto">
        <NewsstandCta />
      </div>
    </div>
  )
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
    'px-6 py-2.5 text-sm tracking-[0.2em] uppercase text-[#1A1A1A] hover:opacity-80 transition-colors'
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

/** Renders one section's inner content (used with or without HeroSection wrapper). */
function renderSectionContent(
  item: HomeSection,
  index: number
): { content: ReactNode; key: string; keyProp: string; zIndex: number; bgWhite: boolean; bgTransparent: boolean } | null {
  const zIndex = index + 1
  const priority = index === 0

  if (item.type === 'video') {
    return {
      content: <VideoSectionContent videoUrl={item.data.videoUrl} />,
      key: `video-${item.data.videoUrl}`,
      keyProp: `video-${item.data.videoUrl}`,
      zIndex,
      bgWhite: false,
      bgTransparent: true,
    }
  }
  if (item.type === 'article') {
    const article = item.data
    const imageUrl = article.coverImage?.asset
      ? urlFor(article.coverImage).width(3840).height(2160).quality(95).format('webp').url()
      : null
    return {
      content: (
        <ArticleSplitContent
          imageUrl={imageUrl}
          alt={article.coverImage?.alt ?? article.title}
          title={article.title}
          subtitle={article.author?.name}
          subtitleHref={
            article.author?.slug ? `/contributors/${article.author.slug}` : undefined
          }
          categoryHref={`/${article.category}`}
          href={`/${article.category}/${article.slug}`}
          priority={priority}
        />
      ),
      key: article._id,
      keyProp: article._id,
      zIndex,
      bgWhite: true,
      bgTransparent: false,
    }
  }
  if (item.type === 'image') {
    const { image, alt, linkUrl } = item.data
    const imageUrl = image?.asset
      ? urlFor(image).width(3840).height(2160).quality(95).format('webp').url()
      : null
    return {
      content: (
        <ImageOnlyContent
          imageUrl={imageUrl}
          alt={alt ?? ''}
          href={linkUrl ?? '#'}
          asLink={!!linkUrl}
          priority={priority}
        />
      ),
      key: item.data._key ?? `image-${index}`,
      keyProp: item.data._key ?? `image-${index}`,
      zIndex,
      bgWhite: true,
      bgTransparent: false,
    }
  }
  if (item.type === 'affiliateProduct') {
    const product = item.data
    const imageUrl = product.image?.asset
      ? urlFor(product.image).width(3840).height(2160).quality(95).format('webp').url()
      : null
    return {
      content: (
        <ProductContent
          imageUrl={imageUrl}
          alt={product.image?.alt ?? product.title}
          title={product.title}
          href={product.affiliateUrl}
          priority={priority}
        />
      ),
      key: product._id,
      keyProp: product._id,
      zIndex,
      bgWhite: true,
      bgTransparent: false,
    }
  }
  if (item.type === 'newsstandProduct') {
    const { products, featuredHandle, title, description, ctaLabel } = item.data
    return {
      content: (
        <div className="h-full w-full flex items-center">
          <NewsstandHeroContent
            products={products}
            featuredHandle={featuredHandle}
            title={title}
            description={description}
            ctaLabel={ctaLabel}
            priority={priority}
          />
        </div>
      ),
      key: `newsstand-${featuredHandle}`,
      keyProp: `newsstand-${featuredHandle}`,
      zIndex,
      bgWhite: true,
      bgTransparent: false,
    }
  }
  return null
}

/** Sticky stack: each section is position: sticky; top: 0; 100vh. As you scroll, each slides over the previous. */
export function StickyHeroStack({ sections, headerSlot }: StickyHeroStackProps) {
  if (sections.length === 0) return null

  const withNavbar = !!headerSlot

  return (
    <div className="w-full min-w-0">
      {withNavbar ? (
        <>
          {/* First block: 100vh. When first section is video: video full screen with menu on top; else header + content below */}
          <div
            className="sticky top-0 flex flex-col w-full min-w-0 shrink-0 h-screen overflow-hidden relative snap-start"
            style={{ zIndex: 1 }}
          >
            {sections[0]?.type === 'video' ? (
              <>
                {/* Video full screen, then menu on top */}
                <div className="absolute inset-0 w-full h-full">
                  {(() => {
                    const cfg = renderSectionContent(sections[0], 0)
                    return cfg ? cfg.content : null
                  })()}
                </div>
                <div className="relative z-10 shrink-0">{headerSlot}</div>
              </>
            ) : (
              <>
                {headerSlot}
                {(() => {
                  const cfg = renderSectionContent(sections[0], 0)
                  if (!cfg) return null
                  const bgClass = cfg.bgTransparent
                    ? 'bg-transparent'
                    : cfg.bgWhite
                      ? 'bg-white'
                      : 'bg-[#0a0a0a]'
                  return (
                    <div className={`relative flex-1 min-h-0 overflow-hidden ${bgClass}`}>
                      {cfg.content}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
          {/* Remaining sections: full 100vh each */}
          {sections.slice(1).map((item, i) => {
            const cfg = renderSectionContent(item, i + 1)
            if (!cfg) return null
            return (
              <HeroSection
                key={cfg.key}
                keyProp={cfg.keyProp}
                zIndex={cfg.zIndex}
                bgWhite={cfg.bgWhite}
                bgTransparent={cfg.bgTransparent}
                fullHeight
              >
                {cfg.content}
              </HeroSection>
            )
          })}
        </>
      ) : (
        sections.map((item, i) => {
          const cfg = renderSectionContent(item, i)
          if (!cfg) return null
          return (
            <HeroSection
              key={cfg.key}
              keyProp={cfg.keyProp}
              zIndex={cfg.zIndex}
              bgWhite={cfg.bgWhite}
              bgTransparent={cfg.bgTransparent}
            >
              {cfg.content}
            </HeroSection>
          )
        })
      )}
    </div>
  )
}
