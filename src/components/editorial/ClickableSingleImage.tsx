'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'

type Props = {
  src: string
  alt: string
  /** Higher-res URL shown in the fullscreen modal. Falls back to src. */
  fullSrc?: string
  sizes?: string
  /** CSS aspect-ratio value (e.g. "1920 / 1080"). When omitted the container
   *  falls back to a default 4:3 / 16:10 responsive ratio. */
  aspectRatio?: string | null
}

export function ClickableSingleImage({ src, alt, fullSrc, sizes, aspectRatio }: Props) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1A1A1A]"
        aria-label="View image fullscreen"
      >
        <div
          className={
            aspectRatio
              ? 'relative bg-[#E5E5E5] overflow-hidden'
              : 'relative aspect-4/3 md:aspect-16/10 bg-[#E5E5E5] overflow-hidden'
          }
          style={aspectRatio ? { aspectRatio } : undefined}
        >
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            className="object-cover"
            unoptimized
          />
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-1000 bg-black/80 flex items-center justify-center p-4 md:p-8"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={close}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              aria-label="Close"
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
            <div className="relative w-full overflow-hidden" style={{ height: '75vh' }}>
              <Image
                src={fullSrc ?? src}
                alt={alt}
                fill
                sizes="(max-width: 1024px) 100vw, 80vw"
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
