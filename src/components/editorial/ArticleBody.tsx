import { PortableText, type PortableTextComponents } from 'next-sanity'
import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

type GalleryImage = { asset?: { _ref?: string }; alt?: string; caption?: string }

/** Merge gallery: text → 3 images row → text → full-width hero → repeat */
function mergeBodyWithGallery(
  body: unknown[],
  gallery: GalleryImage[]
): unknown[] {
  if (!gallery?.length) return body
  const result: unknown[] = []
  let galleryIndex = 0
  let blocksSinceLastInsert = 0
  let nextInsert: 'row3' | 'hero' = 'row3'

  for (const block of body) {
    result.push(block)
    const b = block as { _type?: string }
    const isTextBlock = b?._type === 'block'
    if (isTextBlock) {
      blocksSinceLastInsert++
      if (blocksSinceLastInsert >= 2 && galleryIndex < gallery.length) {
        if (nextInsert === 'row3' && galleryIndex + 3 <= gallery.length) {
          result.push({
            _type: 'galleryRow3Block',
            _key: `gallery-row-${galleryIndex}`,
            images: gallery.slice(galleryIndex, galleryIndex + 3),
          })
          galleryIndex += 3
        } else {
          result.push({
            _type: 'galleryHeroBlock',
            _key: `gallery-hero-${galleryIndex}`,
            image: gallery[galleryIndex],
          })
          galleryIndex += 1
        }
        blocksSinceLastInsert = 0
        nextInsert = nextInsert === 'row3' ? 'hero' : 'row3'
      }
    } else {
      blocksSinceLastInsert = 0
    }
  }

  return result
}

const TextWrapper = ({
  children,
  className = '',
  wide = false,
}: {
  children: React.ReactNode
  className?: string
  wide?: boolean
}) => (
  <div
    className={`mx-auto px-4 md:px-8 ${wide ? 'max-w-[900px]' : 'max-w-[720px]'} ${className}`}
  >
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
        <TextWrapper wide={isFirst} className={isFirst ? 'mt-10 mb-8' : 'mb-4'}>
          <p
            className={
              isFirst
                ? 'text-[#1A1A1A] leading-[1.75] text-[24px] md:text-[28px] font-bold'
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
      <div className="max-w-[720px] mx-auto px-4 md:px-8 my-8">
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
      const imageUrl = urlFor(value.image).width(1400).height(1050).quality(90).url()
      return (
        <figure className="my-6 md:my-8">
          <div className="w-full px-0 md:px-4">
            <div className="relative aspect-[4/3] md:aspect-[16/10] bg-[#E5E5E5] overflow-hidden">
              <Image
                src={imageUrl}
                alt={value.alt ?? ''}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-[#6B6B6B] max-w-[720px] mx-auto px-4 md:px-8">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    galleryRow3Block: ({ value }) => {
      const images = (value?.images as GalleryImage[]) ?? []
      if (images.length === 0) return null
      return (
        <div className="my-6 md:my-8 max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {images.map((img, i) => {
              const imageUrl = img?.asset ? urlFor(img).width(600).height(450).quality(90).url() : null
              if (!imageUrl) return null
              return (
                <figure key={`${(value as { _key?: string })?._key}-${i}`} className="group overflow-hidden">
                  <div className="relative aspect-[4/3] bg-[#E5E5E5] overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={img.alt ?? ''}
                      fill
                      sizes="(max-width: 768px) 33vw, 400px"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                  {img.caption && (
                    <figcaption className="mt-1 text-sm text-[#6B6B6B] line-clamp-2">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              )
            })}
          </div>
        </div>
      )
    },
    galleryHeroBlock: ({ value }) => {
      const img = value?.image as GalleryImage | undefined
      if (!img?.asset) return null
      const imageUrl = urlFor(img).width(1400).height(900).quality(90).url()
      return (
        <figure className="my-6 md:my-8">
          <div className="w-full px-0">
            <div className="relative aspect-[4/3] md:aspect-[16/9] bg-[#E5E5E5] overflow-hidden">
              <Image
                src={imageUrl}
                alt={img.alt ?? ''}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          </div>
          {img.caption && (
            <figcaption className="mt-2 text-sm text-[#6B6B6B] max-w-[720px] mx-auto px-4 md:px-8">
              {img.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    adBannerEmbedBlock: ({ value }) => {
      if (!value?.adBanner?.image) return null
      const imageUrl = urlFor(value.adBanner.image).width(1200).url()
      const linkUrl = value.adBanner?.linkUrl
      const content = (
        <div className="relative w-full aspect-[3/1] bg-[#E5E5E5] overflow-hidden">
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
        <figure className="my-8">
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
  gallery?: GalleryImage[]
}

export function ArticleBody({ value, gallery }: ArticleBodyProps) {
  const isFirstParagraph = { current: true }
  if (!value || !Array.isArray(value)) return null
  const content = gallery?.length ? mergeBodyWithGallery(value, gallery) : value
  return (
    <div className="w-full">
      <article className="overflow-hidden">
        <PortableText value={content} components={createComponents(isFirstParagraph)} />
      </article>
    </div>
  )
}
