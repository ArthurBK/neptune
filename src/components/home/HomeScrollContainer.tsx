'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { useSetHeaderVariant } from '@/contexts/HeaderVariantContext'

import { StickyHeroStack } from './StickyHeroStack'

import type { HomeSection } from './StickyHeroStack'

const WHEEL_THRESHOLD = 20
const TOUCH_SWIPE_THRESHOLD_PX = 50

function useSectionHeight(scrollRef: React.RefObject<HTMLDivElement | null>) {
  const [sectionHeight, setSectionHeight] = useState(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      const h = el.clientHeight
      if (h > 0) setSectionHeight(h)
    }

    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [scrollRef])

  return sectionHeight
}

interface HomeScrollContainerProps {
  sections: HomeSection[]
  children?: React.ReactNode
}

/** Only video sections use white header text. */
function isSectionDark(section: HomeSection | undefined): boolean {
  if (!section) return false
  return section.type === 'video'
}

export function HomeScrollContainer({ sections, children }: HomeScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const currentIndexRef = useRef(0)
  const isScrollingRef = useRef(false)
  const touchStartYRef = useRef<number | null>(null)
  const setHeaderVariant = useSetHeaderVariant()
  const totalSections = sections.length + 1
  const sectionHeightPx = useSectionHeight(scrollRef)

  const goToSection = useCallback((index: number) => {
    const el = scrollRef.current
    if (!el) return
    const sectionHeight = el.clientHeight
    if (sectionHeight <= 0) return
    const maxIndex = Math.max(0, Math.ceil(el.scrollHeight / sectionHeight) - 1)
    const targetIndex = Math.max(0, Math.min(index, maxIndex))

    if (targetIndex === currentIndexRef.current && !isScrollingRef.current) return

    currentIndexRef.current = targetIndex
    const targetSection = sections[targetIndex]
    setHeaderVariant(isSectionDark(targetSection) ? 'dark' : 'light')
    isScrollingRef.current = true
    el.scrollTo({ top: targetIndex * sectionHeight, behavior: 'smooth' })
  }, [sections, setHeaderVariant])

  const goToSectionRef = useRef(goToSection)
  useEffect(() => {
    goToSectionRef.current = goToSection
  }, [goToSection])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0)
    currentIndexRef.current = 0
  }, [])

  // Detect scroll completion — clears the isScrolling lock
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let scrollEndTimer = 0

    const onScrollEnd = () => {
      isScrollingRef.current = false
    }

    // scrollend event (supported in Chrome 114+, Firefox 109+, Safari 18+)
    if ('onscrollend' in el) {
      el.addEventListener('scrollend', onScrollEnd, { passive: true })
    }

    // Fallback: also use a debounced scroll listener for older browsers
    const onScroll = () => {
      clearTimeout(scrollEndTimer)
      scrollEndTimer = window.setTimeout(onScrollEnd, 120)
    }
    el.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      clearTimeout(scrollEndTimer)
      if ('onscrollend' in el) {
        el.removeEventListener('scrollend', onScrollEnd)
      }
      el.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Update header variant based on current section
  useEffect(() => {
    const el = scrollRef.current
    if (!el || sections.length === 0) return

    const updateVariant = () => {
      const sectionHeight = el.clientHeight
      if (sectionHeight <= 0) return
      const rawIndex = Math.round(el.scrollTop / sectionHeight)
      const index = Math.max(0, Math.min(rawIndex, sections.length - 1))
      currentIndexRef.current = index
      const section = sections[index]
      setHeaderVariant(isSectionDark(section) ? 'dark' : 'light')
    }

    updateVariant()
    el.addEventListener('scroll', updateVariant, { passive: true })
    return () => el.removeEventListener('scroll', updateVariant)
  }, [sections, setHeaderVariant])

  // Wheel: advance/retreat one section. Block native scroll. Ignore while animating.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onWheel = (e: WheelEvent) => {
      const sectionHeight = el.clientHeight
      if (sectionHeight <= 0) return
      e.preventDefault()

      if (isScrollingRef.current) return

      const idx = currentIndexRef.current
      const maxIndex = Math.max(0, Math.ceil(el.scrollHeight / sectionHeight) - 1)

      if (e.deltaY > WHEEL_THRESHOLD && idx < maxIndex) {
        goToSectionRef.current(idx + 1)
      } else if (e.deltaY < -WHEEL_THRESHOLD && idx > 0) {
        goToSectionRef.current(idx - 1)
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // Touch: one section per swipe
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const onTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY
    }

    const onTouchMove = (e: TouchEvent) => {
      if (el.clientHeight > 0) e.preventDefault()
    }

    const onTouchEnd = (e: TouchEvent) => {
      const startY = touchStartYRef.current
      touchStartYRef.current = null
      if (startY == null || e.changedTouches.length === 0) return
      if (isScrollingRef.current) return

      const sectionHeight = el.clientHeight
      if (sectionHeight <= 0) return

      const endY = e.changedTouches[0].clientY
      const deltaY = endY - startY
      const idx = currentIndexRef.current
      const maxIndex = Math.max(0, Math.ceil(el.scrollHeight / sectionHeight) - 1)

      if (deltaY < -TOUCH_SWIPE_THRESHOLD_PX && idx < maxIndex) {
        goToSectionRef.current(idx + 1)
      } else if (deltaY > TOUCH_SWIPE_THRESHOLD_PX && idx > 0) {
        goToSectionRef.current(idx - 1)
      }
    }

    const onTouchCancel = () => {
      touchStartYRef.current = null
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchCancel, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
    }
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
      if (isScrollingRef.current) return

      const sectionHeight = el.clientHeight
      if (sectionHeight <= 0) return

      const idx = currentIndexRef.current
      const maxIndex = Math.max(0, Math.ceil(el.scrollHeight / sectionHeight) - 1)

      if (e.key === 'ArrowDown' && idx < maxIndex) {
        e.preventDefault()
        goToSection(idx + 1)
      } else if (e.key === 'ArrowUp' && idx > 0) {
        e.preventDefault()
        goToSection(idx - 1)
      }
    },
    [goToSection]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // On resize, re-align to current section
  useEffect(() => {
    const el = scrollRef.current
    if (!el || sectionHeightPx <= 0) return
    const targetTop = currentIndexRef.current * sectionHeightPx
    if (Math.abs(el.scrollTop - targetTop) > 1) {
      el.scrollTo({ top: targetTop, behavior: 'auto' })
    }
  }, [sectionHeightPx])

  return (
    <div
      ref={scrollRef}
      className="fixed left-0 right-0 top-0 z-10 h-screen overflow-x-hidden overflow-y-auto overscroll-contain w-full min-w-0"
      style={
        sectionHeightPx > 0
          ? { ['--section-height' as string]: `${sectionHeightPx}px` }
          : undefined
      }
    >
      <div
        className="min-w-0 w-full"
        style={{
          minHeight:
            sectionHeightPx > 0
              ? `${totalSections * sectionHeightPx}px`
              : `calc(${totalSections} * 100vh)`,
        }}
      >
        <StickyHeroStack
          sections={sections}
          headerSlot={null}
          reserveHeaderSpace
          onScrollDown={() => goToSection(1)}
        />
        {children}
      </div>
    </div>
  )
}
