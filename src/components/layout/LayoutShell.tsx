'use client'

import { usePathname } from 'next/navigation'

import { HeaderVariantProvider } from '@/contexts/HeaderVariantContext'
import { FooterVisibilityProvider, useFooterVisibility } from '@/contexts/FooterVisibilityContext'
import { NewsletterModalProvider } from '@/contexts/NewsletterModalContext'

import { CookieBanner } from './CookieBanner'
import { Footer } from './Footer'
import { Header } from './Header'

function LayoutShellInner({
  children,
  instagramUrl,
}: {
  children: React.ReactNode
  instagramUrl?: string | null
}) {
  const { isFooterSuppressed } = useFooterVisibility()

  return (
    <>
      <Header />
      <div className="flex-1 min-h-0 min-w-0 pt-(--header-height)">{children}</div>
      {!isFooterSuppressed && <Footer instagramUrl={instagramUrl} />}
      <CookieBanner />
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
  const isStudio = pathname?.startsWith('/studio')
  const isHome = !pathname || pathname === '/' || pathname.replace(/\/+$/, '') === ''

  if (isStudio) {
    return <div className="flex-1 min-h-0 min-w-0">{children}</div>
  }

  return (
    <HeaderVariantProvider initialVariant={isHome ? 'dark' : 'light'}>
      <FooterVisibilityProvider>
        <NewsletterModalProvider>
          <LayoutShellInner instagramUrl={instagramUrl}>{children}</LayoutShellInner>
        </NewsletterModalProvider>
      </FooterVisibilityProvider>
    </HeaderVariantProvider>
  )
}
