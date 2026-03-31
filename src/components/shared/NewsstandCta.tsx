import Image from 'next/image'
import Link from 'next/link'

export function NewsstandCta({
  unoptimizedLogo = false,
  compactMobile = true,
}: {
  unoptimizedLogo?: boolean
  compactMobile?: boolean
}) {
  return (
    <div className={`${compactMobile ? 'mt-2' : 'mt-4'} md:mt-6 ${compactMobile ? 'mb-2' : 'mb-4'} md:mb-6 text-center`}>
      <Link
        href="/newsstand"
        className={`inline-flex flex-row items-center justify-center ${compactMobile ? 'gap-2 py-2 md:gap-2.5 md:py-3' : 'gap-3 py-3 md:py-4'} border-y border-[#E5E5E5] text-[#6B6B6B] hover:text-black transition-colors group`}
      >
        {compactMobile ? (
          <>
            <Image
              src="/neptune_logo_orange.svg"
              alt="Neptune"
              width={64}
              height={10}
              unoptimized={unoptimizedLogo}
              className="shrink-0 md:hidden w-[64px]! h-[10px]!"
            />
            <Image
              src="/neptune_logo_orange.svg"
              alt="Neptune"
              width={98}
              height={16}
              unoptimized={unoptimizedLogo}
              className="hidden shrink-0 md:block md:w-[80px]! md:h-[13px]!"
            />
          </>
        ) : (
          <Image
            src="/neptune_logo_orange.svg"
            alt="Neptune"
            width={98}
            height={16}
            unoptimized={unoptimizedLogo}
            className="shrink-0 w-[98px] h-4"
          />
        )}
        <span className={`font-futura font-normal ${compactMobile ? 'text-[10px] md:text-xs' : 'text-sm'} tracking-[0.2em] uppercase text-black`}>
          Discover All Available Issues
        </span>
      </Link>
    </div>
  )
}
