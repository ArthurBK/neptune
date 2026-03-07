import { client } from '@/sanity/lib/client'
import { FEATURED_ARTICLES_HOME_QUERY } from '@/sanity/lib/queries'

import { HeroCarousel } from '@/components/home/HeroCarousel'

export const revalidate = 3600

export default async function Home() {
  const articles = await client.fetch<
    Array<{
      _id: string
      title: string
      slug: string
      category: string
      coverImage: { asset?: { _ref: string }; alt?: string }
      author?: { name: string } | null
    }>
  >(FEATURED_ARTICLES_HOME_QUERY)

  return (
    <div className="min-h-screen">
      <HeroCarousel articles={articles} />
    </div>
  )
}
