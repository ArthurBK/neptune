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
    <main className="pb-20 md:pb-28">
      <div className="mx-auto max-w-[1400px] px-6 md:px-12 lg:px-16 pt-10 md:pt-14">
        <header className="mb-14 md:mb-20 text-center">
          <h1 className="font-serif text-4xl font-bold uppercase tracking-[0.12em] text-[color:var(--neptune-red)] md:text-5xl lg:text-6xl">
            Contributors
          </h1>
          <p className="mx-auto mt-8 max-w-3xl font-header text-base font-normal leading-relaxed text-black md:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </header>

        {entries.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-12 lg:gap-y-14">
            {entries.map((person) => (
              <div key={`${person.href}-${person._id}`} className="text-left">
                <p className="font-header text-[15px] font-normal leading-[1.65] text-black md:text-base">
                  <Link
                    href={person.href}
                    className="font-serif font-bold uppercase tracking-[0.06em] text-[color:var(--neptune-red)] hover:underline underline-offset-2"
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
        ) : (
          <p className="text-center text-[#6B6B6B]">No contributors yet.</p>
        )}
      </div>

      <div className="mt-20 md:mt-28">
        <NewsstandCta />
      </div>
    </main>
  )
}
