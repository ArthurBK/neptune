export const CART_ID_KEY = 'neptune_cart_id'
export const CHECKOUT_URL_KEY = 'neptune_checkout_url'

export function getCartId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CART_ID_KEY)
}

export function setCartId(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CART_ID_KEY, id)
}

export function setCheckoutUrl(url: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(CHECKOUT_URL_KEY, url)
}

export function getCheckoutUrl(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CHECKOUT_URL_KEY)
}

export function clearCart(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(CART_ID_KEY)
  localStorage.removeItem(CHECKOUT_URL_KEY)
}

export const CART_UPDATED_EVENT = 'neptune-cart-updated'
export const CART_OPEN_EVENT = 'neptune-open-cart'

export function dispatchCartUpdated(cart?: unknown): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(CART_UPDATED_EVENT, cart != null ? { detail: { cart } } : {})
    )
  }
}

export function dispatchOpenCart(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT))
  }
}
