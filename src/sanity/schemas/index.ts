import type { SchemaTypeDefinition } from 'sanity'

import {
  adBannerEmbedBlock,
  article,
  pteImageBlock,
  pteImageGridBlock,
} from './article'
import { adBanner } from './adBanner'
import { client } from './client'
import {
  homeArticleBlock,
  homeImageBlock,
  homeNewsstandBlock,
  homePage,
  homeProductBlock,
  homeVideoBlock,
} from './homePage'
import { affiliateProduct } from './affiliateProduct'
import { categoryPage } from './categoryPage'
import { contributor } from './contributor'
import { photographer } from './photographer'
import { siteSettings } from './siteSettings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    article,
    client,
    categoryPage,
    homePage,
    homeArticleBlock,
    homeImageBlock,
    homeProductBlock,
    homeNewsstandBlock,
    homeVideoBlock,
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
