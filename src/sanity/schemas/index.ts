import type { SchemaTypeDefinition } from 'sanity'

import {
  adBannerEmbedBlock,
  article,
  pteImageBlock,
  pteImageGridBlock,
} from './article'
import { adBanner } from './adBanner'
import { client } from './client'
import { affiliateProduct } from './affiliateProduct'
import { contributor } from './contributor'
import { photographer } from './photographer'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    article,
    client,
    contributor,
    photographer,
    affiliateProduct,
    adBanner,
    siteSettings,
    pteImageBlock,
    pteImageGridBlock,
    adBannerEmbedBlock,
  ],
}
