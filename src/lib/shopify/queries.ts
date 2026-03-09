const PRODUCT_FIELDS = `
  id
  title
  handle
  priceRange {
    minVariantPrice { amount currencyCode }
  }
  featuredImage { url altText }
  variants(first: 10) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
      }
    }
  }
`

export const NEWSSTAND_PRODUCTS_QUERY = `
  query NewsstandProducts {
    collection(handle: "newsstand") {
      products(first: 100, sortKey: CREATED, reverse: true) {
        edges {
          node {
            ${PRODUCT_FIELDS}
          }
        }
      }
    }
  }
`

/** First 6 products from newsstand collection (for homepage hero grid) */
export const NEWSSTAND_6_PRODUCTS_QUERY = `
  query Newsstand6Products {
    collection(handle: "newsstand") {
      products(first: 6, sortKey: CREATED, reverse: true) {
        edges {
          node {
            handle
            title
            featuredImage { url altText }
            images(first: 5) {
              edges {
                node { url altText }
              }
            }
          }
        }
      }
    }
  }
`

/** Newest product from newsstand collection (for homepage hero) */
export const LATEST_NEWSSTAND_PRODUCT_QUERY = `
  query LatestNewsstandProduct {
    collection(handle: "newsstand") {
      products(first: 1, sortKey: CREATED, reverse: true) {
        edges {
          node {
            handle
            title
            featuredImage { url altText }
            images(first: 5) {
              edges {
                node { url altText }
              }
            }
          }
        }
      }
    }
  }
`

/** Newest product from all products (fallback when newsstand collection is empty) */
export const FIRST_PRODUCT_QUERY = `
  query FirstProduct {
    products(first: 1, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          handle
          title
          featuredImage { url altText }
          images(first: 5) {
            edges {
              node { url altText }
            }
          }
        }
      }
    }
  }
`

/** All products (Shopify allows up to 250), sorted by created date */
export const ALL_PRODUCTS_QUERY = `
  query AllProducts {
    products(first: 100, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          ${PRODUCT_FIELDS}
        }
      }
    }
  }
`

/** Product by handle for home hero (image-focused) */
export const PRODUCT_BY_HANDLE_HERO_QUERY = `
  query ProductByHandleHero($handle: String!) {
    product(handle: $handle) {
      handle
      title
      featuredImage { url altText }
      images(first: 5) {
        edges {
          node { url altText }
        }
      }
    }
  }
`

export const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      id
      title
      handle
      description
      descriptionHtml
      images(first: 10) {
        edges {
          node { url altText width height }
        }
      }
      variants(first: 10) {
        edges {
          node {
            id
            title
            price { amount currencyCode }
            availableForSale
          }
        }
      }
    }
  }
`

export const CART_CREATE_MUTATION = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 20) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    title
                    handle
                    featuredImage { url altText }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const CART_LINES_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 20) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            price { amount currencyCode }
            product {
              title
              handle
              featuredImage { url altText }
            }
          }
        }
      }
    }
  }
`

export const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_LINES_FRAGMENT}
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_QUERY = `
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      totalQuantity
      lines(first: 20) {
        edges {
          node {
            id
            quantity
            merchandise {
              ... on ProductVariant {
                id
                title
                price { amount currencyCode }
                product {
                  title
                  handle
                  featuredImage { url altText }
                }
              }
            }
          }
        }
      }
    }
  }
`

export const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 20) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    title
                    handle
                    featuredImage { url altText }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

export const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id
        checkoutUrl
        totalQuantity
        lines(first: 20) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price { amount currencyCode }
                  product {
                    title
                    handle
                    featuredImage { url altText }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`
