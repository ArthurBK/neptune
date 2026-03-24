'use client'

import Image from 'next/image'

import { useOpenNewsletterModal } from '@/contexts/NewsletterModalContext'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80'

interface NewsletterPageContentProps {
  headline?: string | null
  subtitle?: string | null
  imageUrl: string | null
  imageLegend?: unknown | null
}

export function NewsletterPageContent({
  headline,
  subtitle,
  imageUrl,
  imageLegend,
}: NewsletterPageContentProps) {
  const openModal = useOpenNewsletterModal()
  const introText =
    subtitle ??
    'Sign up to the Neptune newsletters for an exclusive access to great interiors and great conversations.'

  return (
    <main className="flex flex-col">
      {/* Title and text above the image */}
      <div className="flex flex-col items-center px-6 md:px-12 pt-5 md:pt-6 pb-6 md:pb-8 text-center">
        <h1 className="font-serif font-bold text-2xl md:text-3xl text-[#1A1A1A] uppercase tracking-wide">
          {headline ?? 'Newsletter'}
        </h1>
        <div className="mt-4 w-full overflow-x-auto flex justify-center">
          <p className="text-base text-[#6B6B6B] whitespace-nowrap">
            {introText}
          </p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="mt-8 cursor-pointer bg-transparent font-futura text-base tracking-[0.2em] uppercase text-black transition-colors hover:underline"
        >
          Subscribe
        </button>
      </div>

      {/* Image from Sanity (below the text) */}
      {(imageUrl ?? DEFAULT_IMAGE) && (
        <>
          <div className="relative w-full aspect-16/10 md:aspect-21/9 max-h-[60vh]">
            <Image
              src={imageUrl ?? DEFAULT_IMAGE}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          {hasCaptionContent(imageLegend) && (
            <p className="px-6 md:px-12 pt-1.5 pb-6 text-center text-xs italic text-black">
              <SanityCaption value={imageLegend} />
            </p>
          )}
        </>
      )}
    </main>
  )
}
