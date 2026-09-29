'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export interface NewsstandPhotoSlide {
  _key: string
  imageUrl: string
  alt: string
  ctaLabel: string
  linkUrl: string
  objectPosition?: string
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
  const [isControlHovered, setIsControlHovered] = useState(false)
  const [isControlFocused, setIsControlFocused] = useState(false)
  const [isTouching, setIsTouching] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const wheelGestureRef = useRef({
    lastEventAt: -Infinity,
    lastHandledAt: -Infinity,
    axis: null as 'horizontal' | 'vertical' | null,
    distance: 0,
    consumed: false,
  })
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

  const resetLoop = useCallback(() => {
    if (!isLoopCopy) return
    setFrame({ position: position === 0 ? slides.length : 1, animate: false })
  }, [isLoopCopy, position, slides.length])

  useEffect(() => {
    if (!multiple || isControlHovered || isControlFocused || isTouching) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const timer = window.setInterval(() => {
      if (document.hidden || reducedMotion.matches || performance.now() - wheelGestureRef.current.lastHandledAt < 350) return
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
        move(dx < 0 ? 1 : -1)
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
  }, [multiple, move])

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

      const gesture = wheelGestureRef.current
      if (event.timeStamp - gesture.lastEventAt > 200) {
        gesture.axis = null
        gesture.distance = 0
        gesture.consumed = false
      }
      gesture.lastEventAt = event.timeStamp
      gesture.axis ??= Math.abs(event.deltaX) > Math.abs(event.deltaY) ? 'horizontal' : 'vertical'
      if (gesture.axis === 'vertical') return

      // This native listener runs before the homepage's vertical wheel handler.
      // Keep the axis locked through momentum, even when the trailing deltas drift.
      event.preventDefault()
      event.stopPropagation()
      gesture.lastHandledAt = performance.now()
      if (gesture.consumed) return

      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? section.clientWidth : 1
      gesture.distance += event.deltaX * unit
      if (Math.abs(gesture.distance) >= 40) {
        gesture.consumed = move(gesture.distance > 0 ? 1 : -1)
      }
    }

    section.addEventListener('wheel', onWheel, { passive: false })
    return () => section.removeEventListener('wheel', onWheel)
  }, [multiple, move])

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
            aria-hidden={photoIndex !== position}
          >
            <Image
              src={photo.imageUrl}
              alt={photo.alt}
              fill
              sizes="100vw"
              loading="eager"
              priority={priority && photoIndex === (multiple ? 1 : 0)}
              onLoad={() => {
                // Next Image fires onLoad after decoding the displayed image.
                setLoadedSlides((loaded) => loaded.has(photoIndex) ? loaded : new Set(loaded).add(photoIndex))
              }}
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
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
          className="absolute inset-x-0 bottom-14 flex flex-wrap justify-center gap-0 px-6"
          onMouseEnter={() => setIsControlHovered(true)}
          onMouseLeave={() => setIsControlHovered(false)}
        >
          {slides.map((photo, photoIndex) => (
            <button
              key={photo._key}
              type="button"
              aria-label={`Go to photo ${photoIndex + 1}`}
              aria-current={photoIndex === index ? 'true' : undefined}
              disabled={!loadedSlides.has(photoIndex + 1)}
              onClick={() => setFrame({ position: photoIndex + 1, animate: true })}
              className="flex h-8 w-5 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-wait"
            >
              <span className={`h-2 w-2 rounded-full border border-white transition-colors ${photoIndex === index ? 'bg-white' : 'bg-white/30'}`} />
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
