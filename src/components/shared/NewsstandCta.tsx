import Image from 'next/image'
import Link from 'next/link'

export function NewsstandCta({ unoptimizedLogo = false }: { unoptimizedLogo?: boolean }) {
  return (
    <div className="mt-4 md:mt-6 mb-4 md:mb-6 text-center">
      <Link
        href="/newsstand"
        className="inline-flex flex-row items-center justify-center gap-3 py-3 md:py-4 border-y border-[#E5E5E5] text-[#6B6B6B] hover:text-black transition-colors group"
      >
        <Image
          src="/neptune_logo_orange.svg"
          alt="Neptune"
          width={98}
          height={16}
          unoptimized={unoptimizedLogo}
          className="h-4 w-auto"
        />
        <span className="font-futura font-normal text-sm tracking-[0.2em] uppercase text-black">
          Discover All Available Issues
        </span>
      </Link>
    </div>
  )
}
