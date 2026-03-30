'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  clearCart,
  CART_UPDATED_EVENT,
  dispatchCartUpdated,
  getCartId,
  setCheckoutUrl,
} from '@/lib/cart'
import { formatPrice } from '@/lib/shopify/types'

type CartLine = {
  id: string
  quantity: number
  merchandise: {
    id: string
    title: string
    price: { amount: string; currencyCode: string }
    product: {
      title: string
      handle: string
      featuredImage: { url: string; altText: string | null } | null
    }
  }
}

type Cart = {
  id: string
  checkoutUrl: string | null
  totalQuantity: number
  lines: { edges: Array<{ node: CartLine }> }
}

interface CartPreviewProps {
  isOpen: boolean
  onClose: () => void
}

function applyCartUpdate(
  cart: Cart | null,
  lineId: string,
  update: { quantity?: number; remove?: boolean }
): Cart | null {
  if (!cart?.lines?.edges) return cart
  if (update.remove) {
    const edges = cart.lines.edges.filter((e) => e.node.id !== lineId)
    const totalQuantity = edges.reduce((sum, e) => sum + e.node.quantity, 0)
    return { ...cart, lines: { edges }, totalQuantity }
  }
  const edges = cart.lines.edges.map((e) => {
    if (e.node.id !== lineId) return e
    return { ...e, node: { ...e.node, quantity: update.quantity ?? e.node.quantity } }
  })
  const totalQuantity = edges.reduce((sum, e) => sum + e.node.quantity, 0)
  return { ...cart, lines: { edges }, totalQuantity }
}

export function CartPreview({ isOpen, onClose }: CartPreviewProps) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [updatingLineId, setUpdatingLineId] = useState<string | null>(null)
  const cartRef = useRef<Cart | null>(null)
  cartRef.current = cart

  const fetchCart = useCallback(async (showLoading = true) => {
    const cartId = getCartId()
    if (!cartId) {
      setCart(null)
      return
    }
    if (showLoading) setIsLoading(true)
    try {
      const res = await fetch(
        `/api/cart?cartId=${encodeURIComponent(cartId)}&_t=${Date.now()}`,
        { cache: 'no-store' }
      )
      const data = await res.json()
      setCart(data.cart ?? null)
    } catch {
      setCart(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) fetchCart(!cartRef.current)
  }, [isOpen, fetchCart])

  useEffect(() => {
    const handler = (e: Event) => {
      const cart = (e as CustomEvent<{ cart?: Cart | null }>)?.detail?.cart
      if (cart !== undefined && cart != null && cart?.lines?.edges != null) {
        setCart(cart)
      } else if (cart !== undefined && cart == null) {
        setCart(null)
      } else {
        fetchCart(false)
      }
    }
    window.addEventListener(CART_UPDATED_EVENT, handler)
    return () => window.removeEventListener(CART_UPDATED_EVENT, handler)
  }, [fetchCart])

  async function updateQuantity(lineId: string, quantity: number) {
    const cartId = getCartId()
    if (!cartId || quantity < 0) return
    if (quantity === 0) {
      await removeLine(lineId)
      return
    }
    setUpdatingLineId(lineId)
    setCart((prev) => applyCartUpdate(prev, lineId, { quantity }))
    try {
      const res = await fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, lineId, quantity }),
        cache: 'no-store',
      })
      const data = await res.json()
      if (res.ok && data.cart) {
        if (data.cart.checkoutUrl) setCheckoutUrl(data.cart.checkoutUrl)
        if (data.cart.totalQuantity === 0) clearCart()
        setCart(data.cart)
        dispatchCartUpdated(data.cart)
      } else {
        await fetchCart()
      }
    } catch {
      await fetchCart()
    } finally {
      setUpdatingLineId(null)
    }
  }

  async function removeLine(lineId: string) {
    const cartId = getCartId()
    if (!cartId) return
    setUpdatingLineId(lineId)
    setCart((prev) => applyCartUpdate(prev, lineId, { remove: true }))
    try {
      const res = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId, lineIds: [lineId] }),
        cache: 'no-store',
      })
      const data = await res.json()
      if (res.ok && data.cart) {
        if (data.cart.checkoutUrl) setCheckoutUrl(data.cart.checkoutUrl)
        if (data.cart.totalQuantity === 0) clearCart()
        setCart(data.cart)
        dispatchCartUpdated(data.cart)
      } else {
        await fetchCart()
      }
    } catch {
      await fetchCart()
    } finally {
      setUpdatingLineId(null)
    }
  }

  if (!isOpen) return null

  const lines = cart?.lines?.edges?.map((e) => e.node) ?? []
  const isEmpty = lines.length === 0

  return (
    <div
      className="fixed inset-0 z-[100] md:bg-black/20"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Cart"
      tabIndex={-1}
    >
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl md:top-[var(--header-height)] md:h-auto md:max-h-[calc(100vh-var(--header-height))]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <div className="relative flex items-center justify-center border-b border-[#E5E5E5] px-6 py-4">
            <h2 className="font-futura text-xl uppercase tracking-wide">Cart</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close cart"
              className="absolute right-4 p-2 text-[#6B6B6B] hover:text-black transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <title>Close</title>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading ? (
              <p className="py-8 text-center text-[#6B6B6B]">Loading…</p>
            ) : isEmpty ? (
              <p className="py-12 text-center text-[#6B6B6B]">Your cart is empty</p>
            ) : (
              <ul className="space-y-6">
                {lines.map((line) => {
                  const merch = line.merchandise
                  const product = merch.product
                  const isUpdating = updatingLineId === line.id
                  return (
                    <li key={line.id} className="flex gap-4 border-b border-[#E5E5E5] pb-6 last:border-0">
                      {product.featuredImage?.url && (
                        <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#E5E5E5]">
                          <Image
                            src={product.featuredImage.url}
                            alt={product.featuredImage.altText ?? product.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-sm text-[#1A1A1A]">{product.title}</p>
                        {merch.title !== 'Default Title' && (
                          <p className="text-xs text-[#6B6B6B]">{merch.title}</p>
                        )}
                        <p className="mt-1 text-sm font-medium">
                          {formatPrice(merch.price.amount, merch.price.currencyCode)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            disabled={isUpdating || line.quantity <= 1}
                            className="h-8 w-8 border border-[#E5E5E5] text-[#6B6B6B] hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm">{line.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            disabled={isUpdating}
                            className="h-8 w-8 border border-[#E5E5E5] text-[#6B6B6B] hover:border-black hover:text-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            disabled={isUpdating}
                            className="ml-2 text-xs text-[#6B6B6B] underline hover:text-black disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {!isEmpty && cart?.checkoutUrl && (
            <div className="border-t border-[#E5E5E5] p-6">
              <Link
                href={cart.checkoutUrl}
                onClick={onClose}
                className="font-header block w-full bg-black py-3 text-center text-sm font-medium uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-80"
              >
                Checkout
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
