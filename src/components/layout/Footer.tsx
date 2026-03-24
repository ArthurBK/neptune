'use client'

import Link from 'next/link'

import { CountrySelector } from '@/components/commerce/CountrySelector'

const FOOTER_LINKS = [
  { label: 'ABOUT', href: '/about' },
  { label: 'CONTACT', href: '/contact' },
  { label: 'POLICY', href: '/policy' },
  { label: 'COOKIES', href: '/cookies' },
  // { label: 'ADVERTISING', href: '/contact#advertising' },
] as const

export function Footer({ instagramUrl }: { instagramUrl?: string | null }) {
  return (
    <footer className="bg-white">
      <div className="max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
        <div className="flex flex-col items-center text-center gap-6">
          <nav className="flex flex-col items-center justify-center gap-4 font-futura font-medium text-[13px] tracking-[0.1em] uppercase text-black">
            {FOOTER_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-black transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/newsletters" className="hover:text-black transition-colors">
              NEWSLETTER
            </Link>
            <a
              href={instagramUrl ?? 'https://www.instagram.com/neptune_papers/'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center hover:text-black transition-colors"
              aria-label="Follow us on Instagram"
            >
              <span className="sr-only">Instagram</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <title>Instagram</title>
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </nav>

          <CountrySelector />

          <p className="font-futura font-medium text-[13px] text-black">
            © {new Date().getFullYear()} Neptune Papers. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
