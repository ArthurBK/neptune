'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { CART_OPEN_EVENT, getCartId } from '@/lib/cart'

import { CartPreview } from '@/components/commerce/CartPreview'
import { SearchModal } from './SearchModal'

const NAV_ITEMS = [
  { label: 'NEWSSTAND', href: '/newsstand' },
  { label: 'INTERIORS', href: '/interiors' },
  { label: 'GARDENS', href: '/gardens' },
  { label: 'ARTS', href: '/arts' },
  { label: 'FASHION', href: '/fashion' },
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
  const [isBurgerOpen, setIsBurgerOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState<number | null>(null)

  const fetchCartCount = useCallback(async () => {
    const cartId = getCartId()
    if (!cartId) {
      setCartCount(null)
      return
    }
    try {
      const res = await fetch(
        `/api/cart?cartId=${encodeURIComponent(cartId)}&_t=${Date.now()}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      setCartCount(data.cart?.totalQuantity ?? null)
    } catch {
      setCartCount(null)
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsBurgerOpen(false)
    }
    if (isBurgerOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isBurgerOpen])

  useEffect(() => {
    fetchCartCount()
    const cartUpdatedHandler = (e: Event) => {
      const cart = (e as CustomEvent<{ cart?: { totalQuantity?: number } | null }>)?.detail?.cart
      if (cart !== undefined && typeof cart?.totalQuantity === 'number') {
        setCartCount(cart.totalQuantity)
      } else {
        fetchCartCount()
      }
    }
    const openCartHandler = () => setIsCartOpen(true)
    window.addEventListener('neptune-cart-updated', cartUpdatedHandler)
    window.addEventListener(CART_OPEN_EVENT, openCartHandler)
    return () => {
      window.removeEventListener('neptune-cart-updated', cartUpdatedHandler)
      window.removeEventListener(CART_OPEN_EVENT, openCartHandler)
    }
  }, [fetchCartCount])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]">
      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-4 md:py-6 w-full min-w-0">
        {/* Top row: Burger + Newsletter left, Logo center */}
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-start items-center gap-2">
            <button
              type="button"
              aria-label={isBurgerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isBurgerOpen}
              onClick={() => setIsBurgerOpen(!isBurgerOpen)}
              className="w-10 h-10 flex flex-col justify-center items-center gap-1.5 text-[#6B6B6B] hover:text-black transition-colors"
            >
              <span
                className={`block w-5 h-px bg-current transition-transform duration-200 ${
                  isBurgerOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-opacity duration-200 ${
                  isBurgerOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-transform duration-200 ${
                  isBurgerOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </button>
            <NavLink href="/newsletters" label="NEWSLETTERS" bold />
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
          <div className="flex flex-1 justify-end items-center gap-2 md:justify-end">
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
              className="md:hidden relative w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-black transition-colors"
            >
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
                <title>Cart</title>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount != null && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-black transition-colors"
            >
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
                <title>Search</title>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop nav — nav items centered, search & cart on the right */}
        <nav className="hidden md:flex items-center justify-center gap-8 mt-4 w-full relative">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-black transition-colors"
            >
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
                <title>Cart</title>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount != null && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 flex items-center justify-center text-[#6B6B6B] hover:text-black transition-colors"
            >
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
                <title>Search</title>
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Burger menu — slides from left */}
      <>
        <div
          className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 md:z-40 ${
            isBurgerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsBurgerOpen(false)}
          aria-hidden
        />
        <aside
          className={`fixed top-[var(--header-height)] left-0 bottom-0 z-50 w-72 max-w-[85vw] bg-white border-r border-[#E5E5E5] shadow-xl transition-transform duration-300 ease-out ${
            isBurgerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-hidden={!isBurgerOpen}
        >
          <nav className="flex flex-col gap-1 px-6 py-8">
            <NavLink
              href="/newsletters"
              label="NEWSLETTERS"
              bold
              onClick={() => setIsBurgerOpen(false)}
            />
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                onClick={() => setIsBurgerOpen(false)}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setIsBurgerOpen(false)
                setIsSearchOpen(true)
              }}
              className="text-left text-base tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors py-2"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setIsBurgerOpen(false)
                setIsCartOpen(true)
              }}
              className="text-left text-base tracking-[0.2em] uppercase text-[#6B6B6B] hover:text-black transition-colors py-2"
            >
              Cart {cartCount != null && cartCount > 0 && `(${cartCount})`}
            </button>
          </nav>
        </aside>
      </>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartPreview isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
