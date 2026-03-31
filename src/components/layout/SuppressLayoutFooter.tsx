'use client'

import { useLayoutEffect } from 'react'

import { useFooterVisibility } from '@/contexts/FooterVisibilityContext'

/**
 * Suppresses the LayoutShell footer synchronously (before browser paint) for pages
 * that manage their own footer (e.g. the home page with its scroll-section footer).
 * Restores it when unmounted.
 */
export function SuppressLayoutFooter() {
  const { suppressFooter, restoreFooter } = useFooterVisibility()

  useLayoutEffect(() => {
    suppressFooter()
    return () => restoreFooter()
  }, [suppressFooter, restoreFooter])

  return null
}
