/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TS code with an isolated Sanity transaction. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { createClient } = require('@sanity/client')
const { parse, evaluate } = require('groq-js')

function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loadedModule = { exports: {} }
  new Function('require', 'module', 'exports', source)(
    (name) => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports,
  )
  return loadedModule.exports
}

const { deleteContributor } = load('src/sanity/lib/deleteContributor.ts')
const queries = load('src/sanity/lib/queries.ts', { 'next-sanity': { defineQuery: (query) => query } })
const { ContributorCredit } = load('src/components/editorial/ContributorCredit.tsx')
const { ArticleCard } = load('src/components/editorial/ArticleCard.tsx', {
  '@/components/editorial/ContributorCredit': { ContributorCredit },
  '@/lib/articleTitle': { articleTitleSingleLine: (title) => title },
  '@/sanity/lib/image': { urlFor: () => { throw new Error('Fixture has no image') } },
})

const reference = (_ref) => ({ _type: 'reference', _ref })
const fixtures = () => [
  { _id: 'person', _rev: 'p1', _type: 'contributor', name: 'Published Name', slug: { current: 'person' } },
  { _id: 'drafts.person', _rev: 'd1', _type: 'contributor', name: 'Unpublished Rename' },
  { _id: 'other-person', _rev: 'o1', _type: 'contributor', name: 'Other Person', slug: { current: 'other' } },
  { _id: 'article', _rev: 'a1', _type: 'article', title: 'Article stays', slug: { current: 'story' }, author: reference('person'), photographer: reference('person'), body: [{ text: 'Keep this content' }] },
  { _id: 'drafts.article', _rev: 'a2', _type: 'article', title: 'Unpublished edit', author: reference('person'), photographer: reference('other-person') },
  { _id: 'drafts.new-article', _rev: 'a3', _type: 'article', author: reference('drafts.person') },
  { _id: 'unrelated', _rev: 'u1', _type: 'article', author: reference('other-person') },
  { _id: 'homePage', _rev: 'h1', _type: 'homePage', sections: [{ _key: 'section', _type: 'homeArticleBlock', article: reference('article') }] },
]

async function query(queryText, dataset, params = {}) {
  return (await evaluate(parse(queryText), { dataset, params })).get()
}

function storage(initial, failCommit = false) {
  const state = { documents: structuredClone(initial), commits: [] }
  const realClient = createClient({ projectId: 'example', dataset: 'production', apiVersion: '2026-03-06', useCdn: false })
  const client = {
    fetch: async (text, params, options) => {
      assert.equal(options.perspective, 'raw')
      return query(text, state.documents, params)
    },
    transaction: () => {
      const transaction = realClient.transaction()
      transaction.commit = async () => {
        const mutations = transaction.serialize()
        state.commits.push(mutations)
        if (failCommit) throw new Error('Revision conflict')
        const documents = structuredClone(state.documents)
        for (const mutation of mutations) {
          if (mutation.patch) {
            const patch = mutation.patch
            const document = documents.find((doc) => doc._id === patch.id)
            assert.equal(patch.ifRevisionID, document._rev)
            Object.assign(document, patch.set)
            for (const [field, value] of Object.entries(patch.setIfMissing ?? {})) {
              if (!(field in document)) document[field] = value
            }
            for (const field of patch.unset ?? []) delete document[field]
          } else if (mutation.delete) {
            documents.splice(documents.findIndex((doc) => doc._id === mutation.delete.id), 1)
          }
        }
        state.documents = documents
      }
      return transaction
    },
  }
  return { client, state }
}

test('deletion atomically preserves published and draft credits without publishing article edits', async () => {
  const initial = fixtures()
  const { client, state } = storage(initial)
  assert.deepEqual(await deleteContributor(client, 'person'), { articleCount: 3 })
  assert.equal(state.commits.length, 1)
  assert.equal(state.documents.some((doc) => ['person', 'drafts.person'].includes(doc._id)), false)
  const article = state.documents.find((doc) => doc._id === 'article')
  assert.equal(article.authorName, 'Published Name')
  assert.equal(article.photographerName, 'Published Name')
  assert.equal(article.author, undefined)
  assert.equal(article.photographer, undefined)
  assert.equal(article.title, 'Article stays')
  assert.deepEqual(article.body, initial.find((doc) => doc._id === 'article').body)
  const draft = state.documents.find((doc) => doc._id === 'drafts.article')
  assert.equal(draft.title, 'Unpublished edit')
  assert.equal(draft.authorName, 'Published Name')
  assert.deepEqual(draft.photographer, reference('other-person'))
  assert.equal(state.documents.find((doc) => doc._id === 'drafts.new-article').authorName, 'Unpublished Rename')
  for (const id of ['unrelated', 'other-person', 'homePage']) {
    assert.deepEqual(state.documents.find((doc) => doc._id === id), initial.find((doc) => doc._id === id))
  }
})

test('article and homepage queries return the saved names without links after deletion', async () => {
  const { client, state } = storage(fixtures())
  await deleteContributor(client, 'person')
  const article = await query(queries.ARTICLE_BY_STORY_SLUG_QUERY, state.documents, { slug: 'story' })
  assert.deepEqual(article.author, { name: 'Published Name', slug: null })
  assert.deepEqual(article.photographer, { name: 'Published Name', slug: null, profileHref: null })
  const home = await query(queries.HOME_PAGE_QUERY, state.documents)
  assert.deepEqual(home.sections[0].article.author, article.author)
  const results = await query(queries.ARTICLES_SEARCH_QUERY, state.documents, { query: 'Published*' })
  assert.ok(results.some((result) => result._id === 'article'))
})

test('replacement contributors take precedence over a saved plain-text credit', async () => {
  const dataset = fixtures()
  dataset.find((doc) => doc._id === 'article').authorName = 'Previous author'
  const article = await query(queries.ARTICLE_BY_STORY_SLUG_QUERY, dataset, { slug: 'story' })
  assert.equal(article.author.name, 'Published Name')
  assert.equal(article.author.slug, 'person')
})

test('legacy photographer deletion and draft-only profiles also retain credits', async () => {
  for (const type of ['photographer', 'contributor']) {
    const { client, state } = storage([
      { _id: 'drafts.person', _rev: 'p1', _type: type, name: 'Draft Name' },
      { _id: 'drafts.article', _rev: 'a1', _type: 'article', photographer: reference('person') },
    ])
    await deleteContributor(client, 'drafts.person')
    assert.equal(state.documents.length, 1)
    assert.equal(state.documents[0].photographerName, 'Draft Name')
  }
})

test('an unnamed referenced contributor is never deleted', async () => {
  const initial = fixtures().filter((doc) => doc._id !== 'drafts.person')
  initial.find((doc) => doc._id === 'person').name = ' '
  const { client, state } = storage(initial)
  await assert.rejects(deleteContributor(client, 'person'), /Add a name/)
  assert.equal(state.commits.length, 0)
  assert.deepEqual(state.documents, initial)
})

test('failed transaction propagates the error without a separate deletion or retry', async () => {
  const initial = fixtures()
  const { client, state } = storage(initial, true)
  await assert.rejects(deleteContributor(client, 'person'), /Revision conflict/)
  assert.equal(state.commits.length, 1)
  assert.deepEqual(state.documents, initial)
})

test('saved credits render as plain text while the article and active contributor links still work', () => {
  assert.equal(renderToStaticMarkup(React.createElement(ContributorCredit, { href: null }, 'Name')), '<span>Name</span>')
  assert.match(renderToStaticMarkup(React.createElement(ContributorCredit, { href: '/contributors/person' }, 'Name')), /href="\/contributors\/person"/)
  for (const layout of [{}, { horizontal: true }, { fillHeight: true }]) {
    const html = renderToStaticMarkup(React.createElement(ArticleCard, {
      ...layout, title: 'Article stays', slug: 'story', coverImage: {}, author: { name: 'Published Name', slug: null },
    }))
    assert.match(html, /By Published Name/)
    assert.match(html, /href="\/stories\/story"/)
    assert.doesNotMatch(html, /href="\/contributors\//)
  }
})
