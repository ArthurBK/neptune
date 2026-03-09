'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type HeaderVariant = 'light' | 'dark'

type HeaderVariantContextValue = {
  variant: HeaderVariant
  setVariant: (v: HeaderVariant) => void
}

const HeaderVariantContext = createContext<HeaderVariantContextValue>({
  variant: 'light',
  setVariant: () => {},
})

export function HeaderVariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariant] = useState<HeaderVariant>('light')
  return (
    <HeaderVariantContext.Provider value={{ variant, setVariant }}>
      {children}
    </HeaderVariantContext.Provider>
  )
}

export function useHeaderVariant(): HeaderVariant {
  const { variant } = useContext(HeaderVariantContext)
  return variant
}

export function useSetHeaderVariant(): (v: HeaderVariant) => void {
  const { setVariant } = useContext(HeaderVariantContext)
  return setVariant
}
