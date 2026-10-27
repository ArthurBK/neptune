import type { Metadata } from 'next'
import { EB_Garamond, Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { sanityFetch } from '@/sanity/lib/client'
import { HOME_MENU_QUERY, SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { getHeaderVariant, type HeaderAppearance } from '@/lib/headerAppearance'
import { isMarketVisible } from '@/sanity/lib/market'
import { isStoriesVisible } from '@/sanity/lib/stories'
import { LayoutShell } from '@/components/layout/LayoutShell'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const ebGaramond = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-eb-garamond-source',
  display: 'swap',
})

const cormorantGaramond = localFont({
  src: [
    {
      path: '../../public/fonts/Cormorant_Garamond/static/CormorantGaramond-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Cormorant_Garamond/static/CormorantGaramond-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Cormorant_Garamond/static/CormorantGaramond-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Cormorant_Garamond/CormorantGaramond-Italic-VariableFont_wght.ttf',
      weight: '300 700',
      style: 'italic',
    },
  ],
  variable: '--font-cormorant',
  display: 'swap',
})

const gillSans = localFont({
  src: [
    {
      path: '../../public/fonts/gill-sans-2/Gill Sans Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/gill-sans-2/Gill Sans.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-gill-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Neptune',
  description: 'Luxury editorial magazine',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [settings, showShop, homeMenu, showStories] = await Promise.all([
    sanityFetch<{ instagramUrl?: string | null } | null>(SITE_SETTINGS_QUERY),
    isMarketVisible(),
    sanityFetch<{ type?: string; menuAppearance?: HeaderAppearance | null } | null>(HOME_MENU_QUERY),
    isStoriesVisible(),
  ])
  const instagramUrl = settings?.instagramUrl ?? null

  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${ebGaramond.variable} ${inter.variable} ${gillSans.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col bg-white text-[#1A1A1A] antialiased font-sans font-light" suppressHydrationWarning>
        <LayoutShell
          instagramUrl={instagramUrl}
          showShop={showShop}
          showStories={showStories}
          initialHomeHeaderVariant={getHeaderVariant(homeMenu?.menuAppearance, homeMenu?.type, 0)}
        >{children}</LayoutShell>
      </body>
    </html>
  )
}
