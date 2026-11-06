import { ContributorCredit } from './ContributorCredit'
import { formatPersonName } from '@/lib/personName'

export function WordsByCredit({ author }: { author?: { name: string; slug?: string | null } | null }) {
  if (!author?.name?.trim()) return null

  return (
    <p>
      Words by{' '}
      <ContributorCredit
        href={author.slug ? `/contributors/${author.slug}` : undefined}
        className="text-black underline-offset-2 transition-colors"
      >
        {formatPersonName(author.name)}
      </ContributorCredit>
    </p>
  )
}
