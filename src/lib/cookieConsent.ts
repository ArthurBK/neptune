import { Cookies, getCookieConsentValue as readCookie } from 'react-cookie-consent'

export const COOKIE_CONSENT_NAME = 'neptune_cookie_consent'
export const COOKIE_CONSENT_DAYS = 365
const CONSENT_CHANGED_EVENT = 'neptune-consent-changed'
type Consent = 'true' | 'false'

function isConsent(value: unknown): value is Consent {
  return value === 'true' || value === 'false'
}

export function consentCookieOptions() {
  const hostname = typeof window === 'undefined' ? '' : window.location.hostname
  return {
    path: '/',
    ...(hostname === 'neptune-papers.com' || hostname === 'www.neptune-papers.com'
      ? { domain: 'neptune-papers.com' }
      : {}),
  }
}

export function getCookieConsentValue(): Consent | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const value = readCookie(COOKIE_CONSENT_NAME)
    if (isConsent(value)) return value
  } catch {
    // Storage access can be restricted by browser privacy settings.
  }
  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_NAME)
    if (!raw) return undefined
    const saved = JSON.parse(raw)
    if (isConsent(saved?.value) && typeof saved.expiresAt === 'number' && saved.expiresAt > Date.now()) {
      return saved.value
    }
  } catch {
    // Ignore unavailable storage or a malformed saved preference.
  }
  return undefined
}

export function saveCookieConsent(value: Consent): void {
  if (typeof window === 'undefined') return
  try {
    Cookies.set(COOKIE_CONSENT_NAME, value, {
      ...consentCookieOptions(),
      expires: COOKIE_CONSENT_DAYS,
      sameSite: 'lax',
      secure: window.location.protocol === 'https:',
    })
  } catch {
    // Keep a local preference even if cookie writes are blocked.
  }
  try {
    window.localStorage.setItem(COOKIE_CONSENT_NAME, JSON.stringify({
      value,
      expiresAt: Date.now() + COOKIE_CONSENT_DAYS * 86400000,
    }))
  } catch {
    // Cookies still retain the choice when local storage is unavailable.
  }
  window.dispatchEvent(new window.Event(CONSENT_CHANGED_EVENT))
}

export function resetCookieConsentValue(): void {
  if (typeof window === 'undefined') return
  for (const name of [COOKIE_CONSENT_NAME, `${COOKIE_CONSENT_NAME}-legacy`]) {
    try {
      Cookies.remove(name, { path: '/' })
      Cookies.remove(name, consentCookieOptions())
    } catch {
      // Cookie access may be unavailable.
    }
  }
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_NAME)
  } catch {
    // Local storage may be unavailable.
  }
  window.dispatchEvent(new window.Event(CONSENT_CHANGED_EVENT))
}

export function subscribeToCookieConsent(onChange: () => void): () => void {
  window.addEventListener(CONSENT_CHANGED_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}
