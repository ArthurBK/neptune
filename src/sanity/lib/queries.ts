// Articles by category (for category landing pages)
export const ARTICLES_BY_CATEGORY_QUERY = `
  *[_type == "article" && category == $category] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    category,
    subcategory,
    coverImage,
    excerpt,
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
    "relatedArticles": relatedArticles[]->{ _id, title, "slug": slug.current, category, subcategory, coverImage, excerpt, "author": author->{ name, "slug": slug.current } },
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

// Active ad banner by placement
export const AD_BANNER_BY_PLACEMENT_QUERY = `
  *[_type == "adBanner" && active == true && placement == $placement][0] {
    _id,
    title,
    image,
    linkUrl
  }
`
