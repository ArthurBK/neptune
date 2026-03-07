import { PortableText, type PortableTextComponents } from 'next-sanity'
import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-4 text-[#1A1A1A] leading-relaxed">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] mt-12 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="font-serif text-xl md:text-2xl text-[#1A1A1A] mt-8 mb-3">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[#E5E5E5] pl-6 my-8 italic text-[#6B6B6B]">
        {children}
      </blockquote>
    ),
    pullQuote: ({ children }) => (
      <blockquote className="font-serif text-2xl md:text-4xl text-center my-12 py-8 text-[#1A1A1A]">
        {children}
      </blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
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
      const imageUrl = urlFor(value.image).width(800).url()
      return (
        <figure className="my-8">
          <div className="relative aspect-[4/3] bg-[#E5E5E5] overflow-hidden">
            <Image
              src={imageUrl}
              alt={value.alt ?? ''}
              fill
              sizes="(max-width: 720px) 100vw, 720px"
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="mt-2 text-sm text-[#6B6B6B] italic text-center">
              {value.caption}
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
        <figure className="my-12">
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

interface ArticleBodyProps {
  value: unknown
}

export function ArticleBody({ value }: ArticleBodyProps) {
  if (!value || !Array.isArray(value)) return null
  return (
    <div className="max-w-[720px] mx-auto">
      <PortableText value={value} components={components} />
    </div>
  )
}
