import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

interface AffiliateProductCardProps {
  title: string
  brand: string
  price: string
  image: { asset?: { _ref: string }; alt?: string }
  affiliateUrl: string
}

export function AffiliateProductCard({
  title,
  brand,
  price,
  image,
  affiliateUrl,
}: AffiliateProductCardProps) {
  const imageUrl = image?.asset ? urlFor(image).width(600).height(750).url() : null

  if (!affiliateUrl) return null

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer"
    >
      <div className="aspect-3/4 bg-[#E5E5E5] overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.alt ?? title}
            width={600}
            height={800}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
            No image
          </div>
        )}
      </div>
      <div className="mt-2">
        <h3 className="font-serif text-m text-black group-hover:underline line-clamp-2 leading-tight">
          {title}
        </h3>
        <p className="font-header font-semibold text-[13px] text-black leading-tight">{brand}</p>
        <p className="font-header text-[14px] text-black leading-tight">
          {`$${(price ?? '').replace(/^[€$£]\s?/, '')}`}
        </p>
      </div>
    </a>
  )
}
