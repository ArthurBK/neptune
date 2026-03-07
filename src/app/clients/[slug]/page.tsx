import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import {
  AD_BANNER_BY_PLACEMENT_QUERY,
  CLIENT_BY_SLUG_QUERY,
  CLIENT_SLUGS_QUERY,
} from '@/sanity/lib/queries'

import { AdBanner } from '@/components/shared/AdBanner'
import { ArticleBody } from '@/components/editorial/ArticleBody'
import { ClientCard } from '@/components/editorial/ClientCard'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(CLIENT_SLUGS_QUERY)
  return slugs.map((s) => ({ slug: s.slug }))
}

interface ClientPageProps {
  params: Promise<{ slug: string }>
}

export default async function ClientPage({ params }: ClientPageProps) {
  const { slug } = await params

  const [clientData, adTop, adMid, adBottom] = await Promise.all([
    client.fetch<ClientData | null>(CLIENT_BY_SLUG_QUERY, { slug }),
    client.fetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-top',
    }),
    client.fetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-mid',
    }),
    client.fetch<AdData | null>(AD_BANNER_BY_PLACEMENT_QUERY, {
      placement: 'article-bottom',
    }),
  ])

  if (!clientData) notFound()

  const coverImageUrl = clientData.coverImage?.asset
    ? urlFor(clientData.coverImage).width(1400).height(933).url()
    : null

  const relatedClients = (clientData.relatedClients ?? []) as ClientCardData[]

  return (
    <main>
      <article>
        {coverImageUrl && (
          <div className="relative w-full aspect-[4/5] md:aspect-[3/2] lg:aspect-[16/9] bg-[#0a0a0a]">
            <Image
              src={coverImageUrl}
              alt={clientData.coverImage?.alt ?? clientData.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 md:pb-16 px-6 md:px-12 text-center">
              {clientData.subcategory && (
                <p className="text-xs tracking-[0.25em] uppercase text-white/80 mb-3">
                  {clientData.subcategory}
                </p>
              )}
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white leading-tight tracking-tight max-w-3xl">
                {clientData.title}
              </h1>
            </div>
          </div>
        )}

        {adTop?.image && (
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16">
            <AdBanner image={adTop.image} linkUrl={adTop.linkUrl} title={adTop.title} />
          </div>
        )}

        <div className="pt-2 pb-8">
          <ArticleBody value={clientData.body} />
        </div>

        {adMid?.image && (
          <div className="mt-16 max-w-[1400px] mx-auto px-6 md:px-12">
            <AdBanner image={adMid.image} linkUrl={adMid.linkUrl} title={adMid.title} />
          </div>
        )}

        {adBottom?.image && (
          <div className="mt-16 max-w-[1400px] mx-auto px-6 md:px-12">
            <AdBanner image={adBottom.image} linkUrl={adBottom.linkUrl} title={adBottom.title} />
          </div>
        )}

        <div className="mt-20 max-w-[580px] mx-auto px-6 md:px-12 text-center">
          <Link
            href="/"
            className="text-xs tracking-[0.25em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
          >
            ← ← Back to home
          </Link>
        </div>

        {relatedClients.length > 0 && (
          <div className="mt-24 pt-20 border-t border-[#E5E5E5]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <h2 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-12">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
                {relatedClients.map((c) => (
                  <ClientCard
                    key={c._id}
                    title={c.title}
                    slug={c.slug}
                    category={c.category}
                    subcategory={c.subcategory}
                    coverImage={c.coverImage}
                    excerpt={c.excerpt}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}

type ClientData = {
  title: string
  slug: { current: string }
  subcategory?: string | null
  coverImage?: { asset?: { _ref: string }; alt?: string }
  body: unknown
  relatedClients?: unknown[]
}

type AdData = {
  image: { asset?: { _ref: string } }
  linkUrl?: string | null
  title?: string | null
}

type ClientCardData = {
  _id: string
  title: string
  slug: string
  category: string
  subcategory?: string | null
  coverImage: { asset?: { _ref: string }; alt?: string }
  excerpt?: string | null
}
