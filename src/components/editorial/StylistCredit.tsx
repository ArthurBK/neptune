import { ContributorCredit } from './ContributorCredit'
import { formatPersonName } from '@/lib/personName'

export type StylistCreditData = { name: string; slug?: string | null }

export function StylistCredit({ stylist }: { stylist?: StylistCreditData | null }) {
  if (!stylist?.name?.trim()) return null
  return (
    <p>
      Styled by{' '}
      <ContributorCredit
        href={stylist.slug ? `/contributors/${stylist.slug}` : undefined}
        className="text-black underline-offset-2 transition-colors"
      >
        {formatPersonName(stylist.name)}
      </ContributorCredit>
    </p>
  )
}
