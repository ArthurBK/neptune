/* eslint-disable @typescript-eslint/no-require-imports -- Load the shared TypeScript sorting logic. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => mocks[name] ?? require(name), mod, mod.exports)
  return mod.exports
}
const order = load('src/lib/shopify/productOrder.ts')
const { sortNewsstandProducts } = order

test('Issue Eleven follows cover numbers in titles despite reversed creation dates and old URLs', () => {
  const covers = ['Four', 'One', 'Two', 'Three', 'Six', 'Five']
  const input = covers.map((cover, index) => ({
    title: `Neptune Papers Issue Eleven - Cover ${cover}: Photograph`,
    handle: `neptune-issue-eleven-cover-${index + 1}`,
    createdAt: `2026-10-14T13:${String(16 - index).padStart(2, '0')}:00Z`,
  }))
  const original = structuredClone(input)
  const sorted = sortNewsstandProducts(input)
  assert.deepEqual(sorted.map(p => p.title.match(/Cover (\w+)/)[1]), ['One', 'Two', 'Three', 'Four', 'Five', 'Six'])
  assert.deepEqual(input, original)
})

test('issues sort newest first, including digit and compound word numbers and older issues without covers', () => {
  const titles = [
    'Issue Nine - Cover Three', 'Issue Four', 'Issue Ten - Cover Six',
    'Issue Eleven - Cover Two', 'Issue Ten - Cover Two', 'Issue Five',
    'Issue 12 - Cover 10', 'Issue 12 - Cover 2', 'Issue Twenty-One - Cover One',
  ]
  assert.deepEqual(sortNewsstandProducts(titles.map(title => ({ title }))).map(p => p.title), [
    'Issue Twenty-One - Cover One', 'Issue 12 - Cover 2', 'Issue 12 - Cover 10',
    'Issue Eleven - Cover Two', 'Issue Ten - Cover Two', 'Issue Ten - Cover Six',
    'Issue Nine - Cover Three', 'Issue Five', 'Issue Four',
  ])
})

test('unrecognized titles remain available after numbered issues, ordered by creation date', () => {
  const input = [
    { title: 'Archive', createdAt: 'invalid' },
    { title: 'Special edition', createdAt: '2026-10-01' },
    { title: 'Issue Four', createdAt: '2023-01-01' },
    { title: 'Print', createdAt: '2025-01-01' },
  ]
  assert.deepEqual(sortNewsstandProducts(input).map(p => p.title), ['Issue Four', 'Special edition', 'Print', 'Archive'])
})

test('Newsstand applies editorial sorting after pagination and deduplication, including missing collection fallback', async () => {
  for (const hasCollection of [false, true]) {
    const product = (issue, cover) => ({ title: `Issue ${issue} - Cover ${cover}`, handle: `${issue}-${cover}` })
    const first = product(11, 1)
    const second = product(11, 2)
    const older = product(10, 1)
    const { getNewsstandProducts } = load('src/lib/shopify/products.ts', {
      './productOrder': order,
      './queries': { ALL_PRODUCTS_QUERY: 'all', NEWSSTAND_PRODUCTS_QUERY: 'collection' },
      './client': { shopifyFetch: async ({ query, variables }) => {
        const connection = (nodes, next = null) => ({ edges: nodes.map(node => ({ node })), pageInfo: { hasNextPage: !!next, endCursor: next } })
        if (query === 'collection') return { collection: hasCollection ? { products: connection([second, first]) } : null }
        return { products: variables.after ? connection([first, older]) : connection([second], 'page-two') }
      } },
    })
    assert.deepEqual((await getNewsstandProducts()).map(p => p.handle), ['11-1', '11-2', '10-1'])
  }
})
