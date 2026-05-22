'use client'

import Image from 'next/image'

import { useOpenNewsletterModal } from '@/contexts/NewsletterModalContext'
import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'
import {
  PageIntroText,
  hasPortableTextContent,
  type PageIntroPortableText,
} from '@/components/shared/PageIntroText'

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80'

interface NewsletterPageContentProps {
  subtitle?: string | null
  descriptionRichText?: PageIntroPortableText | null
  imageUrl: string | null
  imageLegend?: unknown | null
}

export function NewsletterPageContent({
  subtitle,
  descriptionRichText,
  imageUrl,
  imageLegend,
}: NewsletterPageContentProps) {
  const openModal = useOpenNewsletterModal()
  const richDescription = hasPortableTextContent(descriptionRichText) ? descriptionRichText : null
  const introText =
    subtitle ??
    'Sign up to the Neptune newsletters for an exclusive access to great interiors and great conversations.'

  return (
    <main className="flex flex-col">
      <div className="flex flex-col items-center px-6 md:px-12 pt-5 md:pt-6 pb-6 md:pb-8 text-center">
        {richDescription ? (
          <PageIntroText value={richDescription} />
        ) : (
          <p
            className="max-w-prose text-base text-black md:text-[16px]"
            style={{ fontFamily: 'var(--font-gill-sans)' }}
          >
            {introText}
          </p>
        )}
        <button
          type="button"
          onClick={openModal}
          className="mt-8 w-fit mx-auto cursor-pointer bg-black text-white font-futura text-sm md:text-base tracking-[0.18em] uppercase px-5 py-2.5 transition-colors hover:bg-[#1f1f1f]"
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
