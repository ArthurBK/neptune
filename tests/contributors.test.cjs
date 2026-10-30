/* eslint-disable @typescript-eslint/no-require-imports -- Execute the actual GROQ queries against isolated fixtures. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { parse, evaluate } = require('groq-js')

const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/sanity/lib/queries.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText
const queries = {}
new Function('require', 'exports', source)(() => ({ defineQuery: (query) => query }), queries)

const richBio = [{
  _type: 'block', _key: 'bio', style: 'normal', markDefs: [],
  children: [{ _type: 'span', _key: 'text', text: 'A photographer and writer.', marks: [] }],
}]
const dataset = [
  { _id: 'new-person', _type: 'contributor', name: 'Alex', slug: { current: 'alex' }, bioRichText: richBio },
  { _id: 'legacy-person', _type: 'photographer', name: 'Other Alex', slug: { current: 'alex' }, bio: 'Original bio.', bioRichText: richBio },
  { _id: 'solo-person', _type: 'contributor', name: 'Sam', slug: { current: 'sam' }, bioRichText: richBio },
  { _id: 'writing', _type: 'article', slug: { current: 'writing' }, author: { _ref: 'new-person' } },
  { _id: 'photos', _type: 'article', slug: { current: 'photos' }, photographer: { _ref: 'new-person' } },
  { _id: 'both', _type: 'article', slug: { current: 'both' }, author: { _ref: 'new-person' }, photographer: { _ref: 'new-person' } },
  { _id: 'legacy-photos', _type: 'article', slug: { current: 'legacy-photos' }, photographer: { _ref: 'legacy-person' } },
  { _id: 'storiesPage', _type: 'storiesPage', articles: ['writing', 'photos', 'both', 'legacy-photos'].map(_ref => ({ _type: 'reference', _ref })) },
]

async function query(name, params = {}) {
  return (await evaluate(parse(queries[name]), { dataset, params: { isPreview: false, ...params } })).get()
}

test('a contributor profile includes writing and photography once, using exact references', async () => {
  const articles = await query('ARTICLES_BY_CONTRIBUTOR_QUERY', { contributorId: 'new-person' })
  assert.deepEqual(articles.map((article) => article._id).sort(), ['both', 'photos', 'writing'])
})

test('legacy photographer URLs keep their original person when slugs overlap', async () => {
  const person = await query('PHOTOGRAPHER_BY_SLUG_QUERY', { slug: 'alex' })
  assert.equal(person._id, 'legacy-person')
  assert.equal(person.bio, 'Original bio.')
  assert.deepEqual(person.bioRichText, richBio)
  const articles = await query('ARTICLES_BY_PHOTOGRAPHER_QUERY', { photographerId: person._id })
  assert.deepEqual(articles.map((article) => article._id), ['legacy-photos'])
})

test('photographer profile lookup also supports newly created contributors and rich biographies', async () => {
  const person = await query('PHOTOGRAPHER_BY_SLUG_QUERY', { slug: 'sam' })
  assert.equal(person._id, 'solo-person')
  assert.deepEqual(person.bioRichText, richBio)
  assert.equal(await query('PHOTOGRAPHER_BY_SLUG_QUERY', { slug: 'missing' }), null)
})

test('article credits link new contributors and legacy photographers to their respective profiles', async () => {
  const current = await query('ARTICLE_BY_STORY_SLUG_QUERY', { slug: 'photos' })
  const legacy = await query('ARTICLE_BY_STORY_SLUG_QUERY', { slug: 'legacy-photos' })
  assert.equal(current.photographer.profileHref, '/contributors/alex')
  assert.equal(legacy.photographer.profileHref, '/contributors/photographer/alex')
})

test('the public directory includes each document once and retains rich biographies', async () => {
  const current = await query('CONTRIBUTORS_LIST_PAGE_QUERY')
  const legacy = await query('PHOTOGRAPHERS_LIST_PAGE_QUERY')
  assert.equal(new Set([...current, ...legacy].map((person) => person._id)).size, 3)
  assert.equal(current.length + legacy.length, 3)
  assert.deepEqual(legacy[0].bioRichText, richBio)
  assert.equal(current.find((person) => person._id === 'new-person').articleCount, 3)
})

test('public profiles exclude published articles outside Stories and respect an empty selection', async () => {
  for (const [name, params] of [
    ['ARTICLES_BY_CONTRIBUTOR_QUERY', { contributorId: 'christina' }],
    ['ARTICLES_BY_PHOTOGRAPHER_QUERY', { photographerId: 'christina' }],
  ]) {
    const articles = ['lisa', 'julianne'].map(id => ({
      _id: id, _type: 'article', slug: { current: id },
      author: { _ref: 'christina' }, photographer: { _ref: 'christina' },
    }))
    const run = async (selection, isPreview = false) => (await evaluate(parse(queries[name]), {
      dataset: [...articles, ...(selection === null ? [] : [{
        _id: 'storiesPage', _type: 'storiesPage', articles: selection.map(_ref => ({ _ref })),
      }])], params: { ...params, isPreview },
    })).get()
    assert.deepEqual((await run(['lisa', 'unpublished-or-deleted'])).map(a => a._id), ['lisa'])
    assert.deepEqual(await run([]), [])
    assert.deepEqual(await run(null), [])
    assert.deepEqual((await run(['lisa'], true)).map(a => a._id).sort(), ['julianne', 'lisa'])
  }
})
