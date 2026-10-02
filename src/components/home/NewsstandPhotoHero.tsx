'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createCarouselWheelGesture } from '@/lib/carouselWheel'

export interface NewsstandPhotoSlide {
  _key: string
  imageUrl: string
  alt: string
  ctaLabel: string
  linkUrl: string
  objectPosition?: string
}

function getImageBackground(image: HTMLImageElement): string | null {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d')
    if (!context) return null

    // Sample the outer background, not the photograph in the middle of the artwork.
    context.drawImage(image, 0, 0, 1, 1, 0, 0, 1, 1)
    const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data
    return alpha === 255 ? `rgb(${red}, ${green}, ${blue})` : null
  } catch {
    // Keep the carousel usable if an image cannot be sampled (e.g. cross-origin SVG).
    return null
  }
}

export function NewsstandPhotoHero({
  slides,
  priority = false,
}: {
  slides: NewsstandPhotoSlide[]
  priority?: boolean
}) {
  return (
    <PhotoCarousel
      key={slides.map((slide) => `${slide._key}:${slide.imageUrl}`).join('|')}
      slides={slides}
      priority={priority}
    />
  )
}

function PhotoCarousel({ slides, priority }: { slides: NewsstandPhotoSlide[]; priority: boolean }) {
  const multiple = slides.length > 1
  const [{ position, animate }, setFrame] = useState({ position: multiple ? 1 : 0, animate: false })
  const [loadedSlides, setLoadedSlides] = useState<Set<number>>(() => new Set())
  const [backgrounds, setBackgrounds] = useState<Record<string, string>>({})
  const [isControlHovered, setIsControlHovered] = useState(false)
  const [isControlFocused, setIsControlFocused] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [wheelGesture] = useState(createCarouselWheelGesture)
  const lastWheelHandledAtRef = useRef(-Infinity)
  const pendingMoveRef = useRef<number | null>(null)
  const index = multiple ? (position - 1 + slides.length) % slides.length : 0
  const slide = slides[index]
  // Copies at both ends keep forward and backward swipes moving naturally.
  const trackSlides = multiple ? [slides[slides.length - 1], ...slides, slides[0]] : slides
  const isLoopCopy = multiple && (position === 0 || position === slides.length + 1)

  const move = useCallback((direction: number) => {
    const next = position + direction
    if (!multiple || isLoopCopy || !loadedSlides.has(position) || !loadedSlides.has(next)) return false
    setFrame({ position: next, animate: true })
    return true
  }, [position, multiple, isLoopCopy, loadedSlides])

  const requestMove = useCallback((direction: number) => {
    pendingMoveRef.current = move(direction) ? null : direction
  }, [move])

  useEffect(() => {
    if (pendingMoveRef.current === null) return
    // Keep a deliberate gesture made while the loop resets or an image decodes.
    const frame = window.requestAnimationFrame(() => {
      const direction = pendingMoveRef.current
      if (direction !== null && move(direction)) pendingMoveRef.current = null
    })
    return () => window.cancelAnimationFrame(frame)
  }, [move])

  const resetLoop = useCallback(() => {
    if (!isLoopCopy) return
    setFrame({ position: position === 0 ? slides.length : 1, animate: false })
  }, [isLoopCopy, position, slides.length])

  useEffect(() => {
    if (!multiple || isControlHovered || isControlFocused || isTouching) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timer = window.setInterval(() => {
      if (document.hidden || reducedMotion.matches || performance.now() - lastWheelHandledAtRef.current < 350) return
      move(1)
    }, 5000)

    return () => window.clearInterval(timer)
  }, [multiple, isControlHovered, isControlFocused, isTouching, move])

  useEffect(() => {
    if (!isLoopCopy) return
    // Also reset if transitionend is skipped when the tab becomes hidden.
    const timer = window.setTimeout(resetLoop, 750)
    return () => window.clearTimeout(timer)
  }, [isLoopCopy, resetLoop])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !multiple) return

    const start = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        touchStartRef.current = null
        setIsTouching(false)
        return
      }
      touchStartRef.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }
      setIsTouching(true)
    }
    const drag = (event: TouchEvent) => {
      const origin = touchStartRef.current
      if (!origin || event.touches.length !== 1) return
      const dx = event.touches[0].clientX - origin.x
      const dy = event.touches[0].clientY - origin.y
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }
    const end = (event: TouchEvent) => {
      const origin = touchStartRef.current
      touchStartRef.current = null
      setIsTouching(false)
      if (!origin || event.changedTouches.length === 0) return
      const dx = event.changedTouches[0].clientX - origin.x
      const dy = event.changedTouches[0].clientY - origin.y
      if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
        // Handle horizontal swipes before HomeScrollContainer's native listener;
        // vertical swipes still bubble to its full-page scrolling behavior.
        event.preventDefault()
        event.stopPropagation()
        requestMove(dx < 0 ? 1 : -1)
      }
    }
    const cancel = () => {
      touchStartRef.current = null
      setIsTouching(false)
    }

    section.addEventListener('touchstart', start, { passive: true })
    section.addEventListener('touchmove', drag, { passive: false })
    section.addEventListener('touchend', end, { passive: false })
    section.addEventListener('touchcancel', cancel, { passive: true })
    return () => {
      section.removeEventListener('touchstart', start)
      section.removeEventListener('touchmove', drag)
      section.removeEventListener('touchend', end)
      section.removeEventListener('touchcancel', cancel)
    }
  }, [multiple, requestMove])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !multiple) return

    const onWheel = (event: WheelEvent) => {
      // Trackpad pinch gestures belong to browser zoom, not the carousel.
      if (event.ctrlKey) {
        event.stopPropagation()
        return
      }
      if (event.deltaX === 0 && event.deltaY === 0) return

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? section.clientWidth : 1
      const shiftScroll = event.shiftKey && event.deltaX === 0
      const result = wheelGesture(
        (shiftScroll ? event.deltaY : event.deltaX) * unit,
        (shiftScroll ? 0 : event.deltaY) * unit,
        event.timeStamp,
      )
      if (result.axis === 'vertical') return

      // This native listener runs before the homepage's vertical wheel handler.
      // Hold small undecided movements here until their direction is clear.
      event.preventDefault()
      event.stopPropagation()
      lastWheelHandledAtRef.current = performance.now()
      if (result.direction) requestMove(result.direction)
    }

    section.addEventListener('wheel', onWheel, { passive: false })
    return () => section.removeEventListener('wheel', onWheel)
  }, [multiple, requestMove, wheelGesture])

  if (!slide) return null

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-full w-full overflow-hidden bg-black"
      aria-label="Photo carousel"
      aria-roledescription="carousel"
      onFocusCapture={() => setIsControlFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsControlFocused(false)
      }}
    >
      <div
        className={`absolute inset-0 flex ${animate ? 'transition-transform duration-700 ease-in-out motion-reduce:transition-none' : 'transition-none'}`}
        style={{ transform: `translateX(-${position * 100}%)` }}
        onTransitionEnd={(event) => {
          if (event.target === event.currentTarget && event.propertyName === 'transform') resetLoop()
        }}
      >
        {trackSlides.map((photo, photoIndex) => (
          <div
            key={`${photo._key}-${photoIndex}`}
            className="relative h-full w-full shrink-0"
            style={{ backgroundColor: backgrounds[photo._key] }}
            aria-hidden={photoIndex !== position}
          >
            <div className="absolute inset-x-0 top-[var(--header-height)] bottom-44 md:inset-0">
              <Image
                src={photo.imageUrl}
                alt={photo.alt}
                fill
                sizes="100vw"
                loading="eager"
                priority={priority && photoIndex === (multiple ? 1 : 0)}
                onLoad={(event) => {
                  const background = getImageBackground(event.currentTarget)
                  if (background) {
                    setBackgrounds((current) => current[photo._key] === background
                      ? current
                      : { ...current, [photo._key]: background })
                  }
                  // Next Image fires onLoad after decoding the displayed image.
                  setLoadedSlides((loaded) => loaded.has(photoIndex) ? loaded : new Set(loaded).add(photoIndex))
                }}
                className="object-contain md:object-cover"
                style={{ objectPosition: photo.objectPosition }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-24 flex justify-center px-6 md:bottom-28">
        <Link
          href={slide.linkUrl}
          onMouseEnter={() => setIsControlHovered(true)}
          onMouseLeave={() => setIsControlHovered(false)}
          className="max-w-full border border-white bg-white px-6 py-3 text-center font-futura text-sm font-medium tracking-[0.12em] text-black uppercase transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:px-8"
        >
          {slide.ctaLabel}
        </Link>
      </div>
      {multiple && (
        <div
          role="group"
          aria-label="Choose a photo"
          className="absolute inset-x-0 bottom-12 flex items-center justify-center gap-2 px-6 md:gap-3"
          onMouseEnter={() => setIsControlHovered(true)}
          onMouseLeave={() => setIsControlHovered(false)}
        >
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => requestMove(-1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
              <path d="m14 5-7 7 7 7" />
            </svg>
          </button>
          {slides.map((photo, photoIndex) => (
            <button
              key={photo._key}
              type="button"
              aria-label={`Go to photo ${photoIndex + 1}`}
              aria-current={photoIndex === index ? 'true' : undefined}
              disabled={!loadedSlides.has(photoIndex + 1)}
              onClick={() => {
                pendingMoveRef.current = null
                setFrame({ position: photoIndex + 1, animate: true })
              }}
              className="flex h-11 w-8 min-w-0 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait md:w-12"
            >
              <span className={`h-px w-full transition-colors ${photoIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`} />
            </button>
          ))}
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => requestMove(1)}
            className="flex h-11 w-11 shrink-0 items-center justify-center text-white transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
              <path d="m10 5 7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )
}
