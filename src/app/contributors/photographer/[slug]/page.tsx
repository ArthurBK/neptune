import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client, sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  ARTICLES_BY_PHOTOGRAPHER_QUERY,
  PHOTOGRAPHER_BY_SLUG_QUERY,
  PHOTOGRAPHER_SLUGS_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleGrid } from '@/components/editorial/ArticleGrid'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(PHOTOGRAPHER_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

type PhotographerData = {
  _id: string
  name: string
  slug: string
  bio: string
  portrait?: { asset?: { _ref: string }; alt?: string } | null
  location?: string | null
}

type ArticleCardData = {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  author?: { name: string; slug: string } | null
}

export default async function PhotographerProfilePage({ params }: PageProps) {
  const { slug } = await params

  const [photographer, articlesRaw, adBanner] = await Promise.all([
    sanityFetch<PhotographerData | null>(PHOTOGRAPHER_BY_SLUG_QUERY, { slug }),
    sanityFetch<ArticleCardData[] | null>(ARTICLES_BY_PHOTOGRAPHER_QUERY, {
      photographerSlug: slug,
    }),
    sanityFetch<{ image: { asset?: { _ref: string } }; linkUrl?: string | null; title?: string | null } | null>(
      AD_BANNER_BY_PLACEMENT_QUERY,
      { placement: 'category-top' }
    ),
  ])
  const articles = articlesRaw ?? []

  if (!photographer) notFound()

  const portraitUrl = photographer.portrait?.asset
    ? urlFor(photographer.portrait).width(600).height(800).url()
    : null

  return (
    <main>
      <div className="mx-auto max-w-screen-xl px-6 py-16 md:px-12 md:py-24 lg:px-16">
        <header className="mb-16 flex flex-col items-start gap-12 md:flex-row md:items-center md:gap-16">
          {portraitUrl && (
            <div className="aspect-[3/4] w-full max-w-md shrink-0 overflow-hidden bg-[#E5E5E5] md:w-[45%]">
              <Image
                src={portraitUrl}
                alt={photographer.portrait?.alt ?? photographer.name}
                width={600}
                height={800}
                sizes="(max-width: 768px) 100vw, 45vw"
                className="h-full w-full object-cover"
                priority
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm uppercase tracking-[0.2em] text-[#6B6B6B]">Photographer</p>
            <h1 className="font-serif text-5xl leading-tight text-[#1A1A1A] md:text-6xl">
              {photographer.name}
            </h1>
            {photographer.location && (
              <p className="mt-2 text-base text-[#6B6B6B]">{photographer.location}</p>
            )}
            <p className="mt-6 whitespace-pre-line leading-relaxed text-[#1A1A1A]">
              {photographer.bio}
            </p>
          </div>
        </header>

        {adBanner?.image && (
          <div className="mb-12 md:mb-16">
            <AdBanner
              image={adBanner.image}
              linkUrl={adBanner.linkUrl}
              title={adBanner.title}
            />
          </div>
        )}

        <section>
          <h2 className="mb-8 font-serif text-3xl text-[#1A1A1A] md:text-4xl">
            Photography by {photographer.name}
          </h2>
          {articles.length > 0 ? (
            <ArticleGrid articles={articles} />
          ) : (
            <p className="py-12 text-[#6B6B6B]">No articles yet.</p>
          )}
        </section>

        <div className="mt-16 border-t border-[#E5E5E5] pt-16 text-center">
          <Link
            href="/contributors"
            className="text-sm uppercase tracking-[0.2em] text-[#6B6B6B] transition-colors hover:text-black"
          >
            ← All contributors
          </Link>
        </div>
      </div>
    </main>
  )
}
