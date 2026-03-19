/** "JOHN DOE" / "john doe" → "John Doe" (première lettre de chaque mot en majuscule). */
export function formatPersonName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) =>
      word
        .split('-')
        .map((part) =>
          part.length === 0
            ? part
            : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        )
        .join('-')
    )
    .join(' ')
}
