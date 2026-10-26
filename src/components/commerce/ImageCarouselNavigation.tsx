'use client'

interface ImageCarouselNavigationProps {
  total: number
  current: number
  onSelect: (index: number) => void
  vertical?: boolean
}

export function ImageCarouselNavigation({
  total,
  current,
  onSelect,
  vertical = false,
}: ImageCarouselNavigationProps) {
  if (total <= 1) return null

  const arrowClassName = 'flex h-11 w-11 shrink-0 items-center justify-center text-black transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-default disabled:opacity-25'

  return (
    <div
      role="group"
      aria-label="Choose an image"
      className={vertical
        ? 'z-10 flex h-full w-11 shrink-0 flex-col items-center justify-center gap-2'
        : 'mt-2 flex w-full items-center justify-center gap-2 sm:mt-4'}
    >
      <button
        type="button"
        aria-label="Previous image"
        disabled={current === 0}
        onClick={() => onSelect(current - 1)}
        className={arrowClassName}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
          <path d={vertical ? 'm5 14 7-7 7 7' : 'm14 5-7 7 7 7'} />
        </svg>
      </button>
      {Array.from({ length: total }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to image ${index + 1}`}
          aria-current={index === current ? 'true' : undefined}
          onClick={() => onSelect(index)}
          className={`group flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${vertical ? 'h-8 min-h-0 w-11' : 'h-11 w-8 min-w-0 sm:w-12'}`}
        >
          <span
            aria-hidden="true"
            className={`${vertical ? 'h-full w-px' : 'h-px w-full'} transition-colors ${index === current ? 'bg-black' : 'bg-black/40 group-hover:bg-black/70'}`}
          />
        </button>
      ))}
      <button
        type="button"
        aria-label="Next image"
        disabled={current === total - 1}
        onClick={() => onSelect(current + 1)}
        className={arrowClassName}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
          <path d={vertical ? 'm5 10 7 7 7-7' : 'm10 5 7 7-7 7'} />
        </svg>
      </button>
    </div>
  )
}
