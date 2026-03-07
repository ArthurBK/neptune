import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-[#1A1A1A] antialiased font-sans font-light" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
