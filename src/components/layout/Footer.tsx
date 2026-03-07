import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
  { label: 'ADVERTISING', href: '/contact#advertising' },
] as const

export function Footer() {
  return (
    <footer className="border-t border-[#E5E5E5] bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
        <nav className="flex flex-wrap items-center justify-center md:justify-start gap-6 md:gap-8">
          {FOOTER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
