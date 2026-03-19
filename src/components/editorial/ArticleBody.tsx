import { PortableText, type PortableTextComponents } from 'next-sanity'
import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'

const TextWrapper = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`w-full max-w-[900px] mx-auto px-6 md:px-12 ${className}`}>
    {children}
  </div>
)

function createComponents(isFirstParagraph: { current: boolean }): PortableTextComponents {
  return {
    block: {
      normal: ({ children }) => {
        const isFirst = isFirstParagraph.current
        if (isFirst) isFirstParagraph.current = false
        return (
          <TextWrapper className={isFirst ? 'mt-10 mb-8' : 'mb-4'}>
            <p
              className={
                isFirst
                  ? 'text-[#1A1A1A] leading-[1.85] text-[20px] md:text-[22px]'
                  : 'text-[#1A1A1A] leading-[1.85] text-[20px] md:text-[22px]'
              }
            >
              {children}
            </p>
          </TextWrapper>
        )
      },
      h2: ({ children }) => (
        <TextWrapper className="mt-8 mb-3">
          <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] leading-tight">
            {children}
          </h2>
        </TextWrapper>
      ),
      h3: ({ children }) => (
        <TextWrapper className="mt-6 mb-2">
          <h3 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] leading-tight">
            {children}
          </h3>
        </TextWrapper>
      ),
      blockquote: ({ children }) => (
        <TextWrapper className="my-6">
          <blockquote className="border-l-2 border-[#1A1A1A] pl-8 text-[#1A1A1A] text-2xl md:text-3xl leading-relaxed">
            {children}
          </blockquote>
        </TextWrapper>
      ),
      pullQuote: ({ children }) => (
        <div className="w-full my-8">
          <blockquote className="font-serif text-4xl md:text-5xl text-center leading-snug text-[#1A1A1A]">
            {children}
          </blockquote>
        </div>
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-medium">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      underline: ({ children }) => <u>{children}</u>,
      affiliateProductEmbed: ({ value, children }) => {
        const product = value?.product as { affiliateUrl?: string; title?: string } | undefined
        if (!product?.affiliateUrl) return <span>{children}</span>
        return (
          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline text-[#1A1A1A]"
          >
            {children}
          </a>
        )
      },
    },
    types: {
      pteImageBlock: ({ value }) => {
        if (!value?.image) return null
        const layout = (value.layout as string) ?? 'full'
        const isFloatLayout = layout === 'left' || layout === 'right'

        // Sanity image metadata usually contains original dimensions.
        // Use them (when available) to make the rendered height follow
        // the picture's real aspect ratio, instead of forcing a fixed one.
        const imageAsset = value.image as unknown as {
          asset?: {
            metadata?: { dimensions?: { width?: number; height?: number } }
          }
        }
        const dimensions = imageAsset?.asset?.metadata?.dimensions
        const aspectRatio =
          isFloatLayout && dimensions?.width && dimensions?.height
            ? `${dimensions.width} / ${dimensions.height}`
            : null
        const layoutClasses: Record<string, string> = {
          full: 'clear-both w-full my-6 md:my-8',
          wide: 'clear-both w-full my-6 md:my-8',
          center:
            'clear-both mx-auto w-full max-w-2xl md:max-w-3xl px-6 md:px-12 my-6 md:my-8',
          left: 'float-left mr-6 mb-4 w-full md:w-[50vw] shrink-0',
          right: 'float-right ml-6 mb-4 w-full md:w-[50vw] shrink-0',
        }
        const figureClass = layoutClasses[layout] ?? layoutClasses.full
        const imageWidth = 1400
        const computedHeight =
          dimensions?.width && dimensions?.height
            ? Math.max(1, Math.round((imageWidth * dimensions.height) / dimensions.width))
            : 1050
        const imageUrl = urlFor(value.image)
          .width(imageWidth)
          .height(computedHeight)
          .quality(90)
          .url()
        return (
          <figure className={figureClass}>
            <div className="w-full">
              <div
                className={
                  isFloatLayout && aspectRatio
                    ? 'relative bg-[#E5E5E5] overflow-hidden'
                    : 'relative aspect-4/3 md:aspect-16/10 bg-[#E5E5E5] overflow-hidden'
                }
                style={isFloatLayout && aspectRatio ? { aspectRatio } : undefined}
              >
                <Image
                  src={imageUrl}
                  alt={value.alt ?? ''}
                  fill
                  sizes={
                    layout === 'full' || layout === 'wide'
                      ? '100vw'
                      : layout === 'center'
                        ? '(max-width: 768px) 100vw, 768px'
                        : '(max-width: 768px) 100vw, 50vw'
                  }
                  className="object-cover"
                />
              </div>
            </div>
            {hasCaptionContent(value.caption) && (
              <figcaption
                className={`mt-2 text-sm text-[#6B6B6B] ${layout === 'center' ? 'text-center' : ''}`}
              >
                <SanityCaption value={value.caption} />
              </figcaption>
            )}
          </figure>
        )
      },
      pteImageGridBlock: ({ value }) => {
        const images =
          (value?.images as Array<{
            asset?: { _ref?: string }
            alt?: string
            caption?: unknown
          }>) ?? []
        if (images.length === 0) return null
        return (
          <div className="max-w-[1100px] mx-auto px-6 md:px-12 my-6 md:my-8">
            <div className="grid grid-cols-3 gap-4 md:gap-7">
              {images.map((img, i) => {
                // Use a higher-res, square-ish crop so the grid feels bigger on the page.
                const imageUrl = img?.asset ? urlFor(img).width(800).height(800).quality(90).url() : null
                if (!imageUrl) return null
                const key = (img as { _key?: string })._key ?? `grid-img-${i}`
                return (
                  <figure key={key} className="group overflow-hidden">
                    <div className="relative aspect-square bg-[#E5E5E5] overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={img.alt ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>
                    {hasCaptionContent(img.caption) && (
                      <figcaption className="mt-1 text-sm text-[#6B6B6B] whitespace-normal wrap-break-word">
                        <SanityCaption value={img.caption} />
                      </figcaption>
                    )}
                  </figure>
                )
              })}
            </div>
          </div>
        )
      },
      adBannerEmbedBlock: ({ value }) => {
        if (!value?.adBanner?.image) return null
        const imageUrl = urlFor(value.adBanner.image).width(1200).url()
        const linkUrl = value.adBanner?.linkUrl
        const content = (
          <div className="relative w-full aspect-3/1 bg-[#E5E5E5] overflow-hidden">
            <Image
              src={imageUrl}
              alt="Advertisement"
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )
        return (
          <figure className="max-w-[900px] mx-auto px-6 md:px-12 my-8">
            {linkUrl ? (
              <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            ) : (
              content
            )}
          </figure>
        )
      },
    },
  }
}

interface ArticleBodyProps {
  value: unknown
}

export function ArticleBody({ value }: ArticleBodyProps) {
  const isFirstParagraph = { current: true }
  if (!value || !Array.isArray(value)) return null
  return (
    <div className="w-full">
      <article className="overflow-x-visible">
        <PortableText value={value} components={createComponents(isFirstParagraph)} />
      </article>
    </div>
  )
}
