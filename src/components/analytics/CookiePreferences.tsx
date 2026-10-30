'use client'

import { resetCookieConsentValue } from '@/lib/cookieConsent'

export function CookiePreferences() {
  return (
    <button type="button" onClick={() => {
      resetCookieConsentValue()
      // Unload third-party scripts and reopen the banner with no saved preference.
      window.location.reload()
    }} className="text-sm underline underline-offset-4">
      Change cookie preferences
    </button>
  )
}
