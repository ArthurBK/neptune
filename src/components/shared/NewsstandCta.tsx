import Image from 'next/image'
import Link from 'next/link'

export function NewsstandCta() {
  return (
    <div className="mt-16 md:mt-24 py-6 border-y border-[#E5E5E5] text-center">
      <Link
        href="/newsstand"
        className="flex flex-row items-center justify-center gap-3 text-[#6B6B6B] hover:text-black transition-colors group"
      >
        <Image
          src="/neptune_logo.png"
          alt="Neptune"
          width={60}
          height={16}
          className="h-4 w-auto [filter:invert(27%)_sepia(98%)_saturate(1000%)_hue-rotate(350deg)] group-hover:[filter:invert(15%)_sepia(98%)_saturate(1000%)_hue-rotate(350deg)]"
        />
        <span className="text-sm tracking-[0.2em] uppercase">
          Discover All Available Issues
        </span>
      </Link>
    </div>
  )
}
