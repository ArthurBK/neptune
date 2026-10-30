/* eslint-disable @typescript-eslint/no-require-imports -- Exercise homepage queries and rendering with isolated content. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { parse, evaluate } = require('groq-js')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), mod, mod.exports)
  return mod.exports
}

const queries = load('src/sanity/lib/queries.ts', { 'next-sanity': { defineQuery: query => query } })
const types = ['homeVideoBlock', 'homeArticleBlock', 'homeThreeArticlesBlock', 'homeImageBlock', 'homeProductBlock', 'homeNewsstandBlock', 'homeNewsletterBlock']
const sections = types.map((_type, index) => ({
  _type, _key: String(index),
  article: { _type: 'reference', _ref: 'article' },
  articles: [{ _type: 'reference', _ref: 'article' }],
  menuAppearance: { textColor: index === 0 ? 'white' : 'black' },
}))
async function queryHome(query, home) {
  return (await evaluate(parse(query), { dataset: [home, { _id: 'article', _type: 'article', title: 'Story' }] })).get()
}

test('each section can be hidden and restored in its original position; existing sections remain visible', async () => {
  const home = { _id: 'homePage', _type: 'homePage', sections: structuredClone(sections) }
  const original = await queryHome(queries.HOME_PAGE_QUERY, home)
  assert.equal(original.sections.length, types.length)
  for (const section of home.sections) {
    section.isHidden = true
    const hidden = await queryHome(queries.HOME_PAGE_QUERY, home)
    assert.deepEqual(hidden.sections.map(s => s._key), sections.filter(s => s._key !== section._key).map(s => s._key))
    section.isHidden = false
    assert.deepEqual(await queryHome(queries.HOME_PAGE_QUERY, home), original)
  }
})

test('initial menu follows the first visible section and all hidden sections produce an empty configured page', async () => {
  const home = { _id: 'homePage', _type: 'homePage', sections: structuredClone(sections) }
  home.sections[0].isHidden = true
  const menu = await queryHome(queries.HOME_MENU_QUERY, home)
  assert.equal(menu.type, 'homeArticleBlock')
  assert.equal(menu.menuAppearance.textColor, 'black')
  home.sections.forEach(section => { section.isHidden = true })
  assert.deepEqual(await queryHome(queries.HOME_PAGE_QUERY, home), { hasConfiguredSections: true, sections: [] })
  assert.equal(await queryHome(queries.HOME_MENU_QUERY, home), null)
})

test('an all-hidden homepage never fetches or renders legacy fallback content', async () => {
  const calls = []
  function HomeScrollContainer() {}
  const { default: Home } = load('src/app/page.tsx', {
    '@/sanity/lib/queries': queries,
    '@/sanity/lib/client': { sanityFetch: async query => {
      calls.push(query)
      if (query === queries.HOME_PAGE_QUERY) return { hasConfiguredSections: true, sections: [] }
      if (query === queries.SITE_SETTINGS_QUERY) return null
      throw new Error('Unexpected fallback query')
    } },
    '@/sanity/lib/image': {},
    '@/lib/shopify/client': { shopifyFetch: async () => { throw new Error('Unexpected Shopify fallback') } },
    '@/lib/shopify/handle': {},
    '@/lib/newsstandPhotos': {},
    '@/lib/shopify/queries': {},
    '@/components/home/HomeScrollContainer': { HomeScrollContainer },
    '@/components/layout/Footer': { Footer: () => null },
    '@/components/layout/SuppressLayoutFooter': { SuppressLayoutFooter: () => null },
  })
  const tree = await Home()
  const container = tree.props.children.find(child => child.type === HomeScrollContainer)
  assert.deepEqual(container.props.sections, [])
  assert.deepEqual(calls, [queries.HOME_PAGE_QUERY, queries.SITE_SETTINGS_QUERY])
})

test('the homepage article image keeps its dedicated crop and hotspot', async () => {
  const image = {
    _type: 'image', asset: { _type: 'reference', _ref: 'square-image' }, alt: 'Homepage framing',
    crop: { left: 0.1, right: 0, top: 0, bottom: 0.1 },
    hotspot: { x: 0.6, y: 0.4, width: 0.2, height: 0.3 },
  }
  const result = await queryHome(queries.HOME_PAGE_QUERY, {
    _id: 'homePage', _type: 'homePage', sections: [{
      _key: 'article', _type: 'homeArticleBlock', article: { _ref: 'article' }, image,
    }],
  })
  assert.deepEqual(result.sections[0].image, image)
})
