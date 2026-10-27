import assert from 'node:assert/strict'
import test from 'node:test'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { createClient } from '@sanity/client'
import { parse, evaluate } from 'groq-js'
import { articleReferenceUpdates } from '../src/sanity/lib/articleReferences.mjs'

const require = createRequire(import.meta.url)
function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(new URL(file, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const loadedModule = { exports: {} }
  new Function('require', 'module', 'exports', source)(
    (name) => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports,
  )
  return loadedModule.exports
}
const queries = load('../src/sanity/lib/queries.ts', { 'next-sanity': { defineQuery: (query) => query } })
const { prepareArticleUnpublish } = load('../src/sanity/lib/prepareArticleUnpublish.ts', {
  './articleReferences.mjs': { articleReferenceUpdates },
})
const { orderedCategoryPageArticles } = load('../src/lib/categoryLanding.ts')
const ref = (_ref, _key) => ({ _type: 'reference', _ref, _key })

test('reference migration preserves IDs, array order, content and non-article references', () => {
  const document = {
    _id: 'homePage', _rev: 'revision',
    sections: [{ _key: 'section', article: ref('article', 'main'), author: ref('person', 'author') }],
    related: [ref('article', 'first'), ref('other-article', 'second')],
    legacy: [{ _type: 'reference', _ref: 'article' }],
  }
  const original = structuredClone(document)
  const update = articleReferenceUpdates(document, new Set(['article']))
  assert.equal(update.referenceCount, 3)
  assert.deepEqual(update.set, {
    'sections[_key=="section"].article._weak': true,
    'related[_key=="first"]._weak': true,
    'legacy[0]._weak': true,
  })
  assert.deepEqual(document, original)
})

test('draft references stay weak when published and already migrated references are unchanged', () => {
  const document = {
    articles: [{ ...ref('article', 'first'), _weak: true, _strengthenOnPublish: { type: 'article' } }],
  }
  assert.deepEqual(articleReferenceUpdates(document, new Set(['article'])), {
    referenceCount: 1,
    set: { 'articles[_key=="first"]._strengthenOnPublish.weak': true },
  })
  document.articles[0]._strengthenOnPublish.weak = true
  assert.equal(articleReferenceUpdates(document, new Set(['article'])).referenceCount, 0)
})

test('preparing Unpublish patches existing references in one guarded transaction without touching article content', async () => {
  const dataset = [
    { _id: 'categoryPage', _rev: 'c1', interiorsArticles: [ref('article', 'first')] },
    { _id: 'drafts.storiesPage', _rev: 's1', articles: [ref('article', 'second')] },
  ]
  const realClient = createClient({ projectId: 'example', dataset: 'production', apiVersion: '2026-03-06', useCdn: false })
  let mutations
  const client = {
    fetch: async (query, params, options) => {
      assert.equal(options.perspective, 'raw')
      assert.deepEqual(params.ids, ['article', 'drafts.article'])
      return (await evaluate(parse(query), { dataset, params })).get()
    },
    transaction: () => {
      const transaction = realClient.transaction()
      transaction.commit = async (options) => {
        assert.equal(options.visibility, 'sync')
        mutations = transaction.serialize()
      }
      return transaction
    },
  }
  assert.equal(await prepareArticleUnpublish(client, 'article'), 2)
  assert.equal(mutations.length, 2)
  for (const mutation of mutations) {
    assert.deepEqual(Object.keys(mutation), ['patch'])
    assert.ok(mutation.patch.ifRevisionID)
    assert.ok(Object.keys(mutation.patch.set).every((path) => path.endsWith('._weak')))
  }
  client.transaction = () => {
    const transaction = realClient.transaction()
    transaction.commit = async () => { throw new Error('Revision conflict') }
    return transaction
  }
  await assert.rejects(prepareArticleUnpublish(client, 'article'), /Revision conflict/)
})

const article = (id) => ({ _id: id, _type: 'article', title: id, slug: { current: id }, categories: ['interiors'] })
const published = article('visible')
const unpublished = article('hidden')
const pages = [
  { _id: 'categoryPage', _type: 'categoryPage', interiorsArticles: [ref('hidden', 'first'), ref('visible', 'second')] },
  { _id: 'storiesPage', _type: 'storiesPage', articles: [ref('hidden', 'first'), ref('visible', 'second')] },
  { _id: 'homePage', _type: 'homePage', sections: [
    { _key: 'hidden-section', _type: 'homeArticleBlock', article: ref('hidden'), menuAppearance: { textColor: 'white' } },
    { _key: 'row', _type: 'homeThreeArticlesBlock', articles: [ref('hidden', 'first'), ref('visible', 'second')], menuAppearance: { textColor: 'black' } },
  ] },
]
async function runQuery(name, dataset, params = {}) {
  return (await evaluate(parse(queries[name]), { dataset, params })).get()
}

test('unpublished references disappear from public lists and do not leave broken cards or homepage sections', async () => {
  // The published perspective omits drafts; the article content remains stored as a draft in Sanity.
  const dataset = [...pages, { ...published, relatedArticles: [ref('hidden')] }]
  const category = await runQuery('CATEGORY_PAGE_QUERY', dataset)
  assert.deepEqual(category.interiorsArticles.map((row) => row._id), ['visible'])
  const stories = await runQuery('STORIES_PAGE_QUERY', dataset)
  assert.deepEqual(stories.articles.map((row) => row._id), ['visible'])
  const home = await runQuery('HOME_PAGE_QUERY', dataset)
  assert.equal(home.sections.length, 1)
  assert.equal(home.sections[0]._key, 'row')
  assert.deepEqual(home.sections[0].articles.map((row) => row._id), ['visible'])
  const menu = await runQuery('HOME_MENU_QUERY', dataset)
  assert.equal(menu.menuAppearance.textColor, 'black')
  assert.equal(await runQuery('ARTICLE_BY_STORY_SLUG_QUERY', dataset, { slug: 'hidden' }), null)
  const visible = await runQuery('ARTICLE_BY_STORY_SLUG_QUERY', dataset, { slug: 'visible' })
  assert.deepEqual(visible.relatedArticles, [])
  assert.deepEqual(orderedCategoryPageArticles([null, { _id: 'visible', slug: 'visible' }]), [{ _id: 'visible', slug: 'visible' }])
})

test('republishing restores the original placement in categories, Stories and the homepage', async () => {
  const dataset = [...pages, published, unpublished]
  const category = await runQuery('CATEGORY_PAGE_QUERY', dataset)
  assert.deepEqual(category.interiorsArticles.map((row) => row._id), ['hidden', 'visible'])
  const stories = await runQuery('STORIES_PAGE_QUERY', dataset)
  assert.deepEqual(stories.articles.map((row) => row._id), ['hidden', 'visible'])
  const home = await runQuery('HOME_PAGE_QUERY', dataset)
  assert.equal(home.sections[0].article._id, 'hidden')
  assert.deepEqual(home.sections[1].articles.map((row) => row._id), ['hidden', 'visible'])
})
