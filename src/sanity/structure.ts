import { BasketIcon, CogIcon, HomeIcon } from '@sanity/icons'
import type { StructureResolver } from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home Page')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('Category Pages')
        .icon(HomeIcon)
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
      ...S.documentTypeListItems().filter(
        (item) =>
          item.getId() !== 'siteSettings' &&
          item.getId() !== 'homePage' &&
          item.getId() !== 'categoryPage' &&
          item.getId() !== 'marketPage'
      ),
    ])
