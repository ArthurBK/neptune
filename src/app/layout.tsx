import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'

import './globals.css'

const inter = Inter({
  variable: '--font-sans-ui',
  subsets: ['latin'],
})

const playfair = Playfair_Display({
  variable: '--font-serif-editorial',
  subsets: ['latin'],
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-white text-[#1A1A1A] antialiased font-sans" suppressHydrationWarning>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
