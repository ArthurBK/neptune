import { PortableText, type PortableTextComponents } from 'next-sanity'
import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

const TextWrapper = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={`w-full px-4 md:px-8 ${className}`}>
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
      <div className="w-full px-4 md:px-8 my-8">
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
      const layoutClasses: Record<string, string> = {
        full: 'w-full px-4 md:px-8 my-6 md:my-8',
        wide: 'w-full -mx-4 md:-mx-8 my-6 md:my-8',
        left: 'float-left mr-6 mb-4 w-full md:w-[45%]',
        right: 'float-right clear-left ml-6 mb-4 w-full md:w-[45%]',
      }
      const figureClass = layoutClasses[layout] ?? layoutClasses.full
      const imageUrl = urlFor(value.image).width(1400).height(1050).quality(90).url()
      return (
        <figure className={figureClass}>
          <div className="w-full">
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
            <figcaption className="mt-2 text-sm text-[#6B6B6B] px-4 md:px-8">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
    pteImageGridBlock: ({ value }) => {
      const images = (value?.images as Array<{ asset?: { _ref?: string }; alt?: string; caption?: string }>) ?? []
      if (images.length === 0) return null
      return (
        <div className="px-4 md:px-8 my-6 md:my-8">
          <div className="grid grid-cols-3 gap-3 md:gap-6">
            {images.map((img, i) => {
              const imageUrl = img?.asset ? urlFor(img).width(600).height(450).quality(90).url() : null
              if (!imageUrl) return null
              const key = (img as { _key?: string })._key ?? `grid-img-${i}`
              return (
                <figure key={key} className="group overflow-hidden">
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
        <figure className="px-4 md:px-8 my-8">
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
