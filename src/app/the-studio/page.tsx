import Image from 'next/image'
import Link from 'next/link'

import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { CLIENTS_QUERY } from '@/sanity/lib/queries'

export const revalidate = 3600

type StudioClient = {
  _id: string
  title: string
  slug: string
  category: string
  services?: string[] | null
  coverImage?: { asset?: { _ref: string }; alt?: string } | null
}

export default async function TheStudioPage() {
  const clients = await client.fetch<StudioClient[]>(CLIENTS_QUERY)

  return (
    <main>
      {/* Hero — full-page image with text overlay */}
      <section className="relative min-h-screen">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/dayto.png"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative min-h-screen flex flex-col justify-end px-6 md:px-12 lg:px-16 pb-16 md:pb-24 pt-32">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tight mb-8">
              Neptune Studio
            </h1>
            <div className="space-y-6 text-white/95 text-lg md:text-xl leading-relaxed">
              <p>
                Yes, we work with brands. No, we haven&apos;t sold our soul, we
                checked. Neptune Studio is what happens when art direction and
                interior design stop pretending they&apos;re above commerce and
                start doing something interesting with it instead. We tell the
                story of each brand the way it should be told: with intelligence,
                with taste, and without the usual mediocrity that passes for
                &quot;content&quot; these days.
              </p>
              <p>
                We make things. Events, photographs, films, words. Real ones. The
                kind that don&apos;t disappear the moment you close the tab.
              </p>
              <p>
                We choose our partners carefully, because we&apos;ve learned,
                sometimes the hard way, that ethics isn&apos;t a brand value.
                It&apos;s a filter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clients grid — outside hero, on white background */}
      {clients.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
              {clients.map((c) => {
                const imageUrl = c.coverImage?.asset
                  ? urlFor(c.coverImage).width(600).height(750).url()
                  : null
                const servicesText = c.services?.join(', ') ?? ''
                return (
                  <Link
                    key={c._id}
                    href={`/clients/${c.slug}`}
                    className="group block"
                  >
                    <div className="aspect-4/5 bg-[#E5E5E5] overflow-hidden mb-4">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={c.coverImage?.alt ?? c.title}
                          width={600}
                          height={750}
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#6B6B6B]">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl text-[#1A1A1A] font-bold group-hover:underline">
                      {c.title}
                    </h3>
                    {servicesText && (
                      <p className="mt-2 text-sm text-[#6B6B6B] leading-relaxed">
                        {servicesText}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
