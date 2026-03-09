'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { StickyHeroStack } from './StickyHeroStack'

import type { HomeSection } from './StickyHeroStack'

const WHEEL_THRESHOLD = 20
const SCROLL_COOLDOWN_MS = 500

interface HomeScrollContainerProps {
  sections: HomeSection[]
  /** Navbar rendered inside the first 100vh block (homepage only) */
  navbar?: ReactNode
  children?: React.ReactNode
}

/**
 * Homepage scroll: JS only. One section per wheel or arrow key. No free scroll.
 */
export function HomeScrollContainer({ sections, navbar, children }: HomeScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cooldownUntilRef = useRef(0)
  const goToSectionRef = useRef<(index: number) => void>(() => {})

  const hasNavbar = !!navbar
  const goToSection = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const sectionHeight = el.clientHeight
    if (sectionHeight <= 0) return
    const maxIndex = Math.max(0, Math.ceil(el.scrollHeight / sectionHeight) - 1)
    const targetIndex = Math.max(0, Math.min(index, maxIndex))
    el.scrollTo({ top: targetIndex * sectionHeight, behavior: 'smooth' })
    cooldownUntilRef.current = Date.now() + SCROLL_COOLDOWN_MS
  }, [])

  useEffect(() => {
    goToSectionRef.current = goToSection
  }, [goToSection])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
  }, [])

  // Native wheel listener with { passive: false } so we can preventDefault and block all native scroll
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      const sectionHeight = el.clientHeight
      if (sectionHeight <= 0) return
      if (Date.now() < cooldownUntilRef.current) return

      const currentIndex = Math.round(el.scrollTop / sectionHeight)
      const sectionCount = Math.ceil(el.scrollHeight / sectionHeight)

      if (e.deltaY > WHEEL_THRESHOLD && currentIndex < sectionCount - 1) {
        goToSectionRef.current(currentIndex + 1)
      } else if (e.deltaY < -WHEEL_THRESHOLD && currentIndex > 0) {
        goToSectionRef.current(currentIndex - 1)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }
      const el = scrollRef.current
      if (!el || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return

      const sectionHeight = el.clientHeight
      if (sectionHeight <= 0) return

      const currentIndex = Math.round(el.scrollTop / sectionHeight)
      const sectionCount = Math.ceil(el.scrollHeight / sectionHeight)

      if (e.key === 'ArrowDown' && currentIndex < sectionCount - 1) {
        e.preventDefault()
        goToSection(currentIndex + 1)
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault()
        goToSection(currentIndex - 1)
      }
    },
    [goToSection]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div
      ref={scrollRef}
      className={
        hasNavbar
          ? 'fixed left-0 right-0 top-0 z-10 h-screen overflow-x-hidden overflow-y-auto overscroll-contain w-full min-w-0'
          : 'fixed left-0 right-0 top-[var(--header-height)] z-10 h-[calc(100vh-var(--header-height))] overflow-x-hidden overflow-y-auto overscroll-contain w-full min-w-0'
      }
    >
      <StickyHeroStack sections={sections} headerSlot={navbar} />
      {children}
    </div>
  )
}
