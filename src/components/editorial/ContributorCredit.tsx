import Link from 'next/link'
import type { ReactNode } from 'react'

export function ContributorCredit({
  href,
  className,
  children,
}: {
  href?: string | null
  className?: string
  children: ReactNode
}) {
  return href ? (
    <Link href={href} className={`${className ?? ''} hover:text-black hover:underline`}>
      {children}
    </Link>
  ) : (
    <span className={className}>{children}</span>
  )
}
