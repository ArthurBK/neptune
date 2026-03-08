'use client'

import { useCallback, useEffect, useRef } from 'react'

import { StickyHeroStack } from './StickyHeroStack'

import type { HomeSection } from './StickyHeroStack'

interface HomeScrollContainerProps {
  sections: HomeSection[]
}

/**
 * Dedicated scroll container for homepage. Avoids document scroll restoration.
 * Uses CSS scroll-snap only — no JS snap to avoid conflicts and stuck scroll.
 */
export function HomeScrollContainer({ sections }: HomeScrollContainerProps) {
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
      className="fixed inset-x-0 top-[var(--header-height)] bottom-0 overflow-y-auto snap-y snap-proximity overscroll-contain"
    >
      <StickyHeroStack sections={sections} />
    </div>
  )
}
