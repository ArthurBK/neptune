import type { ReactNode } from 'react'

export function PortableTextLink({ value, children }: {
  value?: { href?: string; blank?: boolean }
  children: ReactNode
}) {
  const href = typeof value?.href === 'string' ? value.href.trim() : ''
  // Preserve the text if old or imported content contains an unsafe URL.
  if (!href || /[\u0000-\u001f\u007f\\]/.test(href)) {
    return <>{children}</>
  }
  try {
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(new URL(href, 'https://neptune-papers.com').protocol)) {
      return <>{children}</>
    }
  } catch {
    return <>{children}</>
  }
  return (
    <a
      href={href}
      target={value?.blank ? '_blank' : undefined}
      rel={value?.blank ? 'noopener noreferrer' : undefined}
      className="underline underline-offset-2 hover:no-underline"
    >
      {children}
    </a>
  )
}
