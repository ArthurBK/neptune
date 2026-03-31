'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type FooterVisibilityContextValue = {
  isFooterSuppressed: boolean
  suppressFooter: () => void
  restoreFooter: () => void
}

const FooterVisibilityContext = createContext<FooterVisibilityContextValue>({
  isFooterSuppressed: false,
  suppressFooter: () => {},
  restoreFooter: () => {},
})

export function FooterVisibilityProvider({ children }: { children: ReactNode }) {
  const [isFooterSuppressed, setIsFooterSuppressed] = useState(false)

  const suppressFooter = useCallback(() => setIsFooterSuppressed(true), [])
  const restoreFooter = useCallback(() => setIsFooterSuppressed(false), [])

  return (
    <FooterVisibilityContext.Provider value={{ isFooterSuppressed, suppressFooter, restoreFooter }}>
      {children}
    </FooterVisibilityContext.Provider>
  )
}

export function useFooterVisibility() {
  return useContext(FooterVisibilityContext)
}
