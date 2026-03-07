import { type SchemaTypeDefinition } from 'sanity'

import {
  adBannerEmbedBlock,
  article,
  pteImageBlock,
} from './article'
import { adBanner } from './adBanner'
import { affiliateProduct } from './affiliateProduct'
import { contributor } from './contributor'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    article,
    contributor,
    affiliateProduct,
    adBanner,
    siteSettings,
    pteImageBlock,
    adBannerEmbedBlock,
  ],
}
