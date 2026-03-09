'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

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

  const total = images.length

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return
      const next = Math.max(0, Math.min(index, total - 1))
      if (next === current) return
      setIsTransitioning(true)
      setCurrent(next)
      setTimeout(() => setIsTransitioning(false), 600)
    },
    [current, total, isTransitioning]
  )

  const isAtEnd = current === total - 1
  const isAtStart = current === 0

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      wheelAccumulator.current += e.deltaY
      if (wheelTimeout.current) clearTimeout(wheelTimeout.current)
      wheelTimeout.current = setTimeout(() => {
        wheelAccumulator.current = 0
      }, 150)

      const scrollingDown = wheelAccumulator.current > 0
      const scrollingUp = wheelAccumulator.current < 0

      if ((scrollingDown && isAtEnd) || (scrollingUp && isAtStart)) return

      e.preventDefault()

      if (Math.abs(wheelAccumulator.current) > 50) {
        if (scrollingDown) next()
        else prev()
        wheelAccumulator.current = 0
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [next, prev, isAtEnd, isAtStart])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY
    if (Math.abs(delta) > 50) {
      if (delta > 0 && !isAtEnd) next()
      else if (delta < 0 && !isAtStart) prev()
    }
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

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
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
            className="flex items-center justify-center"
            style={{ height: `${100 / total}%` }}
          >
            <Image
              src={img.url}
              alt={img.altText ?? productTitle}
              width={img.width ?? 800}
              height={img.height ?? 1067}
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="max-h-full max-w-full object-contain"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Vertical dots */}
      {total > 1 && (
        <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'h-6 w-1.5 bg-[#1A1A1A]'
                  : 'h-1.5 w-1.5 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/60'
              }`}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === current}
            />
          ))}
        </div>
      )}

      {/* Up / Down arrows */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            disabled={current === 0}
            className="absolute top-3 left-1/2 z-10 -translate-x-1/2 rounded-full p-1.5 text-[#6B6B6B] transition-colors hover:text-[#1A1A1A] disabled:opacity-0"
            aria-label="Previous image"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={current === total - 1}
            className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full p-1.5 text-[#6B6B6B] transition-colors hover:text-[#1A1A1A] disabled:opacity-0"
            aria-label="Next image"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </>
      )}

    </div>
  )
}
