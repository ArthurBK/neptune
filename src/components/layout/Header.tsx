'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'NEWSSTAND', href: '/newsstand' },
  { label: 'NEWSLETTERS', href: '/#newsletter' },
  { label: 'INTERIORS', href: '/interiors' },
  { label: 'neptune market', href: '/the-market' },
] as const

function NavLink({
  href,
  label,
  onClick,
  bold,
}: {
  href: string
  label: string
  onClick?: () => void
  bold?: boolean
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
        bold ? 'font-bold' : ''
      } ${isActive ? 'text-black font-medium' : 'text-[#6B6B6B]'}`}
    >
      {label}
    </Link>
  )
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="relative max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-4 md:py-6">
        {/* Top row: Newsletter left, Logo center */}
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start">
            <NavLink href="/#newsletter" label="NEWSLETTERS" bold />
          </div>
          <Link href="/" className="shrink-0">
            <Image
              src="/neptune_logo.png"
              alt="Neptune"
              width={120}
              height={32}
              className="h-6 w-auto md:h-8"
              priority
            />
          </Link>
          <div className="flex-1 flex justify-end md:justify-center">
            <button
              type="button"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex flex-col justify-center items-center gap-1.5"
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
          </div>
        </div>

        {/* Desktop nav — centered below logo */}
        <nav className="hidden md:flex items-center justify-center gap-8 mt-4">
          {NAV_ITEMS.filter((item) => item.href !== '/#newsletter').map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>
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
