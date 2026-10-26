'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { ImageCarouselNavigation } from './ImageCarouselNavigation'

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
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {images.map((img, i) => (
          <div
            key={img.url}
            className="flex shrink-0 w-full snap-center snap-always items-center justify-center h-[55vh] sm:h-[70vh]"
          >
            <Image
              src={img.url}
              alt={img.altText ?? productTitle}
              width={img.width ?? 800}
              height={img.height ?? 1067}
              sizes="100vw"
              className="h-full w-auto max-w-full object-contain"
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      <ImageCarouselNavigation total={total} current={current} onSelect={goTo} />
    </div>
  )
}
