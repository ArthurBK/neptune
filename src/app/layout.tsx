import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { client } from '@/sanity/lib/client'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'
import { LayoutShell } from '@/components/layout/LayoutShell'

import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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

export const metadata: Metadata = {
  title: 'Neptune',
  description: 'Luxury editorial magazine',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await client.fetch<{ instagramUrl?: string | null } | null>(
    SITE_SETTINGS_QUERY
  )
  const instagramUrl = settings?.instagramUrl ?? null

  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-[#1A1A1A] antialiased font-sans font-light" suppressHydrationWarning>
        <LayoutShell instagramUrl={instagramUrl}>{children}</LayoutShell>
      </body>
    </html>
  )
}
