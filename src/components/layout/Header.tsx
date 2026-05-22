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

const DESKTOP_NAV_ITEMS = [
  { label: 'NEWSSTAND', href: '/newsstand' },
  { label: 'STORIES', href: '/stories' },
] as const

const BURGER_NAV_ITEMS = [
  { label: 'NEWSSTAND', href: '/newsstand' },
  { label: 'STORIES', href: '/stories' },
  { label: 'SHOP', href: '/the-market' },
  { label: 'CONTRIBUTORS', href: '/contributors' },
  { label: 'NEWSLETTER', href: '/newsletters' },
  { label: 'CONTACT', href: '/contact' },
] as const

/** True for `/`, ``, trailing-slash only, and other empty-looking paths — avoids a white header flash on home when usePathname is briefly empty. */
function isHomePath(path: string): boolean {
  const trimmed = path.trim()
  if (!trimmed) return true
  return trimmed.replace(/\/+$/, '') === ''
}

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
  const textClass = transparent ? 'text-white' : 'text-black'

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-baseline h-5 md:h-6 leading-none font-futura font-medium text-[13px] tracking-[0.1em] [word-spacing:0.15em] uppercase transition-colors duration-300 ${bold ? 'font-bold' : ''} ${textClass} ${className ?? ''}`}
    >
      {label}
    </Link>
  )
}

export function Header() {
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
    const initialCartCountTimer = window.setTimeout(() => {
      fetchCartCount()
    }, 0)
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
      window.clearTimeout(initialCartCountTimer)
      window.removeEventListener('neptune-cart-updated', cartUpdatedHandler)
      window.removeEventListener(CART_OPEN_EVENT, openCartHandler)
    }
  }, [fetchCartCount])

  // usePathname() drives re-renders on every navigation and is the single source of truth.
  // isHomePath treats null/''/trailing-slash-only as home, covering any brief empty value
  // during hydration without needing a window.location fallback.
  const pathname = usePathname() ?? '/'
  const isHomePage = isHomePath(pathname)
  const hasSolidBg = !isHomePage
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
    background: hasSolidBg ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
    backdropFilter: hasSolidBg ? 'saturate(180%) blur(10px)' : 'none',
    borderColor: 'transparent',
  }
  const iconClass = lightText
    ? 'text-white hover:text-white/90 transition-colors duration-300'
    : 'text-black hover:text-[#63382E] transition-colors duration-300'

  return (
    <header className={headerClass} style={headerStyle} suppressHydrationWarning>
      <div className="relative flex flex-1 w-full min-w-0 px-4 sm:px-6 md:px-8 lg:px-10 py-1.5 md:py-2.5 overflow-visible shrink-0 items-center">
        {/* Left: burger + primary links | Center: logo (desktop) | Right: cart + search */}
        <div className="relative flex items-center w-full min-w-0 min-h-[1.5rem] md:min-h-0">
          <div className="flex shrink-0 items-center gap-3 md:gap-4 z-10">
            <button
              type="button"
              aria-label={isBurgerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isBurgerOpen}
              onClick={() => setIsBurgerOpen((prev) => !prev)}
              className={`shrink-0 w-10 h-10 flex flex-col justify-center items-center gap-1.5 ${iconClass}`}
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
            <div className="hidden lg:flex items-center gap-4 md:gap-5">
              {DESKTOP_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  transparent={lightText}
                  className="shrink-0 md:h-10 md:items-center"
                />
              ))}
            </div>
          </div>

          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 min-w-0 items-baseline justify-center md:mt-0">
            <Link href="/" className="shrink-0 flex items-baseline">
              <Image
                src="/neptune_logo_dark.svg"
                alt="Neptune"
                width={110}
                height={30}
                className={`inline-block align-baseline h-4 w-auto md:h-5 md:max-h-5 transition-[filter] duration-300 ${lightText ? 'invert' : ''}`}
                priority
              />
            </Link>
          </div>

          <div className="flex-1 min-w-0 lg:hidden" aria-hidden />

          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 lg:hidden"
          >
            <Image
              src="/neptune_logo_dark.svg"
              alt="Neptune"
              width={110}
              height={30}
              className={`block h-4 w-auto transition-[filter] duration-300 ${lightText ? 'invert' : ''}`}
            />
          </Link>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex shrink-0 items-center justify-end z-10">
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
              className={`relative w-10 h-10 flex items-center justify-center overflow-visible shrink-0 -ml-2 ${iconClass}`}
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
      </div>

      {/* Burger menu drawer — lives inside the header in the DOM but
          fixed-positioned to the viewport. overflow-x-hidden has been
          removed from the header so iOS Safari cannot clip this panel. */}
      <div
        className={`fixed inset-0 z-40 bg-transparent ${isBurgerOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onClick={() => setIsBurgerOpen(false)}
        aria-hidden
      />
      <aside
        className={`fixed top-0 left-0 h-dvh w-64 max-w-[75vw] z-50 bg-white border-r border-[#E5E5E5] shadow-xl transition-transform duration-300 ease-out overflow-y-auto overscroll-contain ${isBurgerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!isBurgerOpen}
        style={{ WebkitOverflowScrolling: 'touch' } as CSSProperties}
      >
        <nav className="flex min-h-full flex-col gap-3 px-6 pt-8 pb-12">
          {BURGER_NAV_ITEMS.map((item) => (
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
