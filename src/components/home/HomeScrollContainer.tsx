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
  const lastScrollTop = useRef(0)
  const snapTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // Force scroll to top on mount - prevents browser scroll restoration
    scrollRef.current?.scrollTo(0, 0)
  }, [])

  // Snap to nearest section when scroll ends (fixes: middle stops + scroll-up freeze)
  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return
    const { scrollTop } = container
    const sectionHeight = container.clientHeight
    const wasScrollingUp = scrollTop < lastScrollTop.current
    lastScrollTop.current = scrollTop

    // Clear any pending snap
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current)
      snapTimeoutRef.current = undefined
    }

    // When scrolling up in upper portion of first section, snap to top immediately
    if (wasScrollingUp && scrollTop > 0 && scrollTop < sectionHeight * 0.7) {
      container.scrollTo({ top: 0, behavior: 'auto' })
      return
    }

    // When scroll ends, snap to nearest section if we're stuck in the middle
    snapTimeoutRef.current = setTimeout(() => {
      snapTimeoutRef.current = undefined
      const c = scrollRef.current
      if (!c) return
      const { scrollTop: st } = c
      const sh = c.clientHeight
      const nearestIndex = Math.round(st / sh)
      const targetTop = Math.min(nearestIndex * sh, c.scrollHeight - sh)
      if (Math.abs(st - targetTop) > 2) {
        c.scrollTo({ top: targetTop, behavior: 'smooth' })
      }
    }, 100)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current)
    }
  }, [handleScroll])

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

    const sectionHeight = container.clientHeight
    const { scrollTop } = container
    const currentIndex = Math.round(scrollTop / sectionHeight)

    if (e.key === 'ArrowDown' && currentIndex < Math.ceil(container.scrollHeight / sectionHeight) - 1) {
      e.preventDefault()
      container.scrollTo({ top: (currentIndex + 1) * sectionHeight, behavior: 'smooth' })
    } else if (e.key === 'ArrowUp' && currentIndex > 0) {
      e.preventDefault()
      container.scrollTo({ top: (currentIndex - 1) * sectionHeight, behavior: 'smooth' })
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      ref={scrollRef}
      className="fixed inset-x-0 top-[var(--header-height)] bottom-0 overflow-y-auto snap-y snap-mandatory overscroll-contain"
    >
      <StickyHeroStack articles={articles} featuredProduct={featuredProduct} />
      <NewsletterSection />
    </div>
  )
}
