'use client'

import { useCallback, useEffect, useRef } from 'react'

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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't capture when user is typing in an input
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    const container = scrollRef.current
    if (!container || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return

    const sections = container.querySelectorAll<HTMLElement>('section')
    if (sections.length === 0) return

    const { scrollTop } = container
    const sectionHeight = container.clientHeight
    const currentIndex = Math.round(scrollTop / sectionHeight)

    if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
      e.preventDefault()
      sections[currentIndex + 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault()
      sections[currentIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

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
