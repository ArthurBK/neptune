'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'

export function ArticlePreviewBanner() {
  const pathname = usePathname()
  const [closing, setClosing] = useState(false)
  const [error, setError] = useState(false)

  async function exitPreview() {
    setClosing(true)
    setError(false)
    try {
      const response = await fetch('/api/draft-mode/disable', { method: 'POST' })
      if (!response.ok) throw new Error('Could not exit preview')
      // A full navigation clears the client router's draft content as well.
      window.location.assign(pathname)
    } catch {
      setError(true)
      setClosing(false)
    }
  }

  return (
    <aside aria-label="Article preview" className="fixed bottom-4 left-1/2 z-[110] flex max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded bg-black px-4 py-3 text-sm text-white shadow-lg">
      <span>Preview mode</span>
      <button type="button" onClick={exitPreview} disabled={closing} className="underline underline-offset-4 disabled:opacity-50">
        {closing ? 'Exiting…' : 'Exit preview'}
      </button>
      {error && <span role="alert">Could not exit preview. Please try again.</span>}
    </aside>
  )
}
