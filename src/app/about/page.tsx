import Image from 'next/image'
import { PortableText } from 'next-sanity'
import type { TypedObject } from '@portabletext/types'

import { sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'

import { SanityCaption } from '@/components/shared/SanityCaption'

export const revalidate = 3600

type AboutImage = {
  asset?: { _ref?: string } | null
  alt?: string | null
  caption?: unknown
}

export default async function AboutPage() {
  const settings = await sanityFetch<{
    aboutText?: TypedObject[] | null
    aboutImageLeft?: AboutImage | null
    aboutImageRight?: AboutImage | null
  } | null>(SITE_SETTINGS_QUERY)

  const leftImageUrl =
    settings?.aboutImageLeft?.asset != null
      ? urlFor(settings.aboutImageLeft).width(1400).quality(90).format('webp').url()
      : null
  const rightImageUrl =
    settings?.aboutImageRight?.asset != null
      ? urlFor(settings.aboutImageRight).width(1400).quality(90).format('webp').url()
      : null

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-10 md:pb-14">
        <header className="mb-6 md:mb-10 text-center font-futura">
          <h1 className="font-serif font-bold text-3xl md:text-4xl text-[#1A1A1A] uppercase tracking-wide">
            About
          </h1>
        </header>

        {settings?.aboutText?.length ? (
          <section className="max-w-3xl mx-auto mb-10 md:mb-14">
            <div className="font-[Helvetica,Arial,sans-serif] text-[15px] leading-[1.75] text-black text-center space-y-4">
              <PortableText value={settings.aboutText} />
            </div>
          </section>
        ) : null}

        <section className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-start">
            {leftImageUrl ? (
              <figure>
                <div className="relative w-full aspect-4/5 overflow-hidden bg-[#F5F5F5]">
                  <Image
                    src={leftImageUrl}
                    alt={settings?.aboutImageLeft?.alt ?? 'About image'}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <figcaption className="mt-2 text-xs italic text-black text-center leading-snug">
                  <SanityCaption value={settings?.aboutImageLeft?.caption} />
                </figcaption>
              </figure>
            ) : null}

            {rightImageUrl ? (
              <figure>
                <div className="relative w-full aspect-4/5 overflow-hidden bg-[#F5F5F5]">
                  <Image
                    src={rightImageUrl}
                    alt={settings?.aboutImageRight?.alt ?? 'About image'}
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <figcaption className="mt-2 text-xs italic text-black text-center leading-snug">
                  <SanityCaption value={settings?.aboutImageRight?.caption} />
                </figcaption>
              </figure>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  )
}
