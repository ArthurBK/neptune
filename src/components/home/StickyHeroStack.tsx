'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { PortableTextBlock } from '@portabletext/types'
import { PortableText, type PortableTextComponents } from 'next-sanity'
import Image from 'next/image'
import Link from 'next/link'

import { useOpenNewsletterModal } from '@/contexts/NewsletterModalContext'
import { articleTitleSingleLine } from '@/lib/articleTitle'
import { urlFor } from '@/sanity/lib/image'
import { NewsstandCta } from '@/components/shared/NewsstandCta'

export interface CarouselArticle {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug: string } | null
}

export interface FeaturedProduct {
  handle: string
  title: string
  imageUrl: string | null
  imageAlt: string | null
}

type HomeRichText = PortableTextBlock[]

const inlineFontClassByValue: Record<string, string> = {
  serif: 'font-serif',
  futura: 'font-futura',
  header: 'font-header',
  sans: 'font-[Helvetica,Arial,sans-serif]',
}

function hasRichText(value: HomeRichText | null | undefined): value is HomeRichText {
  return Array.isArray(value) && value.length > 0
}

function normalizedHexColor(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const isHex = /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed)
  return isHex ? trimmed : undefined
}

const homeRichTextMarks: NonNullable<PortableTextComponents['marks']> = {
  strong: ({ children }) => <strong className="font-medium">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  underline: ({ children }) => <u>{children}</u>,
  textStyle: ({ value, children }) => {
    const fontFamilyValue =
      typeof value?.fontFamily === 'string' ? value.fontFamily : undefined
    const fontSizeValue = typeof value?.fontSize === 'number' ? value.fontSize : undefined
    const color = normalizedHexColor(value?.textColor)
    const className = fontFamilyValue ? inlineFontClassByValue[fontFamilyValue] : undefined
    const style: CSSProperties = {
      ...(color ? { color } : {}),
      ...(fontSizeValue ? { fontSize: `${fontSizeValue}px` } : {}),
    }

    return (
      <span className={className} style={style}>
        {children}
      </span>
    )
  },
}

const newsstandHeadlineComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <h2 className="mx-auto mb-2 max-w-2xl font-serif text-lg font-normal tracking-wide text-[#1A1A1A] md:text-xl lg:text-2xl">
        {children}
      </h2>
    ),
    h2: ({ children }) => (
      <h2 className="mx-auto mb-2 max-w-2xl font-serif text-xl font-normal tracking-wide text-[#1A1A1A] md:text-2xl lg:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mx-auto mb-2 max-w-2xl font-serif text-lg font-normal tracking-wide text-[#1A1A1A] md:text-xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mx-auto mb-2 max-w-2xl font-serif text-xl leading-tight text-[#1A1A1A] md:text-2xl">
        {children}
      </blockquote>
    ),
    pullQuote: ({ children }) => (
      <blockquote className="mx-auto mb-2 max-w-2xl font-serif text-2xl leading-tight text-[#1A1A1A] md:text-3xl">
        {children}
      </blockquote>
    ),
  },
  marks: homeRichTextMarks,
}

const newsstandDescriptionComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className="mx-auto max-w-xl text-xs leading-relaxed text-black md:text-sm"
        style={{ fontFamily: 'var(--font-gill-sans)' }}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mx-auto max-w-xl font-serif text-lg leading-tight text-black md:text-xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mx-auto max-w-xl font-serif text-base leading-tight text-black md:text-lg">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mx-auto max-w-xl font-serif text-lg leading-relaxed text-black md:text-xl">
        {children}
      </blockquote>
    ),
    pullQuote: ({ children }) => (
      <blockquote className="mx-auto max-w-2xl font-serif text-xl leading-snug text-black md:text-2xl">
        {children}
      </blockquote>
    ),
  },
  marks: homeRichTextMarks,
}

const newsletterSubtitleComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p
        className="mt-3 text-sm font-normal leading-relaxed text-black"
        style={{ fontFamily: 'var(--font-gill-sans)', fontWeight: 300 }}
      >
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-3 font-serif text-xl leading-tight text-black md:text-2xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-3 font-serif text-lg leading-tight text-black md:text-xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-3 font-serif text-xl leading-relaxed text-black md:text-2xl">
        {children}
      </blockquote>
    ),
    pullQuote: ({ children }) => (
      <blockquote className="mt-3 font-serif text-2xl leading-snug text-black md:text-3xl">
        {children}
      </blockquote>
    ),
  },
  marks: homeRichTextMarks,
}

export type HomeSection =
  | { type: 'article'; data: CarouselArticle }
  | {
    type: 'image'
    data: {
      _key?: string
      layout?: 'single' | 'split'
      image?: { asset?: { _ref: string }; alt?: string }
      alt?: string
      title?: string | null
      linkUrl?: string | null
      leftImage?: { asset?: { _ref: string }; alt?: string }
      leftAlt?: string
      leftLinkUrl?: string | null
      rightImage?: { asset?: { _ref: string }; alt?: string }
      rightAlt?: string
      rightLinkUrl?: string | null
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
      titleRichText?: HomeRichText | null
      description?: string | null
      descriptionRichText?: HomeRichText | null
      ctaLabel?: string | null
    }
  }
  | {
    type: 'newsletter'
    data: {
      leftImageUrl: string | null
      rightImageUrl: string | null
      headline?: string | null
      subtitle?: string | null
      subtitleRichText?: HomeRichText | null
    }
  }
  | { type: 'video'; data: { videoUrl: string } }

interface StickyHeroStackProps {
  sections: HomeSection[]
  /** When set, the first 100vh block shows this + first section; remaining sections use full 100vh */
  headerSlot?: ReactNode | null
  /** When true, reserve space for fixed header at top of first block (e.g. when header is rendered by layout) */
  reserveHeaderSpace?: boolean
  /** Optional: called when user clicks the scroll-down chevron on the first section */
  onScrollDown?: () => void
}

function ScrollDownChevron({
  onClick,
  lightBg = false,
}: {
  onClick?: () => void
  lightBg?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 rounded-full p-2 animate-bounce-subtle ${lightBg
        ? 'text-neutral-700 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)] focus-visible:ring-neutral-400'
        : 'text-white/90 drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] focus-visible:ring-white/50'
        }`}
      aria-label="Scroll down"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <title>Scroll down</title>
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  )
}

function HeroSection({
  children,
  zIndex,
  keyProp,
  bgWhite = false,
  bgTransparent = false,
  fullHeight = false,
  noPadding = false,
}: {
  children: React.ReactNode
  zIndex: number
  keyProp: string
  bgWhite?: boolean
  bgTransparent?: boolean
  fullHeight?: boolean
  noPadding?: boolean
}) {
  const bgClass = bgTransparent
    ? 'bg-transparent'
    : bgWhite
      ? 'bg-white'
      : 'bg-[#0a0a0a]'
  const heightClass = fullHeight
    ? 'h-[var(--section-height,100vh)] max-h-[var(--section-height,100vh)]'
    : 'h-[calc(var(--section-height,100vh)-var(--header-height))] max-h-[calc(var(--section-height,100vh)-var(--header-height))]'
  const padClass = bgTransparent || noPadding ? '' : 'px-[40px]'
  return (
    <section
      key={keyProp}
      className={`sticky top-0 box-border w-full min-w-0 shrink-0 overflow-hidden ${heightClass} ${bgClass} ${padClass}`}
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

function SplitImageContent({
  leftImageUrl,
  rightImageUrl,
  leftAlt,
  rightAlt,
  leftHref,
  rightHref,
  priority = false,
}: {
  leftImageUrl: string | null
  rightImageUrl: string | null
  leftAlt: string
  rightAlt: string
  leftHref?: string | null
  rightHref?: string | null
  priority?: boolean
}) {
  const renderHalf = (
    imageUrl: string | null,
    alt: string,
    href?: string | null,
    isPriority?: boolean
  ) => {
    const inner = (
      <div className="relative w-full h-full min-w-0 overflow-hidden bg-[#E5E5E5]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={isPriority}
          />
        ) : null}
      </div>
    )
    if (href && href !== '#') {
      const isExternal = href.startsWith('http')
      return isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
          {inner}
        </a>
      ) : (
        <Link href={href} className="block h-full w-full">
          {inner}
        </Link>
      )
    }
    return <div className="block h-full w-full">{inner}</div>
  }

  return (
    <div className="w-full h-full min-w-0 overflow-hidden">
      <div className="block md:hidden h-full">
        {renderHalf(leftImageUrl, leftAlt, leftHref, priority)}
      </div>
      <div className="hidden md:flex h-full min-w-0 flex-row">
        <div className="flex-1 min-w-0 h-full">
          {renderHalf(leftImageUrl, leftAlt, leftHref, priority)}
        </div>
        <div className="flex-1 min-w-0 h-full">
          {renderHalf(rightImageUrl, rightAlt, rightHref, false)}
        </div>
      </div>
    </div>
  )
}

/** Newsstand cover carousel: one centered cover inside a framed box. */
function NewsstandCoverCarousel({
  products,
  priority,
}: {
  products: FeaturedProduct[]
  priority: boolean
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const indexRef = useRef(0)

  useEffect(() => {
    // Warm image cache to reduce visible flashing while rotating.
    for (const p of products) {
      if (!p.imageUrl) continue
      const img = new window.Image()
      img.src = p.imageUrl
    }
  }, [products])

  useEffect(() => {
    if (products.length <= 1) return

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    if (reduceMotion) return

    const tick = () => {
      const next = (indexRef.current + 1) % products.length
      indexRef.current = next
      setActiveIndex(next)
    }

    const id = window.setInterval(tick, 2400)
    return () => window.clearInterval(id)
  }, [products.length])

  const p = products[Math.min(activeIndex, Math.max(0, products.length - 1))]
  if (!p) return null

  return (
    <div className="relative flex h-full max-h-[88vh] aspect-[6/5] w-auto max-w-full items-center justify-center overflow-hidden bg-[#E5E1D8] px-8 py-3 shadow-[0_18px_60px_rgba(0,0,0,0.12)] md:px-16 md:py-4 lg:px-28 lg:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.55),rgba(255,255,255,0)_58%)]" />
      <div className="relative flex h-full max-h-full min-h-0 w-full max-w-full items-center justify-center pb-5 md:pb-7">
        <Link
          href={`/newsstand/${p.handle}`}
          className="relative block h-[calc(100%-1.25rem)] max-h-full aspect-[4/5] max-w-full overflow-hidden shadow-[4px_5px_5px_rgba(0,0,0,0.3),0_8px_16px_rgba(0,0,0,0.14)] md:h-[calc(100%-1.75rem)]"
          aria-label={p.title}
        >
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.imageAlt ?? p.title}
              fill
              className="object-cover object-center transition-opacity duration-300"
              sizes="(max-width: 768px) 260px, 420px"
              priority={priority && activeIndex === 0}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[#F3F3F3] px-3 text-center text-sm text-[#6B6B6B]">
              {p.title}
            </div>
          )}
        </Link>
      </div>
      {products.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-4">
          {products.map((product, index) => (
            <button
              key={`${product.handle}-dot`}
              type="button"
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === activeIndex ? 'bg-black' : 'bg-black/25 hover:bg-black/50'
              }`}
              onClick={() => {
                indexRef.current = index
                setActiveIndex(index)
              }}
              aria-label={`Show ${product.title}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/** Newsstand hero: centered copy + framed cover carousel. */
function NewsstandHeroContent({
  products,
  title,
  titleRichText,
  description,
  descriptionRichText,
  ctaLabel,
  priority = false,
}: {
  products: FeaturedProduct[]
  featuredHandle: string
  title?: string | null
  titleRichText?: HomeRichText | null
  description?: string | null
  descriptionRichText?: HomeRichText | null
  ctaLabel?: string | null
  priority?: boolean
}) {
  const headline = title ?? products[0]?.title ?? ''
  const richHeadline = hasRichText(titleRichText) ? titleRichText : null
  const richDescription = hasRichText(descriptionRichText) ? descriptionRichText : null
  const cta = ctaLabel ?? 'Discover our anniversary issue'
  const carouselProducts = products.slice(0, 6)

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 max-w-full flex-col items-center justify-center overflow-hidden bg-white px-4 pt-[calc(var(--header-height)+20px)] pb-6 text-center md:px-10 md:pt-[calc(var(--header-height)+30px)] md:pb-10">
      <div className="flex h-full min-h-0 w-full max-w-6xl flex-col items-center justify-center">
        <div className="shrink-0">
          {richHeadline ? (
            <PortableText value={richHeadline} components={newsstandHeadlineComponents} />
          ) : (
            <h2 className="mx-auto mb-2 max-w-2xl font-serif text-lg font-normal tracking-wide text-[#1A1A1A] md:text-xl lg:text-2xl">
              {headline}
            </h2>
          )}
          {richDescription ? (
            <PortableText value={richDescription} components={newsstandDescriptionComponents} />
          ) : description ? (
            <p
              className="mx-auto max-w-xl text-xs leading-relaxed text-black md:text-sm"
              style={{ fontFamily: 'var(--font-gill-sans)' }}
            >
              {description}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex min-h-0 w-full flex-1 items-center justify-center md:mt-5">
          {carouselProducts.length > 0 ? (
            <NewsstandCoverCarousel
              key={carouselProducts.map((p) => p.handle).join('|')}
              products={carouselProducts}
              priority={priority}
            />
          ) : null}
        </div>

        <div className="mt-4 shrink-0 md:mt-5">
          <Link
            href="/newsstand"
            className="inline-block bg-black text-white font-header font-medium text-sm tracking-[0.18em] uppercase px-5 py-2.5 transition-colors hover:bg-[#1f1f1f]"
          >
            {cta}
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Newsletter section: left = headline + subscribe button, right = image */
function NewsletterSectionContent({
  leftImageUrl,
  rightImageUrl,
  headline,
  subtitle,
  subtitleRichText,
  priority = false,
}: {
  leftImageUrl: string | null
  rightImageUrl: string | null
  headline?: string | null
  subtitle?: string | null
  subtitleRichText?: HomeRichText | null
  priority?: boolean
}) {
  const openModal = useOpenNewsletterModal()
  const title = headline ?? 'Newsletter'
  const richSubtitle = hasRichText(subtitleRichText) ? subtitleRichText : null
  const introText =
    subtitle ??
    'For exclusive access to great interiors and great conversations,\nsign up for the Neptune Papers’ newsletter.'

  return (
    <div className="flex flex-col h-full min-h-0 w-full min-w-0 bg-white">
      <div className="flex flex-1 min-h-0 w-full flex-col md:flex-row">
        {/* Left image – desktop only */}
        <div className="hidden md:block md:flex-1 md:basis-1/2 min-w-0 min-h-0 relative overflow-hidden">
          {leftImageUrl ? (
            <Image
              src={leftImageUrl}
              alt=""
              fill
              className="object-cover object-center"
              sizes="50vw"
              priority={priority}
            />
          ) : null}
        </div>

        {/* Text + CTA – scrollable on mobile */}
        <div className="flex-1 min-w-0 min-h-0 overflow-y-auto overscroll-contain md:overflow-visible md:flex-none md:basis-1/2 md:flex md:items-center md:justify-center md:px-10 lg:md:px-16">
          <div className="w-full max-w-2xl mx-auto px-6 pt-[var(--header-height)] pb-8 text-center flex flex-col justify-center h-full md:h-auto md:flex-none md:px-0 md:pt-0 md:pb-0">
            <h2 className="font-futura font-normal text-xl md:text-2xl text-black uppercase tracking-wide">
              {title}
            </h2>
            {richSubtitle ? (
              <PortableText value={richSubtitle} components={newsletterSubtitleComponents} />
            ) : (
              <p
                className="mt-3 text-sm text-black leading-relaxed font-normal whitespace-pre-line"
                style={{ fontFamily: 'var(--font-gill-sans)', fontWeight: 300 }}
              >
                {introText}
              </p>
            )}
            <button
              type="button"
              onClick={openModal}
              className="cursor-pointer mt-5 w-fit mx-auto bg-black text-white font-futura text-sm md:text-base tracking-[0.18em] uppercase px-5 py-2.5 transition-colors hover:bg-[#1f1f1f]"
            >
              Subscribe now
            </button>
            {/* Right image – mobile only (below button) */}
            {rightImageUrl ? (
              <div className="md:hidden max-lg:landscape:hidden mt-5 w-screen -mx-6">
                <Image
                  src={rightImageUrl}
                  alt=""
                  width={1200}
                  height={900}
                  className="h-auto w-full object-contain object-center"
                  sizes="100vw"
                  priority={priority}
                />
              </div>
            ) : null}
            {/* Right image – desktop only (inline) */}
            {rightImageUrl ? (
              <div className="hidden md:block max-lg:landscape:hidden mt-6 mx-auto w-full max-w-lg">
                <div className="relative w-full h-[320px] md:h-[360px] overflow-hidden">
                  <Image
                    src={rightImageUrl}
                    alt=""
                    fill
                    className="object-contain object-center"
                    sizes="420px"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
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
  categoryLabel,
  href,
  priority = false,
}: {
  imageUrl: string | null
  alt: string
  title: string
  subtitle?: React.ReactNode
  subtitleHref?: string
  categoryHref?: string
  categoryLabel?: string | null
  href: string
  priority?: boolean
}) {
  return (
    <div className="flex flex-col h-auto md:h-full w-full min-w-0 items-center md:items-stretch bg-white">
      <div className="flex flex-col md:flex-row md:flex-1 min-h-0 w-full">
        {/* Left: image */}
        <div className="flex-[1.45] md:flex-1 min-w-0 min-h-[56vh] md:min-h-0 relative md:aspect-[16/9]">
          {imageUrl ? (
            <Link href={href} className="block h-full w-full md:absolute md:inset-0">
              <div className="flex h-full w-full items-center justify-center md:hidden">
                <img
                  src={imageUrl}
                  alt={alt}
                  className="block h-full w-full object-contain object-center"
                  loading={priority ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </div>
              <Image
                src={imageUrl}
                alt={alt}
                fill
                className="hidden object-contain object-right md:block"
                sizes="50vw"
                priority={priority}
              />
            </Link>
          ) : (
            <div className="absolute inset-0 bg-[#1a1a1a]" />
          )}
        </div>
        {/* Right: text */}
        <div className="flex-[0.65] md:flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left justify-start md:justify-center px-4 md:px-10 lg:px-16 pt-2 pb-1 md:py-12">
          {categoryHref && (
            <Link
              href={categoryHref}
              className="font-header font-extrabold text-[12px] tracking-[0.25em] uppercase text-[color:var(--neptune-logo-red)] hover:underline underline-offset-2 transition-colors mb-0"
            >
              {categoryLabel ?? 'Cover Story'}
            </Link>
          )}
          <Link href={href} className="group">
            <h2 className="max-w-full whitespace-pre-line break-words font-serif text-2xl font-bold leading-[0.98] md:leading-[1.22] tracking-wide text-black group-hover:opacity-80 group-hover:underline underline-offset-4 transition-opacity sm:text-3xl md:text-4xl max-lg:landscape:text-xl max-lg:landscape:leading-tight [-webkit-text-size-adjust:100%] [text-size-adjust:100%]">
              {title}
            </h2>
          </Link>
          {subtitle && (
            <p className="mt-0 text-sm md:text-lg text-black">
              by{' '}
              {subtitleHref ? (
                <Link
                  href={subtitleHref}
                  className="hover:text-black hover:underline underline-offset-2 transition-colors"
                >
                  {subtitle}
                </Link>
              ) : (
                subtitle
              )}
            </p>
          )}
          {/* <Link
            href={href}
            className="mt-4 font-accent text-sm tracking-[0.2em] lowercase text-[#1A1A1A] hover:opacity-80 transition-opacity inline-block"
          >
            read more
          </Link> */}
        </div>
      </div>
      {/* Below: Discover All Issues CTA (same as other pages: logo + text, centered, top/bottom border) */}
      <div className="shrink-0 mt-2 md:mt-auto">
        <NewsstandCta compactMobile />
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
  categoryLabel,
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
  categoryLabel?: string | null
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
              {categoryLabel ?? 'Cover Story'}
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
            {categoryLabel ?? 'Cover Story'}
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
): { content: ReactNode; key: string; keyProp: string; zIndex: number; bgWhite: boolean; bgTransparent: boolean; noPadding?: boolean } | null {
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
      ? urlFor(article.coverImage).width(2400).quality(95).format('webp').url()
      : null
    return {
      content: (
        <div
          className={`w-full h-full min-w-0 flex flex-col justify-center md:justify-start ${imageUrl ? 'pt-[var(--header-height)]' : ''}`}
        >
          <ArticleSplitContent
            imageUrl={imageUrl}
            alt={article.coverImage?.alt ?? articleTitleSingleLine(article.title)}
            title={article.title}
            subtitle={article.author?.name}
            subtitleHref={
              article.author?.slug ? `/contributors/${article.author.slug}` : undefined
            }
            categoryHref="/stories"
            categoryLabel={article.subcategory}
            href={`/stories/${article.slug}`}
            priority={priority}
          />
        </div>
      ),
      key: article._id,
      keyProp: article._id,
      zIndex,
      bgWhite: true,
      bgTransparent: false,
    }
  }
  if (item.type === 'image') {
    const { layout, image, alt, linkUrl, leftImage, leftAlt, leftLinkUrl, rightImage, rightAlt, rightLinkUrl } = item.data
    const imageUrl = image?.asset ? urlFor(image).width(2400).quality(95).format('webp').url() : null
    const leftImageUrl = leftImage?.asset
      ? urlFor(leftImage).width(1800).quality(95).format('webp').url()
      : null
    const rightImageUrl = rightImage?.asset
      ? urlFor(rightImage).width(1800).quality(95).format('webp').url()
      : null
    return {
      content: (
        layout === 'split' ? (
          <SplitImageContent
            leftImageUrl={leftImageUrl}
            rightImageUrl={rightImageUrl}
            leftAlt={leftAlt ?? ''}
            rightAlt={rightAlt ?? ''}
            leftHref={leftLinkUrl ?? '#'}
            rightHref={rightLinkUrl ?? '#'}
            priority={priority}
          />
        ) : (
          <ImageOnlyContent
            imageUrl={imageUrl}
            alt={alt ?? ''}
            href={linkUrl ?? '#'}
            asLink={!!linkUrl}
            priority={priority}
          />
        )
      ),
      key: item.data._key ?? `image-${index}`,
      keyProp: item.data._key ?? `image-${index}`,
      zIndex,
      bgWhite: true,
      bgTransparent: false,
      noPadding: true,
    }
  }
  if (item.type === 'affiliateProduct') {
    const product = item.data
    const imageUrl = product.image?.asset
      ? urlFor(product.image).width(2400).quality(95).format('webp').url()
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
    const {
      products,
      featuredHandle,
      title,
      titleRichText,
      description,
      descriptionRichText,
      ctaLabel,
    } = item.data
    return {
      content: (
        <div className="h-full w-full flex items-center">
          <NewsstandHeroContent
            products={products}
            featuredHandle={featuredHandle}
            title={title}
            titleRichText={titleRichText}
            description={description}
            descriptionRichText={descriptionRichText}
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
      noPadding: true,
    }
  }
  if (item.type === 'newsletter') {
    const { leftImageUrl, rightImageUrl, headline, subtitle, subtitleRichText } = item.data
    return {
      content: (
        <div className="h-full w-full min-h-0 flex items-stretch">
          <NewsletterSectionContent
            leftImageUrl={leftImageUrl}
            rightImageUrl={rightImageUrl}
            headline={headline}
            subtitle={subtitle}
            subtitleRichText={subtitleRichText}
            priority={priority}
          />
        </div>
      ),
      key: 'newsletter',
      keyProp: 'newsletter',
      zIndex,
      bgWhite: true,
      bgTransparent: false,
      noPadding: true,
    }
  }
  return null
}

/** Sticky stack: each section is position: sticky; top: 0; 100vh. As you scroll, each slides over the previous. */
export function StickyHeroStack({
  sections,
  headerSlot = null,
  reserveHeaderSpace = false,
  onScrollDown,
}: StickyHeroStackProps) {
  if (sections.length === 0) return null

  const withNavbar = !!headerSlot || reserveHeaderSpace

  return (
    <div className="w-full min-w-0">
      {withNavbar ? (
        <>
          {/* First block: one section height. When first section is video: video full screen with menu on top; else header + content below */}
          <div
            className="sticky top-0 flex flex-col w-full min-w-0 shrink-0 h-[var(--section-height,100vh)] min-h-[var(--section-height,100vh)] overflow-hidden relative"
            style={{ zIndex: 1 }}
          >
            {sections[0]?.type === 'video' ? (
              <>
                {/* Video full screen, then menu on top */}
                <div className="absolute inset-0 w-full h-full min-h-full">
                  {(() => {
                    const cfg = renderSectionContent(sections[0], 0)
                    return cfg ? cfg.content : null
                  })()}
                </div>
                {/* Spacer for fixed header in flow; fixed header overlays */}
                <div className="relative z-10 shrink-0 h-[var(--header-height)]" aria-hidden />
                {headerSlot && (
                  <div className="relative z-10 shrink-0">{headerSlot}</div>
                )}
                <div className="flex-1 min-h-0" aria-hidden />
              </>
            ) : (
              <>
                {/* Spacer for fixed header in flow; fixed header overlays */}
                <div className="shrink-0 h-[var(--header-height)]" aria-hidden />
                {headerSlot != null && headerSlot}
                {(() => {
                  const cfg = renderSectionContent(sections[0], 0)
                  if (!cfg) return null
                  const bgClass = cfg.bgTransparent
                    ? 'bg-transparent'
                    : cfg.bgWhite
                      ? 'bg-white'
                      : 'bg-[#0a0a0a]'
                  const padClass = cfg.noPadding ? '' : 'px-[40px]'
                  return (
                    <div className={`relative flex-1 min-h-0 overflow-hidden ${padClass} ${bgClass}`}>
                      {cfg.content}
                    </div>
                  )
                })()}
              </>
            )}
            <ScrollDownChevron
              onClick={onScrollDown}
              lightBg={renderSectionContent(sections[0], 0)?.bgWhite ?? false}
            />
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
                noPadding={cfg.noPadding}
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
              noPadding={cfg.noPadding}
            >
              {cfg.content}
            </HeroSection>
          )
        })
      )}
    </div>
  )
}
