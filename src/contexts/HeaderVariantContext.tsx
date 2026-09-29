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

export function HeaderVariantProvider({
  children,
  initialVariant = 'light',
}: {
  children: ReactNode
  initialVariant?: HeaderVariant
}) {
  const [variant, setVariant] = useState<HeaderVariant>(initialVariant)
  const [previousInitialVariant, setPreviousInitialVariant] = useState(initialVariant)

  // The layout persists across navigation. Reset before rendering its children
  // so returning home never paints the previous page's solid header.
  if (previousInitialVariant !== initialVariant) {
    setPreviousInitialVariant(initialVariant)
    setVariant(initialVariant)
  }

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
