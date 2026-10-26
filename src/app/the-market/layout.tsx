import { notFound } from 'next/navigation'

import { isMarketVisible } from '@/sanity/lib/market'

export default async function MarketLayout({ children }: { children: React.ReactNode }) {
  if (!(await isMarketVisible())) notFound()

  return children
}
