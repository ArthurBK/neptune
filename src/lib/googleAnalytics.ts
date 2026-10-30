import { getCookieConsentValue } from './cookieConsent'

export const GA_MEASUREMENT_ID = 'G-YHCN71B9JT'
const SCRIPT_ID = 'neptune-google-analytics'
const DISABLED_KEY = `ga-disable-${GA_MEASUREMENT_ID}` as const
const SCROLL_THRESHOLDS = [25, 50, 75, 90]

type AnalyticsWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  [DISABLED_KEY]?: boolean
}
type PageContext = { pathname: string; isPreview: boolean; production: boolean }

let initialized = false
let currentContext: PageContext | undefined
let lastPage: string | undefined
let previousLocation: string | undefined
const reachedScrollThresholds = new Set<number>()

function analyticsWindow() {
  return window as AnalyticsWindow
}

export function isAnalyticsPage({ pathname, isPreview, production }: PageContext, hostname: string) {
  return production && !isPreview && hostname === 'neptune-papers.com'
    && !/^\/(studio|api)(\/|$)/.test(pathname)
}

function canTrack() {
  return typeof window !== 'undefined' && currentContext
    && isAnalyticsPage(currentContext, window.location.hostname)
    && currentContext.pathname === window.location.pathname
    && analyticsContentReady(currentContext.pathname)
    && getCookieConsentValue() === 'true'
    && analyticsWindow()[DISABLED_KEY] === false
}

function articleDetails() {
  const article = document.querySelector<HTMLElement>('article[data-analytics-article-id]')
  return article ? {
    article_id: article.dataset.analyticsArticleId,
    article_title: article.dataset.analyticsArticleTitle,
  } : {}
}

function pageLocation() {
  // Do not send arbitrary query parameters, email addresses, or preview secrets.
  const url = new URL(window.location.pathname, window.location.origin)
  const current = new URL(window.location.href)
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
    const value = current.searchParams.get(key)
    if (value) url.searchParams.set(key, value)
  }
  return url.href
}

function cleanReferrer(referrer: string) {
  if (!referrer) return ''
  try {
    const url = new URL(referrer)
    return /^https?:$/.test(url.protocol) ? `${url.origin}${url.pathname}` : ''
  } catch {
    return ''
  }
}

function clearAnalyticsCookies() {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0]
    if (name !== '_ga' && !name.startsWith('_ga_')) continue
    for (const domain of ['', window.location.hostname, '.neptune-papers.com']) {
      document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ''}`
    }
  }
}

export function disableGoogleAnalytics() {
  if (typeof window === 'undefined') return
  analyticsWindow()[DISABLED_KEY] = true
}

export function analyticsContentReady(pathname: string) {
  if (/^\/stories\/[^/]+\/?$/.test(pathname)) {
    return document.querySelector<HTMLElement>('article[data-analytics-article-path]')
      ?.dataset.analyticsArticlePath === pathname.replace(/\/$/, '')
  }
  return !!document.querySelector('main')
}

export function syncGoogleAnalytics(context: PageContext) {
  currentContext = context
  const target = analyticsWindow()
  const consent = getCookieConsentValue() === 'true'
  if (!consent || context.pathname !== window.location.pathname || !isAnalyticsPage(context, window.location.hostname)) {
    disableGoogleAnalytics()
    lastPage = undefined
    reachedScrollThresholds.clear()
    if (!consent && initialized) clearAnalyticsCookies()
    return
  }

  // Next.js can stream the article after the shared layout has hydrated.
  if (!analyticsContentReady(context.pathname)) return
  target[DISABLED_KEY] = false
  if (!initialized) {
    target.dataLayer = target.dataLayer || []
    // Google's command queue expects Arguments objects, not plain arrays.
    // eslint-disable-next-line prefer-rest-params
    target.gtag = function () { target.dataLayer!.push(arguments) }
    target.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied',
    })
    target.gtag('js', new Date())
    target.gtag('set', { page_location: pageLocation(), page_referrer: cleanReferrer(document.referrer) })
    target.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 365 * 86400,
    })
    initialized = true
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(script)
    }
  }

  if (!canTrack() || lastPage === context.pathname) return
  const article = articleDetails()
  const location = pageLocation()
  const page = {
    page_location: location,
    page_title: article.article_title
      ? `${article.article_title.replace(/\s+/g, ' ').trim()} | Neptune Papers`
      : document.querySelector('main h1')?.textContent?.trim() || document.title,
    page_referrer: previousLocation ?? cleanReferrer(document.referrer),
    content_group: article.article_id ? 'Stories' : context.pathname.split('/')[1] || 'Home',
  }
  target.gtag?.('set', page)
  target.gtag?.('event', 'page_view', { ...page, ...article, send_to: GA_MEASUREMENT_ID })
  lastPage = context.pathname
  previousLocation = location
  reachedScrollThresholds.clear()
}

export function trackArticleScroll() {
  if (!canTrack()) return
  const body = document.querySelector<HTMLElement>('[data-analytics-reading-body]')
  if (!body || document.visibilityState === 'hidden') return
  const rect = body.getBoundingClientRect()
  if (rect.height <= 0) return
  const percent = Math.min(100, Math.max(0, (window.innerHeight - rect.top) / rect.height * 100))
  for (const threshold of SCROLL_THRESHOLDS) {
    if (percent < threshold || reachedScrollThresholds.has(threshold)) continue
    reachedScrollThresholds.add(threshold)
    analyticsWindow().gtag?.('event', 'article_scroll', {
      ...articleDetails(), percent_scrolled: threshold,
      page_location: pageLocation(), send_to: GA_MEASUREMENT_ID,
    })
  }
}

export function trackNewsletterSignup() {
  if (!canTrack()) return
  analyticsWindow().gtag?.('event', 'newsletter_signup', {
    ...articleDetails(), method: 'newsletter_form',
    page_location: pageLocation(), send_to: GA_MEASUREMENT_ID,
  })
}
