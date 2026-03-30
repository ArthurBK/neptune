import Link from 'next/link'

import { sanityFetch } from '@/sanity/lib/client'
import {
  CONTRIBUTORS_LIST_PAGE_QUERY,
  PHOTOGRAPHERS_LIST_PAGE_QUERY,
} from '@/sanity/lib/queries'

import { NewsstandCta } from '@/components/shared/NewsstandCta'

export const revalidate = 3600

type ListPerson = {
  _id: string
  name: string
  slug: string
  bio: string
}

export default async function ContributorsPage() {
  const [contributors, photographers] = await Promise.all([
    sanityFetch<ListPerson[]>(CONTRIBUTORS_LIST_PAGE_QUERY) ?? [],
    sanityFetch<ListPerson[]>(PHOTOGRAPHERS_LIST_PAGE_QUERY) ?? [],
  ])

  const entries = [
    ...contributors.map((c) => ({
      ...c,
      href: `/contributors/${c.slug}` as const,
    })),
    ...photographers.map((p) => ({
      ...p,
      href: `/contributors/photographer/${p.slug}` as const,
    })),
  ].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

  return (
    <main>
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 md:pt-8 pb-6 md:pb-10">
        <div className="mx-auto mb-6 md:mb-8 h-px w-1/3 max-w-md bg-(--neptune-logo-red)" />

        <header className="mb-6 md:mb-12 text-center font-futura">
          <h1 className="font-futura font-normal text-xl md:text-2xl text-[#1A1A1A] uppercase tracking-wide">
            Contributors
          </h1>
          <p
            className="mt-2 text-sm md:text-[16px] text-black max-w-2xl mx-auto whitespace-pre-line"
            style={{ fontFamily: "var(--font-gill-sans)", fontWeight: 300 }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </header>

        {entries.length > 0 ? (
          <section className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-14">
              {entries.map((person) => (
                <div key={`${person.href}-${person._id}`} className="text-left">
                  <p className="font-serif text-[15px] font-normal leading-[1.65] text-black md:text-base">
                    <Link
                      href={person.href}
                      className="font-serif text-xl font-bold tracking-[0.06em] text-black hover:underline underline-offset-2"
                    >
                      {person.name}
                    </Link>
                    {person.bio ? (
                      <>
                        {' '}
                        {person.bio.trim()}
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
