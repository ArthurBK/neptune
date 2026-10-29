type MagazineProduct = { title: string; createdAt?: string }

const smallNumbers = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen',
]
const tens: Record<string, number> = {
  twenty: 20, thirty: 30, forty: 40, fifty: 50,
  sixty: 60, seventy: 70, eighty: 80, ninety: 90,
}

function titleNumber(title: string, label: 'issue' | 'cover'): number | null {
  const match = title.toLowerCase().match(
    new RegExp(`\\b${label}\\s+(\\d+|[a-z]+(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?)\\b`),
  )
  if (!match) return null
  const value = match[1]
  if (/^\d+$/.test(value)) return Number(value)
  const small = smallNumbers.indexOf(value)
  if (small >= 0) return small
  const [ten, unit] = value.split(/[- ]/)
  return tens[ten] ? tens[ten] + (unit ? smallNumbers.indexOf(unit) : 0) : null
}

/** Latest issue first, then Cover One, Two, Three… using titles rather than legacy URLs. */
export function sortNewsstandProducts<T extends MagazineProduct>(products: T[]): T[] {
  return products
    .map(product => ({
      product,
      issue: titleNumber(product.title, 'issue'),
      cover: titleNumber(product.title, 'cover'),
      created: product.createdAt ? Date.parse(product.createdAt) || 0 : 0,
    }))
    .sort((a, b) => {
      const issueOrder = (b.issue ?? -1) - (a.issue ?? -1)
      if (issueOrder) return issueOrder
      if (a.issue !== null && b.issue !== null) {
        const coverOrder = (a.cover ?? Number.MAX_SAFE_INTEGER) - (b.cover ?? Number.MAX_SAFE_INTEGER)
        if (coverOrder) return coverOrder
      }
      return b.created - a.created
    })
    .map(({ product }) => product)
}
