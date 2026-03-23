import Image from 'next/image'

import { urlFor } from '@/sanity/lib/image'

interface AffiliateProductCardProps {
  title: string
  brand: string
  price: string
  image: { asset?: { _ref: string }; alt?: string }
  affiliateUrl: string
}

function formatAffiliatePrice(rawPrice: string): string {
  const normalized = (rawPrice ?? '').trim()
  if (!normalized) return ''

  const symbolToCurrency: Record<string, string> = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
  }

  const symbol = normalized[0]
  const currencyCode = symbolToCurrency[symbol] ?? 'USD'
  const amount = normalized
    .replace(/^[^\d-]+/, '')
    .replace(/[^\d.,-]/g, '')
    .replace(',', '.')

  if (!amount || Number.isNaN(Number.parseFloat(amount))) return normalized
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.parseFloat(amount))
}

export function AffiliateProductCard({
  title,
  brand,
  price,
  image,
  affiliateUrl,
}: AffiliateProductCardProps) {
  // Fetch higher-res images since the market grid displays them larger on desktop.
  const imageUrl = image?.asset ? urlFor(image).width(900).height(1200).url() : null

  if (!affiliateUrl) return null

  return (
    <a
      href={affiliateUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer"
    >
      <div className="aspect-3/4 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={image?.alt ?? title}
            width={900}
            height={1200}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#1A1A1A]">
            No image
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <h3 className="font-serif text-m text-black group-hover:underline line-clamp-2 leading-tight">
          {title}
        </h3>
        <p className="font-header font-semibold text-[13px] text-black leading-tight">{brand}</p>
        <p className="mt-2 font-futura text-xs text-black leading-tight">
          {formatAffiliatePrice(price)}
        </p>
      </div>
    </a>
  )
}
