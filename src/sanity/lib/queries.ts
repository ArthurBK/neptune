// Home page sections (configurable in Studio)
export const HOME_PAGE_QUERY = `
  *[_type == "homePage" && _id == "homePage"][0] {
    sections[] {
      _type,
      _key,
      _type == "homeArticleBlock" => {
        "article": article->{
          _id,
          title,
          "slug": slug.current,
          category,
          coverImage,
          "author": author->{ name, "slug": slug.current }
        }
      },
      _type == "homeImageBlock" => {
        image,
        alt,
        title,
        linkUrl
      },
      _type == "homeProductBlock" => {
        "product": product->{
          _id,
          title,
          image,
          affiliateUrl
        }
      },
      _type == "homeNewsstandBlock" => {
        "productHandles": productHandles[] { handle },
        title,
        description,
        ctaLabel
      },
      _type == "homeVideoBlock" => {
        "videoUrl": video.asset->url
      },
      _type == "homeNewsletterBlock" => {
        headline,
        subtitle,
        image
      }
    }
  }
`

// Featured articles for home page carousel (latest across all categories)
export const FEATURED_ARTICLES_HOME_QUERY = `
  *[_type == "article"] | order(publishedAt desc)[0...8] {
    _id,
    title,
    "slug": slug.current,
    category,
    coverImage,
    "author": author->{ name, "slug": slug.current }
  }
`

// Articles by category (for category landing pages)
export const ARTICLES_BY_CATEGORY_QUERY = `
  *[_type == "article" && category == $category] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    subcategory,
    coverImage,
    publishedAt,
    "author": author->{ name, "slug": slug.current }
  }
`

// Single article by slug and category
export const ARTICLE_BY_SLUG_QUERY = `
  *[_type == "article" && slug.current == $slug && category == $category][0] {
    ...,
    "author": author->{ name, "slug": slug.current, bio, portrait },
    "photographer": photographer->{ name, "slug": slug.current },
    "affiliateProducts": affiliateProducts[]->{ _id, title, brand, price, image, affiliateUrl },
    "relatedArticles": relatedArticles[]->{ _id, title, "slug": slug.current, category, subcategory, coverImage, "author": author->{ name, "slug": slug.current } },
    "body": body[] {
      ...,
      _type == "adBannerEmbedBlock" => {
        "adBanner": adBanner->{ image, linkUrl, title }
      },
      markDefs[] {
        ...,
        _type == "affiliateProductEmbed" => {
          "product": product->{ title, affiliateUrl }
        }
      }
    }
  }
`

// Article slugs for generateStaticParams
export const ARTICLE_SLUGS_BY_CATEGORY_QUERY = `
  *[_type == "article" && category == $category] { "slug": slug.current }
`

// All affiliate products (for neptune market)
export const AFFILIATE_PRODUCTS_QUERY = `
  *[_type == "affiliateProduct"] | order(publishedAt desc) {
    _id,
    title,
    brand,
    price,
    image,
    affiliateUrl,
    category
  }
`

// Ordered affiliate products for Market page (manual drag-and-drop order in Studio)
export const MARKET_PAGE_PRODUCTS_QUERY = `
  *[_type == "marketPage" && _id == "marketPage"][0].products[]->{
    _id,
    title,
    brand,
    price,
    image,
    affiliateUrl,
    category
  }
`

// Affiliate products by category (e.g. fashion)
export const AFFILIATE_PRODUCTS_BY_CATEGORY_QUERY = `
  *[_type == "affiliateProduct" && category == $category] | order(sortOrder asc, publishedAt desc) {
    _id,
    title,
    brand,
    price,
    image,
    affiliateUrl,
    category
  }
`

// Search articles by title or author name (match is case-insensitive natively).
// score() can't dereference (author->name), so we only score on title.
export const ARTICLES_SEARCH_QUERY = `
  *[_type == "article" && (
    title match $query ||
    author->name match $query
  )]
  | score(boost(title match $query, 2))
  | order(_score desc, publishedAt desc)[0...15] {
    _id,
    title,
    "slug": slug.current,
    category,
    coverImage,
    "author": author->{ name }
  }
`

// Search contributors by name or role (match is case-insensitive natively)
export const CONTRIBUTORS_SEARCH_QUERY = `
  *[_type == "contributor" && (
    name match $query ||
    role match $query
  )]
  | score(
    boost(name match $query, 2),
    role match $query
  )
  | order(_score desc)[0...10] {
    _id,
    name,
    "slug": slug.current,
    role,
    portrait
  }
`

// Single contributor by slug
export const CONTRIBUTOR_BY_SLUG_QUERY = `
  *[_type == "contributor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    role,
    bio,
    portrait,
    location
  }
`

// Contributor slugs for generateStaticParams
export const CONTRIBUTOR_SLUGS_QUERY = `
  *[_type == "contributor"] { "slug": slug.current }
`

// Contributors listing page (name + bio)
export const CONTRIBUTORS_LIST_PAGE_QUERY = `
  *[_type == "contributor"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    bio
  }
`

export const PHOTOGRAPHERS_LIST_PAGE_QUERY = `
  *[_type == "photographer"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    bio
  }
`

export const PHOTOGRAPHER_BY_SLUG_QUERY = `
  *[_type == "photographer" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    bio,
    portrait,
    location
  }
`

export const PHOTOGRAPHER_SLUGS_QUERY = `
  *[_type == "photographer"] { "slug": slug.current }
`

// Articles by contributor (author reference)
export const ARTICLES_BY_CONTRIBUTOR_QUERY = `
  *[_type == "article" && author->slug.current == $contributorSlug] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    subcategory,
    coverImage,
    publishedAt,
    "author": author->{ name, "slug": slug.current }
  }
`

export const ARTICLES_BY_PHOTOGRAPHER_QUERY = `
  *[_type == "article" && photographer->slug.current == $photographerSlug] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    subcategory,
    coverImage,
    publishedAt,
    "author": author->{ name, "slug": slug.current }
  }
`

// Category page images (Interiors, Arts, Gardens, Fashion)
export const CATEGORY_PAGE_QUERY = `
  *[_type == "categoryPage" && _id == "categoryPage"][0] {
    interiorsImage{asset, alt, caption, hotspot},
    artsImage{asset, alt, caption, hotspot},
    gardensImage{asset, alt, caption, hotspot},
    fashionImage{asset, alt, caption, hotspot}
  }
`

// Site settings (for newsletter page, footer, etc.)
export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    newsletterHeadline,
    newsletterSubtitle,
    newsletterImage,
    newsletterImageLegend,
    instagramUrl
  }
`

// Active ad banner by placement
export const AD_BANNER_BY_PLACEMENT_QUERY = `
  *[_type == "adBanner" && active == true && placement == $placement][0] {
    _id,
    title,
    image,
    linkUrl
  }
`
