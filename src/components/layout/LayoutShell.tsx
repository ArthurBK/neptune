'use client'

import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

import { HeaderVariantProvider } from '@/contexts/HeaderVariantContext'
import type { HeaderVariant } from '@/lib/headerAppearance'
import { StoriesVisibilityProvider } from '@/components/shared/StoriesPageLink'
import { FooterVisibilityProvider, useFooterVisibility } from '@/contexts/FooterVisibilityContext'
import { NewsletterModalProvider } from '@/contexts/NewsletterModalContext'

import { CookieBanner } from './CookieBanner'
import { Footer } from './Footer'
import { Header } from './Header'

function getCookieBannerLocale(pathname: string | null): 'en' | 'fr' {
  const firstSegment = pathname?.split('/').filter(Boolean)[0]?.toLowerCase()

  return firstSegment === 'fr' ? 'fr' : 'en'
}

function LayoutShellInner({
  children,
  instagramUrl,
  cookieBannerLocale,
  isHomePage,
  showShop,
  showStories,
  showContributors,
}: {
  children: React.ReactNode
  instagramUrl?: string | null
  cookieBannerLocale: 'en' | 'fr'
  isHomePage: boolean
  showShop: boolean
  showStories: boolean
  showContributors: boolean
}) {
  const { isFooterSuppressed } = useFooterVisibility()

  return (
    <>
      <Header isHomePage={isHomePage} showShop={showShop} showStories={showStories} showContributors={showContributors} />
      <div className="flex-1 min-h-0 min-w-0 pt-(--header-height)">{children}</div>
      {!isFooterSuppressed && <Footer instagramUrl={instagramUrl} />}
      <CookieBanner locale={cookieBannerLocale} />
    </>
  )
}

export function LayoutShell({
  children,
  instagramUrl,
  showShop = true,
  showStories = true,
  showContributors = true,
  isPreview = false,
  initialHomeHeaderVariant = 'dark',
}: {
  children: React.ReactNode
  instagramUrl?: string | null
  showShop?: boolean
  showStories?: boolean
  showContributors?: boolean
  isPreview?: boolean
  initialHomeHeaderVariant?: HeaderVariant
}) {
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()
  const isStudio = pathname?.startsWith('/studio')
  // Vercel can regenerate the homepage with the internal pathname /index.
  // The selected route segment still identifies the actual homepage in SSR
  // and hydration, so the cached HTML cannot start with a solid header.
  const isHome = segment === null
  const cookieBannerLocale = getCookieBannerLocale(pathname)

  if (isStudio) {
    return <div className="flex-1 min-h-0 min-w-0">{children}</div>
  }

  return (
    <StoriesVisibilityProvider value={showStories}>
      <HeaderVariantProvider initialVariant={isHome ? initialHomeHeaderVariant : 'light'}>
        <FooterVisibilityProvider>
          <NewsletterModalProvider autoOpen={isHome && !isPreview}>
            <LayoutShellInner instagramUrl={instagramUrl} cookieBannerLocale={cookieBannerLocale} isHomePage={isHome} showShop={showShop} showStories={showStories} showContributors={showContributors}>
              {children}
            </LayoutShellInner>
          </NewsletterModalProvider>
        </FooterVisibilityProvider>
      </HeaderVariantProvider>
    </StoriesVisibilityProvider>
  )
}
