'use client'

import { usePathname } from 'next/navigation'

import { HeaderVariantProvider } from '@/contexts/HeaderVariantContext'
import { NewsletterModalProvider } from '@/contexts/NewsletterModalContext'

import { Footer } from './Footer'
import { Header } from './Header'

export function LayoutShell({
  children,
  instagramUrl,
}: {
  children: React.ReactNode
  instagramUrl?: string | null
}) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith('/studio')
  const isHome = pathname === '/'

  if (isStudio) {
    return <div className="flex-1 min-h-0 min-w-0">{children}</div>
  }

  return (
    <HeaderVariantProvider>
      <NewsletterModalProvider>
        <Header />
        <div className="flex-1 min-h-0 min-w-0 pt-(--header-height)">{children}</div>
        {!isHome && <Footer instagramUrl={instagramUrl} />}
      </NewsletterModalProvider>
    </HeaderVariantProvider>
  )
}
