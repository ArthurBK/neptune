'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'NEWSLETTERS', href: '/#newsletter' },
  { label: 'INTERIORS', href: '/interiors' },
  { label: 'STUDIO', href: '/the-studio' },
  { label: 'NEWSSTAND', href: '/newsstand' },
  { label: 'neptune market', href: '/the-market' },
] as const

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick?: () => void
}) {
  const pathname = usePathname()
  const baseHref = href.replace(/#.*/, '')
  const isActive =
    href === '/'
      ? pathname === '/'
      : href === '/#newsletter'
        ? pathname === '/'
        : pathname === baseHref || pathname.startsWith(`${baseHref}/`)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-base tracking-[0.2em] uppercase transition-colors hover:text-black ${
        isActive ? 'text-black font-medium' : 'text-[#6B6B6B]'
      }`}
    >
      {label}
    </Link>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 h-16 flex items-center justify-between md:justify-start relative">
        {/* Logo — centered on mobile, left on desktop */}
        <Link
          href="/"
          className="font-serif text-3xl tracking-[0.15em] uppercase text-black absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:mr-12 md:flex-shrink-0"
        >
          NEPTUNE
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* Mobile hamburger — left, spacer on right for centered logo */}
        <button
          type="button"
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5 flex-shrink-0"
        >
          <span
            className={`block w-5 h-px bg-black transition-transform duration-200 ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-black transition-opacity duration-200 ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-px bg-black transition-transform duration-200 ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
        <div className="w-10 md:hidden flex-shrink-0" aria-hidden />
      </div>

      {/* Mobile overlay menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 top-16 bg-white z-40 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col items-center justify-center h-full gap-8 py-16">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
