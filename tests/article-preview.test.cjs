/* eslint-disable @typescript-eslint/no-require-imports -- Isolated integration harness for TS modules. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loadedModule = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports)
  return loadedModule.exports
}

const presentation = load('src/sanity/presentation/resolve.ts', {
  'sanity/presentation': { defineDocuments: value => value, defineLocations: value => value },
})

test('article locations support unpublished documents and explain missing slugs', () => {
  const resolver = presentation.resolve.locations.article.resolve
  assert.equal(resolver({ title: 'Draft article', slug: 'new-story' }).locations[0].href, '/stories/new-story')
  for (const slug of [undefined, null, '', '  ']) {
    assert.equal(presentation.articlePreviewPath(slug), null)
    assert.match(resolver({ slug }).message, /Generate a slug/)
  }
  assert.equal(presentation.articlePreviewPath('a/b?c'), '/stories/a%2Fb%3Fc')
})

test('Preview action opens the draft slug in Presentation without publishing', () => {
  const navigations = []
  let completed = 0
  const { articlePreviewAction } = load('src/sanity/actions/articlePreviewAction.ts', {
    '@sanity/icons': { EyeOpenIcon: () => null },
    'sanity/router': { useRouter: () => ({ navigateIntent: (...args) => navigations.push(args) }) },
    '../presentation/resolve': presentation,
  })
  const props = {
    id: 'article-id', draft: { slug: { current: 'draft-slug' } },
    published: { slug: { current: 'old-slug' } }, onComplete: () => completed++,
  }
  articlePreviewAction(props).onHandle()
  assert.deepEqual(navigations, [['edit', {
    id: 'article-id', type: 'article', mode: 'presentation', presentation: 'presentation', preview: '/stories/draft-slug',
  }]])
  assert.equal(completed, 1)
  const missingSlug = articlePreviewAction({ ...props, draft: {} })
  assert.equal(missingSlug.disabled, true)
  missingSlug.onHandle()
  assert.equal(navigations.length, 1)
  assert.equal(articlePreviewAction({ ...props, draft: null }).disabled, false)
})

function draftEndpoint(token = 'test-viewer-token') {
  const state = { enabled: false, queries: [], cookies: new Map([['__prerender_bypass', { value: 'test-cookie' }]]) }
  const headers = {
    draftMode: async () => ({
      get isEnabled() { return state.enabled },
      enable: () => { state.enabled = true },
      disable: () => { state.enabled = false },
    }),
    cookies: async () => ({
      get: name => state.cookies.get(name),
      set: cookie => state.cookies.set(cookie.name, cookie),
    }),
  }
  function makeClient(config = {}) {
    return {
      config: () => config,
      withConfig: options => makeClient({ ...config, ...options }),
      fetch: async (query, params, options) => {
        state.queries.push({ query, params, options, config })
        return { private: params.secret === 'valid-test-secret' ? {
          _id: 'drafts.test-secret', _updatedAt: new Date().toISOString(),
          secret: 'valid-test-secret', studioUrl: 'https://neptune-papers.com/studio',
        } : null, public: null }
      },
    }
  }
  // Exercise the installed next-sanity handler and real Sanity secret validator.
  const handler = load('node_modules/next-sanity/src/draft-mode/define-enable-draft-mode.ts', {
    'next/headers': headers,
    'next/navigation': { redirect: location => new Response(null, { status: 307, headers: { Location: location } }) },
  })
  const { GET } = load('src/app/api/draft-mode/enable/route.ts', {
    'next-sanity/draft-mode': handler,
    '@/sanity/lib/client': { client: makeClient() },
    '@/sanity/lib/token': { readToken: token },
  })
  const { POST } = load('src/app/api/draft-mode/disable/route.ts', { 'next/headers': headers })
  return { GET, POST, state }
}

test('preview requires configuration and a valid Sanity secret', async () => {
  const missing = draftEndpoint(null)
  assert.equal((await missing.GET(new Request('https://neptune-papers.com/api/draft-mode/enable'))).status, 503)
  assert.equal(missing.state.enabled, false)
  assert.equal(missing.state.queries.length, 0)

  const { GET, state } = draftEndpoint()
  const response = await GET(new Request('https://neptune-papers.com/api/draft-mode/enable?sanity-preview-secret=invalid'))
  assert.equal(response.status, 401)
  assert.equal(state.enabled, false)
  assert.equal(state.queries[0].config.perspective, 'raw')
  assert.equal(state.queries[0].options.cache, 'no-store')
})

test('authenticated preview sets an HTTP-only cookie and exits without caching', async () => {
  const { GET, POST, state } = draftEndpoint()
  const url = new URL('https://neptune-papers.com/api/draft-mode/enable')
  url.searchParams.set('sanity-preview-secret', 'valid-test-secret')
  url.searchParams.set('sanity-preview-pathname', '/stories/new-article')
  const response = await GET(new Request(url))
  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), '/stories/new-article')
  assert.equal(state.enabled, true)
  assert.equal(state.cookies.get('__prerender_bypass').httpOnly, true)
  assert.equal(state.cookies.get('__prerender_bypass').path, '/')
  const exit = await POST()
  assert.equal(exit.status, 204)
  assert.equal(exit.headers.get('cache-control'), 'private, no-store')
  assert.equal(state.enabled, false)
})

test('preview redirects cannot send a visitor to another origin', async () => {
  const { GET } = draftEndpoint()
  const url = new URL('https://neptune-papers.com/api/draft-mode/enable')
  url.searchParams.set('sanity-preview-secret', 'valid-test-secret')
  url.searchParams.set('sanity-preview-pathname', 'https://example.com/stories/test')
  const response = await GET(new Request(url))
  assert.equal(response.headers.get('location'), '/stories/test')
})

test('article fetching uses published content normally and authenticated drafts only in Draft Mode', async () => {
  let draft = false
  let configured = true
  const calls = []
  const nextHeaders = {
    draftMode: async () => ({ isEnabled: draft }),
    cookies: async () => ({ has: () => false }),
  }
  const perspective = load('node_modules/next-sanity/src/live/resolveCookiePerspective.ts', {
    'next/headers': nextHeaders,
    './utils': { sanitizePerspective: value => value },
  })
  const realLive = load('node_modules/next-sanity/src/live/defineLive.tsx', {
    'next/headers': nextHeaders,
    './resolveCookiePerspective': perspective,
    'next-sanity/live/client-components/live': { default: () => null, __esModule: true },
    'next-sanity/live/client-components/live-stream': { default: () => null, __esModule: true },
  })
  const client = {
    withConfig: () => client,
    config: () => ({ stega: {} }),
    fetch: async (query, params, options) => {
      calls.push(options)
      return { result: options.perspective === 'drafts' && options.token === 'viewer'
        ? { title: 'Unpublished changes' } : { title: 'Published article' }, syncTags: ['article'] }
    },
  }
  const { articleFetch } = load('src/sanity/lib/live.ts', {
    'server-only': {}, 'next-sanity/live': realLive, 'next/headers': nextHeaders,
    './client': { client }, './token': {
      readToken: 'viewer', requireReadToken: () => { if (!configured) throw new Error('Missing Viewer token') },
    },
  })
  assert.deepEqual(await articleFetch('query'), { title: 'Published article' })
  assert.equal(calls.at(-1).perspective, 'published')
  assert.equal(calls.at(-1).token, undefined)
  assert.equal(calls.at(-1).stega, false)
  draft = true
  assert.deepEqual(await articleFetch('query'), { title: 'Unpublished changes' })
  assert.equal(calls.at(-1).perspective, 'drafts')
  assert.equal(calls.at(-1).useCdn, false)
  assert.equal(calls.at(-1).token, 'viewer')
  configured = false
  await assert.rejects(articleFetch('query'), /Missing Viewer token/)
})

test('contributor and photographer profiles include draft contributions only while previewing', async () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const { parse, evaluate } = require('groq-js')
  const queries = load('src/sanity/lib/queries.ts', { 'next-sanity': { defineQuery: query => query } })
  for (const [file, personType, credit] of [
    ['src/app/contributors/[slug]/page.tsx', 'contributor', 'author'],
    ['src/app/contributors/photographer/[slug]/page.tsx', 'photographer', 'photographer'],
  ]) {
    let preview = false
    const person = { _id: 'christina', _type: personType, slug: { current: 'christina' }, name: 'Christina Holevas' }
    const article = (id, title, personId = person._id) => ({
      _id: id, _type: 'article', title, slug: { current: id }, [credit]: { _ref: personId },
    })
    const published = [person, article('julianne-moore', 'Julianne Moore'), article('selected', 'Selected story'), {
      _id: 'storiesPage', _type: 'storiesPage', articles: [{ _ref: 'selected' }],
    }]
    const drafts = [article('lisa-eisner', 'Lisa Eisner'), article('unrelated', 'Unrelated draft', 'someone-else')]
    const fetchContent = async (query, params = {}) => {
      const data = await (await evaluate(parse(query), { dataset: preview ? [...published, ...drafts] : published, params })).get()
      // Also exercise a profile returned with a drafts-prefixed identity.
      if (preview && data?._id === person._id) return { ...data, _id: `drafts.${person._id}` }
      return data
    }
    const { default: Page, generateStaticParams } = load(file, {
      'next/image': { default: () => null, __esModule: true },
      'next/link': { default: props => React.createElement('a', props), __esModule: true },
      'next/navigation': { notFound: () => { throw new Error('NOT_FOUND') } },
      'next/headers': { draftMode: async () => ({ isEnabled: preview }) },
      '@/sanity/lib/client': { client: { fetch: () => [{ slug: 'christina' }] } },
      '@/sanity/lib/live': { articleFetch: fetchContent },
      '@/sanity/lib/contributors': { isContributorsVisible: async () => true },
      '@/sanity/lib/queries': queries,
      '@/sanity/lib/image': { urlFor: () => { throw new Error('Unexpected image') } },
      '@/components/shared/AdBanner': { AdBanner: () => null },
      '@/components/editorial/ArticleCard': { ArticleCard: ({ title, slug }) => React.createElement('a', { href: `/stories/${slug}` }, title) },
      '@/components/shared/PageIntroText': { hasPortableTextContent: () => false, PageIntroText: () => null },
    })
    const render = async () => renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: 'christina' }) }))
    assert.match(await render(), /Selected story/)
    assert.doesNotMatch(await render(), /Julianne Moore/)
    assert.doesNotMatch(await render(), /Lisa Eisner/)
    preview = true
    const html = await render()
    assert.match(html, /href="\/stories\/lisa-eisner">Lisa Eisner/)
    assert.match(html, /Julianne Moore/)
    assert.doesNotMatch(html, /Unrelated draft/)
    assert.equal((html.match(/>Lisa Eisner</g) ?? []).length, 1)
    assert.deepEqual(await generateStaticParams(), [{ slug: 'christina' }])
    preview = false
    assert.doesNotMatch(await render(), /Lisa Eisner/)
    assert.doesNotMatch(await render(), /Julianne Moore/)
  }
})
