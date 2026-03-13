'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

interface CarouselImage {
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
}

interface HorizontalImageCarouselProps {
  images: CarouselImage[]
  productTitle: string
}

export function HorizontalImageCarousel({
  images,
  productTitle,
}: HorizontalImageCarouselProps) {
  const [current, setCurrent] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const total = images.length

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, total - 1))
      const el = scrollRef.current
      if (el) {
        const slideWidth = el.clientWidth
        el.scrollTo({ left: clamped * slideWidth, behavior: 'smooth' })
      }
      setCurrent(clamped)
    },
    [total]
  )

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el || total <= 1) return
    const slideWidth = el.clientWidth
    const index = Math.round(el.scrollLeft / slideWidth)
    const clamped = Math.max(0, Math.min(index, total - 1))
    setCurrent(clamped)
  }, [total])

  if (total === 0) return null

  return (
    <div className="relative w-full">
      {/* Horizontal scroll: native scroll, no touch capture — vertical page scroll works */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth overscroll-x-contain [-webkit-overflow-scrolling:touch]"
        style={{ touchAction: 'pan-y pinch-zoom' }}
      >
        {images.map((img, i) => (
          <div
            key={img.url}
            className="flex shrink-0 w-full snap-center snap-always items-center justify-center"
          >
            <Image
              src={img.url}
              alt={img.altText ?? productTitle}
              width={img.width ?? 800}
              height={img.height ?? 1067}
              sizes="100vw"
              className="max-h-[55vh] w-auto max-w-full object-contain sm:max-h-[70vh]"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      {total > 1 && (
        <div className="mt-2 flex justify-center gap-2 sm:mt-4">
          {images.map((_, i) => (
            <button
              key={images[i].url}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'h-1.5 w-6 bg-[#1A1A1A]'
                  : 'h-1.5 w-1.5 bg-[#1A1A1A]/30 hover:bg-[#1A1A1A]/60'
              }`}
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === current}
            />
          ))}
        </div>
      )}

      {/* Prev / Next */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-[#6B6B6B] transition-colors hover:text-[#1A1A1A] disabled:opacity-0"
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
              <title>Previous</title>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={current === total - 1}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-[#6B6B6B] transition-colors hover:text-[#1A1A1A] disabled:opacity-0"
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
              <title>Next</title>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
