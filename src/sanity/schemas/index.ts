import type { SchemaTypeDefinition } from 'sanity'

import {
  adBannerEmbedBlock,
  article,
  pteImageBlock,
  pteImageGridBlock,
} from './article'
import { adBanner } from './adBanner'
import {
  homeArticleBlock,
  homeImageBlock,
  homeNewsstandBlock,
  homeNewsletterBlock,
  homePage,
  homeProductBlock,
  homeVideoBlock,
} from './homePage'
import { affiliateProduct } from './affiliateProduct'
import { storiesPage } from './storiesPage'
import { contributorsPage } from './contributorsPage'
import { contributor } from './contributor'
import { photographer } from './photographer'
import { siteSettings } from './siteSettings'
import { marketPage } from './marketPage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    article,
    storiesPage,
    contributorsPage,
    homePage,
    homeArticleBlock,
    homeImageBlock,
    homeProductBlock,
    homeNewsstandBlock,
    homeNewsletterBlock,
    homeVideoBlock,
    contributor,
    photographer,
    affiliateProduct,
    marketPage,
    adBanner,
    siteSettings,
    pteImageBlock,
    pteImageGridBlock,
    adBannerEmbedBlock,
  ],
}
