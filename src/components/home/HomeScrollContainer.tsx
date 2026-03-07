'use client'

import { useEffect, useRef } from 'react'

import { StickyHeroStack } from './StickyHeroStack'
import { NewsletterSection } from './NewsletterSection'

import type { CarouselArticle, FeaturedProduct } from './StickyHeroStack'

interface HomeScrollContainerProps {
  articles: CarouselArticle[]
  featuredProduct?: FeaturedProduct | null
}

/**
 * Dedicated scroll container for homepage. Avoids document scroll restoration
 * and snap conflicts. Always starts at top on load.
 */
export function HomeScrollContainer({
  articles,
  featuredProduct,
}: HomeScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Force scroll to top on mount - prevents browser scroll restoration
    scrollRef.current?.scrollTo(0, 0)
  }, [])

  return (
    <div
      ref={scrollRef}
      className="fixed inset-x-0 top-[var(--header-height)] bottom-0 overflow-y-auto snap-y snap-mandatory overscroll-contain scroll-smooth"
    >
      <StickyHeroStack articles={articles} featuredProduct={featuredProduct} />
      <NewsletterSection />
    </div>
  )
}
