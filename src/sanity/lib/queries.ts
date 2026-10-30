import { defineQuery } from 'next-sanity'

// A deleted person's credit stays on the article without a profile URL.
const AUTHOR_CREDIT = /* groq */ `coalesce(
  author->{ name, "slug": slug.current },
  select(defined(authorName) => { "name": authorName, "slug": null })
)`
const AUTHOR_DETAILS_CREDIT = /* groq */ `coalesce(
  author->{ name, "slug": slug.current, bio, portrait },
  select(defined(authorName) => { "name": authorName, "slug": null })
)`
const PHOTOGRAPHER_CREDIT = /* groq */ `coalesce(
  photographer->{
    name,
    "slug": slug.current,
    "profileHref": select(_type == "contributor" => "/contributors/", "/contributors/photographer/") + slug.current
  },
  select(defined(photographerName) => { "name": photographerName, "slug": null, "profileHref": null })
)`

// Keep the initial header and rendered sections aligned when sections are hidden or articles unpublished.
const VISIBLE_HOME_SECTION = /* groq */ `
  coalesce(isHidden, false) == false &&
  (_type != "homeArticleBlock" || defined(article->_id)) &&
  (_type != "homeThreeArticlesBlock" || defined(heroArticle->_id) || count(articles[defined(@->_id)]) > 0)
`

// Seed the persistent header before the homepage hydrates.
export const HOME_MENU_QUERY = defineQuery(/* groq */ `
  *[_type == "homePage" && _id == "homePage"][0].sections[${VISIBLE_HOME_SECTION}][0] {
    menuAppearance { textColor, background },
    "type": select(
      _type == "homeNewsstandBlock" && count(photos[defined(image.asset) && defined(linkUrl) && defined(ctaLabel)]) > 0 => "newsstandPhotos",
      _type
    )
  }
`)

// Home page sections (configurable in Studio)
export const HOME_PAGE_QUERY = `
  *[_type == "homePage" && _id == "homePage"][0] {
    "hasConfiguredSections": count(sections) > 0,
    sections[${VISIBLE_HOME_SECTION}] {
      menuAppearance { textColor, background },
      _type,
      _key,
      _type == "homeArticleBlock" => {
        "article": article->{
          _id,
          title,
          "slug": slug.current,
          "category": coalesce(category, categories[0]),
          subcategory,
          categories,
          coverImage,
          "author": ${AUTHOR_CREDIT}
        }
      },
      _type == "homeThreeArticlesBlock" => {
        title,
        titleRichText[] {
          ...,
          markDefs[] { ... }
        },
        "heroArticle": heroArticle->{
          _id,
          title,
          "slug": slug.current,
          "category": coalesce(category, categories[0]),
          subcategory,
          categories,
          coverImage,
          "author": ${AUTHOR_CREDIT}
        },
        "articles": articles[defined(@->_id)]->{
          _id,
          title,
          "slug": slug.current,
          "category": coalesce(category, categories[0]),
          subcategory,
          categories,
          coverImage,
          "author": ${AUTHOR_CREDIT}
        }
      },
      _type == "homeImageBlock" => {
        layout,
        image,
        alt,
        title,
        linkUrl,
        leftImage,
        leftAlt,
        leftLinkUrl,
        rightImage,
        rightAlt,
        rightLinkUrl
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
        photos[] { _key, image, alt, ctaLabel, linkUrl },
        "productHandles": productHandles[] { handle },
        title,
        titleRichText[] {
          ...,
          markDefs[] { ... }
        },
        description,
        descriptionRichText[] {
          ...,
          markDefs[] { ... }
        },
        ctaLabel
      },
      _type == "homeVideoBlock" => {
        "videoUrl": video.asset->url
      },
      _type == "homeNewsletterBlock" => {
        headline,
        subtitle,
        subtitleRichText[] {
          ...,
          markDefs[] { ... }
        },
        leftImage,
        rightImage
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
    "category": coalesce(category, categories[0]),
    subcategory,
    categories,
    coverImage,
    "author": ${AUTHOR_CREDIT}
  }
`

// All stories across editorial categories
export const ALL_STORIES_QUERY = `
  *[_type == "article"] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "category": coalesce(category, categories[0]),
    categories,
    subcategory,
    coverImage,
    publishedAt,
    "author": ${AUTHOR_CREDIT}
  }
`

export const STORIES_VISIBILITY_QUERY = defineQuery(/* groq */ `
  coalesce(*[_type == "storiesPage" && _id == "storiesPage"][0].isVisible, true)
`)

export const STORIES_PAGE_QUERY = `
  *[_type == "storiesPage" && _id == "storiesPage"][0] {
    description,
    introText[] {
      ...,
      markDefs[] { ... }
    },
    "articles": articles[defined(@->_id)]->{
      _id,
      title,
      "slug": slug.current,
      "category": coalesce(category, categories[0]),
      categories,
      subcategory,
      coverImage,
      publishedAt,
      "author": ${AUTHOR_CREDIT}
    },
    image{asset, alt, caption, hotspot}
  }
`

// Articles by category (for category landing pages)
export const ARTICLES_BY_CATEGORY_QUERY = `
  *[_type == "article" && (category == $category || $category in categories)] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "category": $category,
    categories,
    subcategory,
    coverImage,
    publishedAt,
    "author": ${AUTHOR_CREDIT}
  }
`

// Manual category-page lists: article id must match for “in this section” even when categories[] lags
const ARTICLE_IN_CATEGORY_PAGE_ORDER_LIST = `(
  ($category == "travel" && _id in *[_type == "categoryPage" && _id == "categoryPage"][0].travelArticles[]._ref) ||
  ($category == "interiors" && _id in *[_type == "categoryPage" && _id == "categoryPage"][0].interiorsArticles[]._ref) ||
  ($category == "arts" && _id in *[_type == "categoryPage" && _id == "categoryPage"][0].artsArticles[]._ref) ||
  ($category == "gardens" && _id in *[_type == "categoryPage" && _id == "categoryPage"][0].gardensArticles[]._ref) ||
  ($category == "fashion" && _id in *[_type == "categoryPage" && _id == "categoryPage"][0].fashionArticles[]._ref)
)`

// Single article by slug and category
export const ARTICLE_BY_SLUG_QUERY = `
  *[_type == "article" && slug.current == $slug && (
    category == $category ||
    $category in categories ||
    ${ARTICLE_IN_CATEGORY_PAGE_ORDER_LIST}
  )][0] {
    ...,
    "author": ${AUTHOR_DETAILS_CREDIT},
    "photographer": ${PHOTOGRAPHER_CREDIT},
    "affiliateProducts": affiliateProducts[]->{ _id, title, brand, price, image, affiliateUrl },
    "relatedArticles": relatedArticles[defined(@->_id)]->{ _id, title, "slug": slug.current, "category": coalesce(category, categories[0]), categories, subcategory, coverImage, "author": ${AUTHOR_CREDIT} },
    "body": body[] {
      ...,
      _type == "pteImageBlock" => {
        "imageDimensions": image.asset->metadata.dimensions
      },
      _type == "pteImageGridBlock" => {
        "images": images[]{
          ...,
          "imageDimensions": asset->metadata.dimensions
        }
      },
      _type == "pteVideoBlock" => {
        url,
        caption,
        posterImage,
        layout
      },
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

export const ARTICLE_BY_STORY_SLUG_QUERY = `
  *[_type == "article" && slug.current == $slug] | order(publishedAt desc)[0] {
    ...,
    "author": ${AUTHOR_DETAILS_CREDIT},
    "photographer": ${PHOTOGRAPHER_CREDIT},
    "affiliateProducts": affiliateProducts[]->{ _id, title, brand, price, image, affiliateUrl },
    "relatedArticles": relatedArticles[defined(@->_id)]->{ _id, title, "slug": slug.current, "category": coalesce(category, categories[0]), categories, subcategory, coverImage, "author": ${AUTHOR_CREDIT} },
    "body": body[] {
      ...,
      _type == "pteImageBlock" => {
        "imageDimensions": image.asset->metadata.dimensions
      },
      _type == "pteImageGridBlock" => {
        "images": images[]{
          ...,
          "imageDimensions": asset->metadata.dimensions
        }
      },
      _type == "pteVideoBlock" => {
        url,
        caption,
        posterImage,
        layout
      },
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

export const ARTICLE_STORY_SLUGS_QUERY = `
  *[_type == "article"] { "slug": slug.current }
`

// Article slugs for generateStaticParams
export const ARTICLE_SLUGS_BY_CATEGORY_QUERY = `
  *[_type == "article" && (
    category == $category ||
    $category in categories ||
    ${ARTICLE_IN_CATEGORY_PAGE_ORDER_LIST}
  )] { "slug": slug.current }
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

export const MARKET_VISIBILITY_QUERY = defineQuery(/* groq */ `
  coalesce(*[_type == "marketPage" && _id == "marketPage"][0].isVisible, true)
`)

// Market page copy and ordered affiliate products (manual drag-and-drop order in Studio)
export const MARKET_PAGE_QUERY = defineQuery(/* groq */ `
  *[_type == "marketPage" && _id == "marketPage"][0]{
    title,
    description,
    affiliateDisclosure,
    "products": products[]->{
      _id,
      title,
      brand,
      price,
      image,
      affiliateUrl,
      category
    }
  }
`)

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
    coalesce(author->name, authorName) match $query
  )]
  | score(boost(title match $query, 2))
  | order(_score desc, publishedAt desc)[0...15] {
    _id,
    title,
    "slug": slug.current,
    "category": coalesce(category, categories[0]),
    categories,
    coverImage,
    "author": ${AUTHOR_CREDIT}
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
    bioRichText[] {
      ...,
      markDefs[] { ... }
    },
    portrait,
    location
  }
`

// Contributor slugs for generateStaticParams
export const CONTRIBUTOR_SLUGS_QUERY = `
  *[_type == "contributor"] { "slug": slug.current }
`

// Contributors page intro content
export const CONTRIBUTORS_VISIBILITY_QUERY = defineQuery(/* groq */ `
  coalesce(*[_type == "contributorsPage" && _id == "contributorsPage"][0].isVisible, true)
`)

export const CONTRIBUTORS_PAGE_QUERY = `
  *[_type == "contributorsPage" && _id == "contributorsPage"][0] {
    description[] {
      ...,
      markDefs[] { ... }
    }
  }
`

// Contributors listing page (name + bio)
export const CONTRIBUTORS_LIST_PAGE_QUERY = `
  *[_type == "contributor"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    bio,
    bioRichText[] {
      ...,
      markDefs[] { ... }
    },
    "articleCount": count(*[_type == "article" && references(^._id)])
  }
`

export const PHOTOGRAPHERS_LIST_PAGE_QUERY = `
  *[_type == "photographer"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    bio,
    bioRichText[] {
      ...,
      markDefs[] { ... }
    },
    "articleCount": count(*[_type == "article" && references(^._id)])
  }
`

export const PHOTOGRAPHER_BY_SLUG_QUERY = `
  *[_type in ["photographer", "contributor"] && slug.current == $slug]
  | order((_type == "photographer") desc)[0] {
    _id,
    name,
    "slug": slug.current,
    bio,
    bioRichText[] {
      ...,
      markDefs[] { ... }
    },
    portrait,
    location
  }
`

export const PHOTOGRAPHER_SLUGS_QUERY = `
  *[_type == "photographer"] { "slug": slug.current }
`

// Contributions include writing and photography, without matching legacy people
// that happen to share the same slug.
// Public profiles follow the Stories selection; authenticated previews include drafts.
const CONTRIBUTION_VISIBLE_IN_STORIES = `
  defined(slug.current) && slug.current != "" && (
    $isPreview == true ||
    _id in *[_type == "storiesPage" && _id == "storiesPage"][0].articles[]._ref
  )
`

export const ARTICLES_BY_CONTRIBUTOR_QUERY = `
  *[_type == "article" && ${CONTRIBUTION_VISIBLE_IN_STORIES} && (
    author._ref == $contributorId || photographer._ref == $contributorId
  )] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "category": coalesce(category, categories[0]),
    categories,
    subcategory,
    coverImage,
    publishedAt,
    "author": ${AUTHOR_CREDIT}
  }
`

export const ARTICLES_BY_PHOTOGRAPHER_QUERY = `
  *[_type == "article" && ${CONTRIBUTION_VISIBLE_IN_STORIES} && photographer._ref == $photographerId] | order(publishedAt desc) {
    _id,
    title,
    "slug": slug.current,
    "category": coalesce(category, categories[0]),
    categories,
    subcategory,
    coverImage,
    publishedAt,
    "author": ${AUTHOR_CREDIT}
  }
`

// Category page images (Interiors, Arts, Gardens, Fashion, Travel)
export const CATEGORY_PAGE_QUERY = `
  *[_type == "categoryPage" && _id == "categoryPage"][0] {
    interiorsDescription,
    artsDescription,
    gardensDescription,
    fashionDescription,
    travelDescription,
    "interiorsArticles": interiorsArticles[defined(@->_id)]->{
      _id,
      title,
      "slug": slug.current,
      "category": coalesce(category, categories[0]),
      categories,
      subcategory,
      coverImage,
      "author": ${AUTHOR_CREDIT}
    },
    "artsArticles": artsArticles[defined(@->_id)]->{
      _id,
      title,
      "slug": slug.current,
      "category": coalesce(category, categories[0]),
      categories,
      subcategory,
      coverImage,
      "author": ${AUTHOR_CREDIT}
    },
    "gardensArticles": gardensArticles[defined(@->_id)]->{
      _id,
      title,
      "slug": slug.current,
      "category": coalesce(category, categories[0]),
      categories,
      subcategory,
      coverImage,
      "author": ${AUTHOR_CREDIT}
    },
    "fashionArticles": fashionArticles[defined(@->_id)]->{
      _id,
      title,
      "slug": slug.current,
      "category": coalesce(category, categories[0]),
      categories,
      subcategory,
      coverImage,
      "author": ${AUTHOR_CREDIT}
    },
    "travelArticles": travelArticles[defined(@->_id)]->{
      _id,
      title,
      "slug": slug.current,
      "category": coalesce(category, categories[0]),
      categories,
      subcategory,
      coverImage,
      "author": ${AUTHOR_CREDIT}
    },
    interiorsImage{asset, alt, caption, hotspot},
    artsImage{asset, alt, caption, hotspot},
    gardensImage{asset, alt, caption, hotspot},
    fashionImage{asset, alt, caption, hotspot},
    travelImage{asset, alt, caption, hotspot}
  }
`

// Site settings (for newsletter page, footer, etc.)
export const SITE_SETTINGS_QUERY = `
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    newsletterHeadline,
    newsletterSubtitle,
    newsletterDescriptionRichText[] {
      ...,
      markDefs[] { ... }
    },
    newsletterImage,
    newsletterImageLegend,
    aboutText,
    aboutImageLeft{asset, alt, caption, hotspot},
    aboutImageRight{asset, alt, caption, hotspot},
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
