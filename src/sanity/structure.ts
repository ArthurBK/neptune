import { BasketIcon, CogIcon, DocumentTextIcon, HomeIcon } from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  (() => {
    const topSingletonIds = ['homePage', 'categoryPage', 'siteSettings', 'marketPage']

    const otherDocItems = S.documentTypeListItems().filter((item) => {
      const id = item.getId()
      return typeof id === 'string' && !topSingletonIds.includes(id)
    })

    // Prefer a stable, opinionated order for the main content types.
    const preferredOrder = [
      'article',
      'contributor',
      'photographer',
      'affiliateProduct',
      'adBanner',
    ]

    const orderedPreferred = preferredOrder
      .map((id) => otherDocItems.find((item) => item.getId() === id))
      .filter((item): item is typeof otherDocItems[number] => Boolean(item))

    const remainingOthers = otherDocItems.filter((item) => {
      const id = item.getId()
      return typeof id === 'string' && !preferredOrder.includes(id)
    })

    return S.list()
      .title('Content')
      .items([
        S.listItem()
          .title('Home Page')
          .icon(HomeIcon)
          .child(S.document().schemaType('homePage').documentId('homePage')),
        S.listItem()
          .title('Category Pages')
          .icon(DocumentTextIcon)
          .child(S.document().schemaType('categoryPage').documentId('categoryPage')),
        S.listItem()
          .title('Site Settings')
          .icon(CogIcon)
          .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
        S.listItem()
          .title('Market Page')
          .icon(BasketIcon)
          .child(S.document().schemaType('marketPage').documentId('marketPage')),
        S.divider(),
        ...orderedPreferred,
        ...remainingOthers,
      ])
  })()
