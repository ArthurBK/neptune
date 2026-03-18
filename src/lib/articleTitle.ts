/** Use for cards, nav, alt text, SEO — titles may contain newlines from Sanity. */
export function articleTitleSingleLine(title: string): string {
  return title.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()
}
