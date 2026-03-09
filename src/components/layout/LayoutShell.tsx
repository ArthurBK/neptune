'use client'

import { usePathname } from 'next/navigation'

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

  return (
    <>
      {!isStudio && !isHome && <Header />}
      <main className="flex-1 min-w-0">
        {children}
      </main>
      {!isStudio && !isHome && <Footer instagramUrl={instagramUrl} />}
    </>
  )
}
