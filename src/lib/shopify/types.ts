// Money / Price
export interface Money {
  amount: string
  currencyCode: string
}

// Product variant
export interface ProductVariant {
  id: string
  title: string
  price: Money
  availableForSale: boolean
}

// Product image
export interface ProductImage {
  url: string
  altText: string | null
  width?: number
  height?: number
}

// Product (list/card view)
export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  priceRange: {
    minVariantPrice: Money
  }
  featuredImage: ProductImage | null
  variants: {
    edges: Array<{ node: ProductVariant }>
  }
}

// Product (detail view)
export interface ShopifyProductDetail {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  images: {
    edges: Array<{ node: ProductImage }>
  }
  variants: {
    edges: Array<{ node: ProductVariant }>
  }
}

// Collection response
export interface NewsstandProductsResponse {
  collection: {
    products: {
      edges: Array<{ node: ShopifyProduct }>
    }
  } | null
}

// All products response (fallback when collection doesn't exist)
export interface AllProductsResponse {
  products: {
    edges: Array<{ node: ShopifyProduct }>
  }
}

// Product by handle response
export interface ProductByHandleResponse {
  product: ShopifyProductDetail | null
}

// Cart line merchandise (ProductVariant)
export interface CartLineMerchandise {
  id: string
  title: string
  price: Money
  product: {
    title: string
    featuredImage: { url: string } | null
  }
}

// Cart line
export interface CartLine {
  id: string
  quantity: number
  merchandise: CartLineMerchandise
}

// Cart
export interface ShopifyCart {
  id: string
  checkoutUrl: string | null
  totalQuantity?: number
  lines?: {
    edges: Array<{ node: CartLine }>
  }
}

// Cart create response
export interface CartCreateResponse {
  cartCreate: {
    cart: ShopifyCart
    userErrors: Array<{ field?: string[]; message: string }>
  }
}

// Cart lines add response
export interface CartLinesAddResponse {
  cartLinesAdd: {
    cart: ShopifyCart
    userErrors: Array<{ field?: string[]; message: string }>
  }
}

// Mutation input
export interface CartLineInput {
  merchandiseId: string
  quantity: number
}

// Price formatting
export function formatPrice(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
  }).format(Number.parseFloat(amount))
}

export function formatPriceNoDecimals(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.parseFloat(amount))
}
