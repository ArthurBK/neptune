'use client'

import { createContext, useContext, type ReactNode } from 'react'
import Link from 'next/link'

const StoriesVisibilityContext = createContext(true)
export const StoriesVisibilityProvider = StoriesVisibilityContext.Provider

export function StoriesPageLink({ children, className }: { children: ReactNode; className?: string }) {
  const visible = useContext(StoriesVisibilityContext)
  return visible
    ? <Link href="/stories" className={className}>{children}</Link>
    : <span className={className}>{children}</span>
}
