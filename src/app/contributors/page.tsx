import Link from 'next/link'

import { sanityFetch } from '@/sanity/lib/client'
import {
  CONTRIBUTORS_PAGE_QUERY,
  CONTRIBUTORS_LIST_PAGE_QUERY,
  PHOTOGRAPHERS_LIST_PAGE_QUERY,
} from '@/sanity/lib/queries'

import { NewsstandCta } from '@/components/shared/NewsstandCta'
import {
  PageIntroText,
  hasPortableTextContent,
  portableTextToPlainText,
  type PageIntroPortableText,
} from '@/components/shared/PageIntroText'

export const revalidate = 3600

type ListPerson = {
  _id: string
  name: string
  slug: string
  bio?: string | null
  bioRichText?: PageIntroPortableText | null
  articleCount: number
}

type ContributorsPageData = {
  description?: PageIntroPortableText | null
}

export default async function ContributorsPage() {
  const [contributors, photographers, contributorsPage] = await Promise.all([
    sanityFetch<ListPerson[]>(CONTRIBUTORS_LIST_PAGE_QUERY) ?? [],
    sanityFetch<ListPerson[]>(PHOTOGRAPHERS_LIST_PAGE_QUERY) ?? [],
    sanityFetch<ContributorsPageData | null>(CONTRIBUTORS_PAGE_QUERY),
  ])

  const entries = [
    ...contributors.map((c) => ({
      ...c,
      bioText: hasPortableTextContent(c.bioRichText)
        ? portableTextToPlainText(c.bioRichText)
        : c.bio?.trim() ?? '',
      href: `/contributors/${c.slug}` as const,
    })),
    ...photographers.map((p) => ({
      ...p,
      bioText: p.bio?.trim() ?? '',
      href: `/contributors/photographer/${p.slug}` as const,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  const description = hasPortableTextContent(contributorsPage?.description)
    ? contributorsPage.description
    : null

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-6 md:pb-10">
        {description && (
          <section className="mb-6 text-center font-futura md:mb-12">
            <PageIntroText value={description} />
          </section>
        )}

        {entries.length > 0 ? (
          <section className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-14">
              {entries.map((person) => (
                <div key={`${person.href}-${person._id}`} className="text-left">
                  <p className="font-serif text-[15px] font-normal leading-[1.65] text-black md:text-base">
                    {person.articleCount > 0 ? (
                      <Link
                        href={person.href}
                        className="font-serif text-xl font-bold tracking-[0.06em] text-black hover:underline underline-offset-2"
                      >
                        {person.name}
                      </Link>
                    ) : (
                      <span className="font-serif text-xl font-bold tracking-[0.06em] text-black">
                        {person.name}
                      </span>
                    )}
                    {person.bioText ? (
                      <>
                        {' '}
                        {person.bioText}
                      </>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-[#6B6B6B]">No contributors yet.</p>
        )}

        <div className="my-10 md:my-14">
          <NewsstandCta />
        </div>
      </div>
    </main>
  )
}
