import { defineDocuments, defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

export function articlePreviewPath(slug: unknown): string | null {
  return typeof slug === 'string' && slug.trim()
    ? `/stories/${encodeURIComponent(slug.trim())}`
    : null
}

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments: defineDocuments([
    { route: '/stories/:slug', filter: '_type == "article" && slug.current == $slug' },
  ]),
  locations: {
    article: defineLocations({
      select: { title: 'title', slug: 'slug.current' },
      resolve: (document) => {
        const href = articlePreviewPath(document?.slug)
        return href
          ? { locations: [{ title: document?.title || 'Preview article', href }] }
          : { message: 'Generate a slug to preview this article. Publishing is not required.', tone: 'caution' }
      },
    }),
  },
}
