'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ImageCarouselNavigation } from './ImageCarouselNavigation'

interface CarouselImage {
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
}

interface VerticalImageCarouselProps {
  images: CarouselImage[]
  productTitle: string
}

export function VerticalImageCarousel({
  images,
  productTitle,
}: VerticalImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const wheelAccumulator = useRef(0)
  const wheelTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollLocked = useRef(true)

  const total = images.length

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      const clamped = Math.max(0, Math.min(index, total - 1))
      if (clamped === current) return
      scrollLocked.current = true
      setIsTransitioning(true)
      setCurrent(clamped)
      setTimeout(() => {
        setIsTransitioning(false)
        if (clamped === 0 || clamped === total - 1) {
          scrollLocked.current = false
        }
      }, 600)
    },
    [current, total, isTransitioning]
  )

  const isAtEnd = current === total - 1
  const isAtStart = current === 0

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const el = containerRef.current
    if (!el || total <= 1) return

    const handleWheel = (e: WheelEvent) => {
      const scrollingDown = e.deltaY > 0
      const scrollingUp = e.deltaY < 0
      const atBoundary =
        (scrollingDown && isAtEnd) || (scrollingUp && isAtStart)

      if (atBoundary && !scrollLocked.current) return

      e.preventDefault()

      wheelAccumulator.current += e.deltaY
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current)
      wheelTimeout.current = setTimeout(() => {
        wheelAccumulator.current = 0
      }, 150)

      if (!atBoundary && Math.abs(wheelAccumulator.current) > 50) {
        if (wheelAccumulator.current > 0) next()
        else prev()
        wheelAccumulator.current = 0
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [next, prev, isAtEnd, isAtStart, total])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(delta) < 50) return
    const atBoundary =
      (delta > 0 && isAtEnd) || (delta < 0 && isAtStart)
    if (atBoundary && !scrollLocked.current) return
    if (delta > 0) next()
    else prev()
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [next, prev])

  if (total === 0) return null

  const widestImageAspectRatio = images.reduce((maxRatio, image) => {
    if (!image.width || !image.height) return maxRatio
    return Math.max(maxRatio, image.width / image.height)
  }, 0.75)

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex h-full w-full items-start justify-end gap-3">
        <div
          className="relative h-full min-w-0 overflow-hidden"
          style={{
            width: `min(calc(100% - ${total > 1 ? '3.5rem' : '0rem'}), calc((100vh - var(--header-height) - 1rem) * ${widestImageAspectRatio}))`,
          }}
        >
          {/* Slides */}
          <div
            className="flex flex-col transition-transform duration-500 ease-out"
            style={{
              height: `${total * 100}%`,
              transform: `translateY(-${(current / total) * 100}%)`,
            }}
          >
            {images.map((img, i) => (
              <div
                key={img.url}
                className="flex items-start justify-end"
                style={{ height: `${100 / total}%` }}
              >
                <Image
                  src={img.url}
                  alt={img.altText ?? productTitle}
                  width={img.width ?? 800}
                  height={img.height ?? 1067}
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="max-h-full max-w-full object-contain"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

        </div>

        <ImageCarouselNavigation
          total={total}
          current={current}
          onSelect={goTo}
          vertical
        />
      </div>

    </div>
  )
}
