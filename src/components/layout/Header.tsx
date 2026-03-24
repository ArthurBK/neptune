'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { CSSProperties } from 'react'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import { CART_OPEN_EVENT, getCartId } from '@/lib/cart'
import { useHeaderVariant } from '@/contexts/HeaderVariantContext'

import { CartPreview } from '@/components/commerce/CartPreview'
import { SearchModal } from './SearchModal'

const NAV_ITEMS = [
  { label: 'NEWSSTAND', href: '/newsstand' },
  { label: 'INTERIORS', href: '/interiors' },
  { label: 'GARDENS', href: '/gardens' },
  { label: 'ARTS', href: '/arts' },
  { label: 'FASHION', href: '/fashion' },
  { label: 'TRAVEL', href: '/travel' },
  { label: 'shop', href: '/the-market' },
] as const

function NavLink({
  href,
  label,
  onClick,
  bold,
  transparent,
  className,
}: {
  href: string
  label: string
  onClick?: () => void
  bold?: boolean
  transparent?: boolean
  className?: string
}) {
  const pathname = usePathname()
  const baseHref = href.replace(/#.*/, '')
  const isActive =
    href === '/'
      ? pathname === '/'
      : pathname === baseHref || pathname.startsWith(`${baseHref}/`)

  const textClass = transparent
    ? 'text-white hover:text-white/90'
    : 'text-black hover:text-[#63382E]'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`font-futura font-medium text-[13px] tracking-[0.1em] [word-spacing:0.15em] uppercase transition-colors ${bold ? 'font-bold' : ''} ${textClass} ${className ?? ''}`}
    >
      {label}
    </Link>
  )
}

export function Header({ transparent: _transparent }: { transparent?: boolean } = {}) {
  const variant = useHeaderVariant()
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

  const pathname = usePathname()
  const isHomePage = pathname === '/'
  // Keep header transparent until client mount to prevent a white flash.
  const hasSolidBg = pathname == null ? false : !isHomePage
  const lightText = isHomePage && variant === 'dark'
  const headerClass = `fixed left-0 right-0 top-0 z-50 w-full flex flex-col border-b shrink-0 ${isHomePage ? '' : 'transition-colors'
    }`
  const headerStyle: CSSProperties = {
    height: 'var(--header-height)',
    minHeight: 'var(--header-height)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: hasSolidBg ? '#ffffff' : 'transparent',
    borderColor: 'transparent',
  }
  const iconClass = lightText
    ? 'text-white hover:text-white/90 transition-colors'
    : 'text-black hover:text-[#63382E] transition-colors'

  return (
    <header className={headerClass} style={headerStyle}>
      <div className="relative flex flex-col flex-1 max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-1.5 md:py-2 w-full min-w-0 overflow-visible shrink-0">
        {/* Top row: Burger + Newsletter left, Logo center, Cart/Search right */}
        <div className="relative flex items-center justify-between">
          <div className="flex-1 flex justify-start items-center gap-2 -ml-4 md:-ml-8">
            <button
              type="button"
              aria-label={isBurgerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isBurgerOpen}
              onClick={() => setIsBurgerOpen((prev) => !prev)}
              className={`w-10 h-10 flex flex-col justify-center items-center gap-1.5 ${iconClass}`}
            >
              <span
                className={`block w-5 h-px bg-current transition-transform duration-200 ${isBurgerOpen ? 'rotate-45 translate-y-2' : ''
                  }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-opacity duration-200 ${isBurgerOpen ? 'opacity-0' : ''
                  }`}
              />
              <span
                className={`block w-5 h-px bg-current transition-transform duration-200 ${isBurgerOpen ? '-rotate-45 -translate-y-2' : ''
                  }`}
              />
            </button>
            <NavLink
              href="/newsletters"
              label="NEWSLETTER"
              transparent={lightText}
              className="hidden md:inline-block"
            />
          </div>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 shrink-0">
            <Image
              src="/neptune_logo_dark.svg"
              alt="Neptune"
              width={90}
              height={24}
              className={`h-5 w-auto md:h-6 ${lightText ? 'invert' : ''}`}
              priority
            />
          </Link>
          <div className="flex flex-1 justify-end items-center gap-0 md:justify-end shrink-0 min-w-0 overflow-visible -mr-2 sm:-mr-4 md:-mr-6">
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
              className={`md:hidden relative w-10 h-10 flex items-center justify-center overflow-visible shrink-0 ${iconClass}`}
            >
              <svg
                className="shrink-0 overflow-visible"
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
              className={`md:hidden w-10 h-10 flex items-center justify-center overflow-visible shrink-0 -ml-2 ${iconClass}`}
            >
              <svg
                className="shrink-0 overflow-visible"
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

        {/* Desktop nav — nav items centered, search & cart pinned right */}
        <nav className="hidden md:flex items-center justify-center gap-14 mt-4 pb-3 w-full relative">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} transparent={lightText} />
          ))}
          <div className="absolute right-0 flex items-center gap-0 overflow-visible -mr-2 sm:-mr-4 md:-mr-6">
            <button
              type="button"
              aria-label="Cart"
              onClick={() => setIsCartOpen(true)}
              className={`relative w-10 h-10 flex items-center justify-center overflow-visible shrink-0 ${iconClass}`}
            >
              <svg
                className="shrink-0 overflow-visible"
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
              className={`w-10 h-10 flex items-center justify-center overflow-visible shrink-0 -ml-2 ${iconClass}`}
            >
              <svg
                className="shrink-0 overflow-visible"
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

      {/* Burger menu drawer — lives inside the header in the DOM but
          fixed-positioned to the viewport. overflow-x-hidden has been
          removed from the header so iOS Safari cannot clip this panel. */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 ${isBurgerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsBurgerOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed top-0 left-0 h-dvh w-64 max-w-[75vw] z-50 bg-white border-r border-[#E5E5E5] shadow-xl transition-transform duration-300 ease-out overflow-y-auto overscroll-contain ${isBurgerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isBurgerOpen}
        style={{ WebkitOverflowScrolling: 'touch' } as CSSProperties}
      >
        <nav className="flex min-h-full flex-col gap-3 px-6 pt-8 pb-12">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              onClick={() => setIsBurgerOpen(false)}
            />
          ))}
          <NavLink
            href="/contributors"
            label="CONTRIBUTORS"
            onClick={() => setIsBurgerOpen(false)}
          />
          <button
            type="button"
            onClick={() => {
              setIsBurgerOpen(false)
              setIsSearchOpen(true)
            }}
            className="text-left text-[13px] tracking-[0.2em] [word-spacing:0.3em] uppercase text-[#6B6B6B] hover:text-black transition-colors py-2 font-futura font-medium"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBurgerOpen(false)
              setIsCartOpen(true)
            }}
            className="text-left text-[13px] tracking-[0.2em] [word-spacing:0.3em] uppercase text-[#6B6B6B] hover:text-black transition-colors py-2 font-futura font-medium"
          >
            Cart {cartCount != null && cartCount > 0 && `(${cartCount})`}
          </button>
        </nav>
      </aside>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CartPreview isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  )
}
