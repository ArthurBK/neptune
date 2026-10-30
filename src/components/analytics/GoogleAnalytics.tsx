'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { subscribeToCookieConsent } from '@/lib/cookieConsent'
import { analyticsContentReady, disableGoogleAnalytics, syncGoogleAnalytics, trackArticleScroll } from '@/lib/googleAnalytics'

export function GoogleAnalytics({ isPreview, production }: { isPreview: boolean; production: boolean }) {
  const pathname = usePathname()

  useEffect(() => {
    let frame = 0
    const refresh = () => {
      syncGoogleAnalytics({ pathname, isPreview, production })
      if (analyticsContentReady(pathname)) observer.disconnect()
    }
    const observer = new window.MutationObserver(refresh)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-analytics-article-path'] })
    refresh()
    const unsubscribe = subscribeToCookieConsent(refresh)
    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        trackArticleScroll()
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      unsubscribe()
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.cancelAnimationFrame(frame)
      disableGoogleAnalytics()
    }
  }, [pathname, isPreview, production])

  return null
}
