import { PortableText, type PortableTextComponents } from 'next-sanity'
import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'
import { ImageGridLightbox } from '@/components/editorial/ImageGridLightbox'
import { ClickableSingleImage } from '@/components/editorial/ClickableSingleImage'

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

interface TypographyOptions {
  fontFamilyClass: string
  bodySizeClass: string
  textColor?: string
}

function createComponents(
  isFirstParagraph: { current: boolean },
  typography: TypographyOptions,
): PortableTextComponents {
  const inlineFontClassByValue: Record<string, string> = {
    serif: 'font-serif',
    futura: 'font-futura',
    header: 'font-header',
    sans: 'font-[Helvetica,Arial,sans-serif]',
  }

  const normalizeHexColor = (value: unknown): string | undefined => {
    if (typeof value !== 'string') return undefined
    const trimmed = value.trim()
    return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed) ? trimmed : undefined
  }

  return {
    block: {
      normal: ({ children }) => {
        const isFirst = isFirstParagraph.current
        if (isFirst) isFirstParagraph.current = false
        return (
          <TextWrapper className={isFirst ? 'mt-10 mb-8' : 'mb-4'}>
            <p
              className={`${typography.fontFamilyClass} ${typography.bodySizeClass} leading-[1.85]`}
              style={{ color: typography.textColor ?? '#1A1A1A' }}
            >
              {children}
            </p>
          </TextWrapper>
        )
      },
      h2: ({ children }) => (
        <TextWrapper className="mt-8 mb-3">
          <h2
            className={`${typography.fontFamilyClass} text-3xl md:text-4xl leading-tight`}
            style={{ color: typography.textColor ?? '#1A1A1A' }}
          >
            {children}
          </h2>
        </TextWrapper>
      ),
      h3: ({ children }) => (
        <TextWrapper className="mt-6 mb-2">
          <h3
            className={`${typography.fontFamilyClass} text-2xl md:text-3xl leading-tight`}
            style={{ color: typography.textColor ?? '#1A1A1A' }}
          >
            {children}
          </h3>
        </TextWrapper>
      ),
      blockquote: ({ children }) => (
        <TextWrapper className="my-6">
          <blockquote
            className={`${typography.fontFamilyClass} border-l-2 pl-8 text-2xl md:text-3xl leading-relaxed`}
            style={{
              color: typography.textColor ?? '#1A1A1A',
              borderColor: typography.textColor ?? '#1A1A1A',
            }}
          >
            {children}
          </blockquote>
        </TextWrapper>
      ),
      pullQuote: ({ children }) => (
        <div className="w-full my-8">
          <blockquote
            className={`${typography.fontFamilyClass} text-4xl md:text-5xl text-center leading-snug`}
            style={{ color: typography.textColor ?? '#1A1A1A' }}
          >
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
            style={{ color: typography.textColor ?? '#1A1A1A' }}
          >
            {children}
          </a>
        )
      },
      textStyle: ({ value, children }) => {
        const fontFamilyValue =
          typeof value?.fontFamily === 'string' ? value.fontFamily : undefined
        const fontSizeValue = typeof value?.fontSize === 'number' ? value.fontSize : undefined
        const color = normalizeHexColor(value?.textColor)

        const className = [fontFamilyValue ? inlineFontClassByValue[fontFamilyValue] : '']
          .filter(Boolean)
          .join(' ')

        return (
          <span
            className={className || undefined}
            style={{
              ...(color ? { color } : {}),
              ...(fontSizeValue ? { fontSize: `${fontSizeValue}px` } : {}),
            }}
          >
            {children}
          </span>
        )
      },
    },
    types: {
      pteImageBlock: ({ value }) => {
        if (!value?.image) return null
        const layout = (value.layout as string) ?? 'full'
        const isFloatLayout = layout === 'left' || layout === 'right'

        const imageAsset = value.image as unknown as {
          asset?: {
            metadata?: { dimensions?: { width?: number; height?: number } }
          }
        }
        const blockAny = value as { imageDimensions?: { width?: number; height?: number } }
        const dimensions =
          imageAsset?.asset?.metadata?.dimensions ?? blockAny.imageDimensions
        const aspectRatio =
          dimensions?.width && dimensions?.height
            ? `${dimensions.width} / ${dimensions.height}`
            : null
        const layoutClasses: Record<string, string> = {
          full: 'clear-both mx-auto w-full px-6 md:px-12 my-6 md:my-8',
          wide: 'clear-both mx-auto w-full px-6 md:px-12 my-6 md:my-8',
          center: 'clear-both mx-auto w-full px-6 md:px-12 my-6 md:my-8',
          left: 'float-left ml-4 mr-6 mb-4 w-full shrink-0',
          right: 'float-right mr-4 ml-6 mb-4 w-full shrink-0',
        }
        const layoutMaxWidths: Record<string, string> = {
          full: '100vw',
          wide: '70vw',
          center: '850px',
          left: '30vw',
          right: '30vw',
        }
        const figureClass = layoutClasses[layout] ?? layoutClasses.full
        const figureMaxWidth = layoutMaxWidths[layout] ?? layoutMaxWidths.full
        const imageWidth =
          isFloatLayout
            ? 1400
            : layout === 'center'
              ? 1100
              : layout === 'wide'
                ? 1300
                : 1200
        const defaultHeight = Math.round(imageWidth * 0.75)
        const computedHeight =
          dimensions?.width && dimensions?.height
            ? Math.max(1, Math.round((imageWidth * dimensions.height) / dimensions.width))
            : defaultHeight
        const imageUrl = urlFor(value.image)
          .width(imageWidth)
          .height(computedHeight)
          .quality(90)
          .url()

        // Full-res URL for the modal
        const fullWidth = 2000
        const fullHeight =
          dimensions?.width && dimensions?.height
            ? Math.max(1, Math.round((fullWidth * dimensions.height) / dimensions.width))
            : Math.round(fullWidth * 0.75)
        const fullUrl = urlFor(value.image)
          .width(fullWidth)
          .height(fullHeight)
          .quality(90)
          .url()

        const sizes =
          layout === 'full' || layout === 'wide'
            ? '100vw'
            : layout === 'center'
              ? '(max-width: 768px) 100vw, 768px'
              : '(max-width: 768px) 100vw, 50vw'

        return (
          <figure className={figureClass} style={{ maxWidth: figureMaxWidth }}>
            <div className="w-full">
              <ClickableSingleImage
                src={imageUrl}
                alt={value.alt ?? ''}
                fullSrc={fullUrl}
                sizes={sizes}
                aspectRatio={aspectRatio}
              />
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
            imageDimensions?: { width?: number; height?: number }
            captionSpansGrid?: boolean
          }>) ?? []
        if (images.length === 0) return null
        const gridImages = images
          .map((img, i) => {
            const originalWidth = img.imageDimensions?.width
            const originalHeight = img.imageDimensions?.height

            // Preserve natural aspect ratio — no forced height crop
            const thumbUrl = img?.asset
              ? urlFor(img).width(1000).quality(90).url()
              : null
            if (!thumbUrl) return null

            const fullUrl =
              img?.asset && originalWidth && originalHeight
                ? (() => {
                  const targetWidth = 2000
                  const targetHeight = Math.max(1, Math.round((targetWidth * originalHeight) / originalWidth))
                  return urlFor(img).width(targetWidth).height(targetHeight).quality(90).url()
                })()
                : urlFor(img).width(2000).height(1334).quality(90).url()

            const id = (img as { _key?: string })._key ?? `grid-img-${i}`
            return {
              id,
              thumbUrl,
              fullUrl,
              alt: img.alt || 'Image',
              caption: img.caption,
              captionSpansGrid: img.captionSpansGrid,
              width: originalWidth,
              height: originalHeight,
            }
          })
          .filter((x): x is NonNullable<typeof x> => x !== null)

        return <ImageGridLightbox images={gridImages} />
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
  fontFamilyClass?: string
  bodySizeClass?: string
  textColor?: string
}

export function ArticleBody({
  value,
  fontFamilyClass = 'font-serif',
  bodySizeClass = 'text-[20px] md:text-[22px]',
  textColor,
}: ArticleBodyProps) {
  const isFirstParagraph = { current: true }
  if (!value || !Array.isArray(value)) return null
  return (
    <div className="w-full">
      <article className="overflow-x-visible">
        <PortableText
          value={value}
          components={createComponents(isFirstParagraph, {
            fontFamilyClass,
            bodySizeClass,
            textColor,
          })}
        />
      </article>
    </div>
  )
}
