/* eslint-disable @typescript-eslint/no-require-imports -- Test the search route with isolated content and cache. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function setup() {
  const visibility = { stories: true, contributors: true }
  const calls = []
  const cache = new Map()
  const mocks = {
    'next/cache': {
      unstable_cache: (fn, key) => async () => {
        const id = JSON.stringify(key)
        if (!cache.has(id)) cache.set(id, await fn())
        return cache.get(id)
      },
    },
    '@/sanity/lib/stories': { isStoriesVisible: async () => visibility.stories },
    '@/sanity/lib/contributors': { isContributorsVisible: async () => visibility.contributors },
    '@/sanity/lib/queries': { ARTICLES_SEARCH_QUERY: 'articles', CONTRIBUTORS_SEARCH_QUERY: 'contributors' },
    '@/sanity/lib/client': {
      client: { fetch: async query => {
        calls.push(query)
        return query === 'articles'
          ? [{ _id: 'article', title: 'Test story', slug: 'test-story', category: 'Design' }]
          : [{ _id: 'contributor', name: 'Test contributor', slug: 'test-contributor' }]
      } },
    },
    '@/lib/articleTitle': { articleTitleSingleLine: title => title },
    '@/lib/shopify/client': { shopifyFetch: async () => {
      calls.push('products')
      return { search: { nodes: [{ title: 'Test issue', handle: 'test-issue' }] } }
    } },
  }
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/app/api/search/route.ts'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => mocks[name] ?? require(name), mod, mod.exports)
  return {
    visibility, calls,
    search: async (query = 'test') => (await mod.exports.GET(new Request(`http://localhost/api/search?q=${query}`))).json(),
  }
}

test('search independently respects Stories and Contributors visibility and keeps products', async () => {
  for (const stories of [false, true]) {
    for (const contributors of [false, true]) {
      const { search, visibility, calls } = setup()
      Object.assign(visibility, { stories, contributors })
      const result = await search()
      assert.equal(result.articles.length, Number(stories))
      assert.equal(result.contributors.length, Number(contributors))
      assert.equal(result.products[0].href, '/newsstand/test-issue')
      assert.equal(calls.includes('articles'), stories)
      assert.equal(calls.includes('contributors'), contributors)
    }
  }
})

test('hiding pages excludes previously cached results and re-enabling restores them', async () => {
  const { search, visibility } = setup()
  const initial = await search()
  assert.equal(initial.articles.length, 1)
  assert.equal(initial.contributors.length, 1)
  visibility.stories = false
  const storiesHidden = await search()
  assert.deepEqual(storiesHidden.articles, [])
  assert.equal(storiesHidden.contributors.length, 1)
  visibility.contributors = false
  const bothHidden = await search()
  assert.deepEqual(bothHidden.articles, [])
  assert.deepEqual(bothHidden.contributors, [])
  assert.equal(bothHidden.products.length, 1)
  visibility.stories = true
  visibility.contributors = true
  assert.deepEqual(await search(), initial)
})

test('short searches return empty results without querying content', async () => {
  const { search, calls } = setup()
  for (const query of ['', 'a']) {
    assert.deepEqual(await search(query), { articles: [], contributors: [], products: [] })
  }
  assert.deepEqual(calls, [])
})
