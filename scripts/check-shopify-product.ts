/**
 * Run with: npx tsx scripts/check-shopify-product.ts
 * Verifies that the latest newsstand product query returns data.
 * Loads .env.local from project root (Next.js convention).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
try {
  const env = readFileSync(join(process.cwd(), '.env.local'), 'utf8')
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {
  /* .env.local not found */
}
import { shopifyFetch } from '../src/lib/shopify/client'
import {
  FIRST_PRODUCT_QUERY,
  LATEST_NEWSSTAND_PRODUCT_QUERY,
} from '../src/lib/shopify/queries'

async function main() {
  console.log('Checking Shopify product queries...\n')
  console.log('Env check:', {
    hasDomain: !!process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    hasToken: !!process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  })

  try {
    const [collectionData, allProductsData] = await Promise.all([
      shopifyFetch<unknown>({ query: LATEST_NEWSSTAND_PRODUCT_QUERY }),
      shopifyFetch<unknown>({ query: FIRST_PRODUCT_QUERY }),
    ])

    console.log('\n--- LATEST_NEWSSTAND_PRODUCT_QUERY (collection "newsstand") ---')
    console.log(JSON.stringify(collectionData, null, 2))

    console.log('\n--- FIRST_PRODUCT_QUERY (all products, first 1) ---')
    console.log(JSON.stringify(allProductsData, null, 2))

    const coll = collectionData as { collection?: { products?: { edges?: unknown[] } } }
    const all = allProductsData as { products?: { edges?: unknown[] } }
    const fromCollection = coll?.collection?.products?.edges?.[0]
    const fromAll = all?.products?.edges?.[0]

    console.log('\n--- Result ---')
    console.log('Product from newsstand collection:', fromCollection ? 'YES' : 'NO')
    console.log('Product from all products:', fromAll ? 'YES' : 'NO')
    console.log('Featured product will show:', fromCollection || fromAll ? 'YES' : 'NO')
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

main()
