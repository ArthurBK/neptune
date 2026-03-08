'use client'

import { usePathname } from 'next/navigation'

import { Footer } from './Footer'
import { Header } from './Header'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isStudio = pathname?.startsWith('/studio')

  return (
    <>
      {!isStudio && <Header />}
      <main className="flex-1">{children}</main>
      {!isStudio && <Footer />}
    </>
  )
}
