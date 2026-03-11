'use client'

import { usePathname } from 'next/navigation'

import { HeaderVariantProvider } from '@/contexts/HeaderVariantContext'

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
    return <main className="flex-1 min-w-0">{children}</main>
  }

  return (
    <HeaderVariantProvider>
      <Header />
      <main className="flex-1 min-w-0 pt-(--header-height)">
        {children}
      </main>
      {!isHome && <Footer instagramUrl={instagramUrl} />}
    </HeaderVariantProvider>
  )
}
