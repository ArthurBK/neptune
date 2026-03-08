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
        handle
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
    "affiliateProducts": affiliateProducts[]->{ title, brand, price, image, affiliateUrl },
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

// All clients (for Studio page)
export const CLIENTS_QUERY = `
  *[_type == "client"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    services,
    coverImage
  }
`

// Single client by slug
export const CLIENT_BY_SLUG_QUERY = `
  *[_type == "client" && slug.current == $slug][0] {
    ...,
    "relatedClients": relatedClients[]->{ _id, title, "slug": slug.current, category, subcategory, coverImage },
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

// Client slugs for generateStaticParams
export const CLIENT_SLUGS_QUERY = `
  *[_type == "client"] { "slug": slug.current }
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

// Search articles by title
export const ARTICLES_SEARCH_QUERY = `
  *[_type == "article" && title match $query] | order(publishedAt desc)[0...10] {
    _id,
    title,
    "slug": slug.current,
    category,
    coverImage,
    "author": author->{ name }
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

// Category page images (Interiors, Arts, Gardens)
export const CATEGORY_PAGE_QUERY = `
  *[_type == "categoryPage" && _id == "categoryPage"][0] {
    interiorsImage,
    artsImage,
    gardensImage
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
