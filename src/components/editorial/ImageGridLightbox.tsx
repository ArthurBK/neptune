'use client'

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { SanityCaption, hasCaptionContent } from '@/components/shared/SanityCaption'

type GridImage = {
  id: string
  thumbUrl: string
  fullUrl: string
  alt: string
  caption?: unknown
  captionSpansGrid?: boolean
}

export function ImageGridLightbox({ images }: { images: GridImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const gridCount = images.length === 2 ? 2 : 3
  const isOpen = activeIndex !== null

  const active = activeIndex === null ? null : images[activeIndex]
  const total = images.length

  const wideCaptionImage = images.find(
    (img) => img.captionSpansGrid && hasCaptionContent(img.caption)
  )
  const shouldRenderPerImageCaptions = !wideCaptionImage

  const go = useCallback(
    (nextIndex: number) => {
      if (!total) return
      const clamped = Math.max(0, Math.min(nextIndex, total - 1))
      setActiveIndex(clamped)
    },
    [total]
  )

  const close = useCallback(() => setActiveIndex(null), [])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') go((activeIndex ?? 0) - 1)
      if (e.key === 'ArrowRight') go((activeIndex ?? 0) + 1)
    }

    // Prevent background scroll while modal is open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeIndex, close, go, isOpen])

  const nav = useMemo(() => {
    if (!isOpen || !total) return null
    return (
      <>
        <button
          type="button"
          onClick={() => go((activeIndex ?? 0) - 1)}
          disabled={(activeIndex ?? 0) <= 0}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
          aria-label="Previous image"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => go((activeIndex ?? 0) + 1)}
          disabled={(activeIndex ?? 0) >= total - 1}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10"
          aria-label="Next image"
        >
          <svg
            aria-hidden="true"
            focusable="false"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        {total > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === (activeIndex ?? 0)
                    ? 'bg-white'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </>
    )
  }, [activeIndex, images, isOpen, total, go])

  if (!images.length) return null

  return (
    <>
      <div className="max-w-[940px] mx-auto px-6 md:px-6 my-6 md:my-8">
        <div
          className={`grid gap-4 md:gap-7 ${
            gridCount === 2 ? 'grid-cols-2 md:grid-cols-2' : 'grid-cols-3 md:grid-cols-3'
          }`}
        >
          {images.map((img, i) => (
            <figure key={img.id} className="group overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                className="block w-full text-left cursor-pointer"
                aria-label={`Open image ${i + 1} of ${images.length}`}
              >
                <div
                  // Fixed portrait aspect ratio so every tile has the same size.
                  style={{ aspectRatio: '3 / 4' }}
                  className="relative bg-[#E5E5E5] overflow-hidden"
                >
                  <Image
                    src={img.thumbUrl}
                    alt={img.alt || 'Image'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </button>

              {shouldRenderPerImageCaptions && hasCaptionContent(img.caption) && (
                <figcaption className="mt-1 text-sm text-[#6B6B6B] whitespace-normal wrap-break-word">
                  <SanityCaption value={img.caption} />
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        {wideCaptionImage && (
          <figcaption className="mt-3 text-sm text-[#6B6B6B] whitespace-normal wrap-break-word text-center">
            <SanityCaption value={wideCaptionImage.caption} />
          </figcaption>
        )}
      </div>

      {isOpen && active && (
        <div
          className="fixed inset-0 z-1000 bg-black/75 flex items-center justify-center p-6"
          onMouseDown={(e) => {
            // Close only when clicking the backdrop.
            if (e.target === e.currentTarget) close()
          }}
        >
          <div className="relative w-full max-w-5xl">
            <div
              className="relative w-full bg-black/5 overflow-hidden"
              style={{ height: '70vh' }}
            >
              <Image
                src={active.fullUrl}
                alt={active.alt || 'Image'}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-contain"
                unoptimized
                priority
              />
            </div>
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close carousel"
            >
              <svg
                aria-hidden="true"
                focusable="false"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            {nav}
          </div>
        </div>
      )}
    </>
  )
}

