'use client'

import { usePathname, useSelectedLayoutSegment } from 'next/navigation'

import { HeaderVariantProvider } from '@/contexts/HeaderVariantContext'
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
}: {
  children: React.ReactNode
  instagramUrl?: string | null
  cookieBannerLocale: 'en' | 'fr'
  isHomePage: boolean
}) {
  const { isFooterSuppressed } = useFooterVisibility()

  return (
    <>
      <Header isHomePage={isHomePage} />
      <div className="flex-1 min-h-0 min-w-0 pt-(--header-height)">{children}</div>
      {!isFooterSuppressed && <Footer instagramUrl={instagramUrl} />}
      <CookieBanner locale={cookieBannerLocale} />
    </>
  )
}

export function LayoutShell({
  children,
  instagramUrl,
}: {
  children: React.ReactNode
  instagramUrl?: string | null
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
    <HeaderVariantProvider initialVariant={isHome ? 'dark' : 'light'}>
      <FooterVisibilityProvider>
        <NewsletterModalProvider>
          <LayoutShellInner instagramUrl={instagramUrl} cookieBannerLocale={cookieBannerLocale} isHomePage={isHome}>
            {children}
          </LayoutShellInner>
        </NewsletterModalProvider>
      </FooterVisibilityProvider>
    </HeaderVariantProvider>
  )
}
