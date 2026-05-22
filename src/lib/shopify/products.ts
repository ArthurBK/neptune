import { shopifyFetch } from "./client"
import { ALL_PRODUCTS_QUERY, NEWSSTAND_PRODUCTS_QUERY } from "./queries"
import type {
  AllProductsResponse,
  NewsstandProductsResponse,
  ProductConnection,
  ShopifyProduct,
} from "./types"

const SHOPIFY_PAGE_SIZE = 250

export async function getNewsstandProducts() {
  const [collectionProducts, allProducts] = await Promise.all([
    fetchNewsstandCollectionProducts(),
    fetchAllProducts(),
  ])

  return mergeProducts(collectionProducts, allProducts)
}

async function fetchNewsstandCollectionProducts() {
  try {
    return await fetchPaginatedProducts(async (after) => {
      const data = await shopifyFetch<NewsstandProductsResponse>({
        query: NEWSSTAND_PRODUCTS_QUERY,
        variables: {
          first: SHOPIFY_PAGE_SIZE,
          after,
        },
      })

      return data.collection?.products ?? null
    })
  } catch (err) {
    console.error("Newsstand collection fetch error:", err)
    return []
  }
}

async function fetchAllProducts() {
  try {
    return await fetchPaginatedProducts(async (after) => {
      const data = await shopifyFetch<AllProductsResponse>({
        query: ALL_PRODUCTS_QUERY,
        variables: {
          first: SHOPIFY_PAGE_SIZE,
          after,
        },
      })

      return data.products
    })
  } catch (err) {
    console.error("All Shopify products fetch error:", err)
    return []
  }
}

async function fetchPaginatedProducts(
  fetchPage: (after: string | null) => Promise<ProductConnection | null>,
) {
  const products: ShopifyProduct[] = []
  let after: string | null = null

  do {
    const connection = await fetchPage(after)

    if (!connection) {
      break
    }

    products.push(...connection.edges.map((edge) => edge.node))
    after = connection.pageInfo.hasNextPage
      ? connection.pageInfo.endCursor
      : null
  } while (after)

  return products
}

function mergeProducts(
  collectionProducts: ShopifyProduct[],
  allProducts: ShopifyProduct[],
) {
  const productsByHandle = new Map<string, ShopifyProduct>()

  for (const product of [...collectionProducts, ...allProducts]) {
    productsByHandle.set(product.handle, product)
  }

  return Array.from(productsByHandle.values()).sort((a, b) => {
    const createdA = a.createdAt ? Date.parse(a.createdAt) : 0
    const createdB = b.createdAt ? Date.parse(b.createdAt) : 0

    return createdB - createdA
  })
}
