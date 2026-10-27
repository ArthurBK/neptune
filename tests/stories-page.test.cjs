/* eslint-disable @typescript-eslint/no-require-imports -- Render the server page against isolated content. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { parse, evaluate } = require('groq-js')

function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const loadedModule = { exports: {} }
  new Function('require', 'module', 'exports', code)(
    (name) => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports,
  )
  return loadedModule.exports
}

const queries = load('src/sanity/lib/queries.ts', { 'next-sanity': { defineQuery: query => query } })
const articles = ['first', 'second', 'unselected'].map(id => ({
  _id: id, _type: 'article', title: id, slug: { current: id },
}))

async function renderPage(storiesPage) {
  const dataset = [...articles, ...(storiesPage ? [storiesPage] : [])]
  const client = {
    sanityFetch: async (query, params = {}) => (await evaluate(parse(query), { dataset, params })).get(),
  }
  const stories = load('src/sanity/lib/stories.ts', {
    react: { cache: fn => fn }, './client': client, './queries': queries,
  })
  const { default: StoriesPage } = load('src/app/stories/page.tsx', {
    'next/navigation': { notFound: () => { throw new Error('STORIES_NOT_FOUND') } },
    '@/sanity/lib/stories': stories,
    '@/sanity/lib/queries': queries,
    '@/sanity/lib/client': client,
    '@/components/editorial/ArticleCard': {
      ArticleCard: ({ title }) => React.createElement('article', null, title),
    },
    '@/components/shared/AdBanner': { AdBanner: () => null },
    '@/components/shared/CategoryPageImage': { CategoryPageImage: () => null },
    '@/components/shared/NewsstandCta': { NewsstandCta: () => null },
    '@/components/shared/PageIntroText': { PageIntroText: () => null, hasPortableTextContent: () => false },
  })
  return renderToStaticMarkup(await StoriesPage())
}

test('an empty or missing Stories selection never falls back to other articles', async () => {
  for (const selection of [null, {}, { articles: [] }]) {
    const html = await renderPage(selection && { _id: 'storiesPage', _type: 'storiesPage', ...selection })
    assert.doesNotMatch(html, /<article>/)
    assert.match(html, /No stories yet/)
  }
})

test('Stories can be hidden and shown again without removing its selected articles', async () => {
  const page = {
    _id: 'storiesPage', _type: 'storiesPage', isVisible: false,
    articles: [{ _type: 'reference', _ref: 'first' }],
  }
  await assert.rejects(renderPage(page), /STORIES_NOT_FOUND/)
  assert.match(await renderPage({ ...page, isVisible: true }), /<article>first<\/article>/)
})

test('only selected stories appear in editorial order; unresolved references are skipped', async () => {
  const html = await renderPage({
    _id: 'storiesPage', _type: 'storiesPage',
    articles: ['second', 'missing', 'first'].map(_ref => ({ _type: 'reference', _ref })),
  })
  assert.deepEqual([...html.matchAll(/<article>(.*?)<\/article>/g)].map(match => match[1]), ['second', 'first'])
  assert.doesNotMatch(html, /unselected/)
})
