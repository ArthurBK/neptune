/* eslint-disable @typescript-eslint/no-require-imports -- Test the browser integration without contacting Google. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { JSDOM } = require('jsdom')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loaded = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), loaded, loaded.exports)
  return loaded.exports
}

async function browser(run, url = 'https://neptune-papers.com/stories/one') {
  const dom = new JSDOM('<title>Neptune</title><main><article data-analytics-article-id="id-one" data-analytics-article-title="Story One" data-analytics-article-path="/stories/one"><h1>Story One</h1><div data-analytics-reading-body></div></article></main><div id="root"></div>', { url, pretendToBeVisual: true })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  const consent = load('src/lib/cookieConsent.ts')
  const analytics = load('src/lib/googleAnalytics.ts', { './cookieConsent': consent })
  const context = () => ({ pathname: window.location.pathname, production: true, isPreview: false })
  const commands = () => (window.dataLayer || []).map(args => Array.from(args))
  const events = name => commands().filter(args => args[0] === 'event' && (!name || args[1] === name))
  try { await run({ consent, analytics, context, commands, events }) }
  finally {
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
}

test('Google is not loaded before consent or after refusal', async () => browser(({ consent, analytics, context, events }) => {
  analytics.syncGoogleAnalytics(context())
  assert.equal(document.querySelector('script'), null)
  assert.equal(window.gtag, undefined)
  consent.saveCookieConsent('false')
  analytics.syncGoogleAnalytics(context())
  analytics.trackNewsletterSignup()
  analytics.trackArticleScroll()
  assert.equal(document.querySelector('script'), null)
  assert.equal(events().length, 0)
}))

test('acceptance loads one tag and counts each navigation once with article titles', async () => browser(({ consent, analytics, context, commands, events }) => {
  consent.saveCookieConsent('true')
  analytics.syncGoogleAnalytics(context())
  analytics.syncGoogleAnalytics(context())
  assert.equal(document.querySelectorAll('script').length, 1)
  assert.equal(new URL(document.querySelector('script').src).searchParams.get('id'), 'G-YHCN71B9JT')
  assert.equal(commands().filter(args => args[0] === 'config').length, 1)
  assert.equal(commands().find(args => args[0] === 'config')[2].send_page_view, false)
  assert.equal(events('page_view').length, 1)
  assert.equal(events('page_view')[0][2].page_title, 'Story One | Neptune Papers')
  window.history.pushState({}, '', '/stories/two')
  document.querySelector('article').dataset.analyticsArticleId = 'id-two'
  document.querySelector('article').dataset.analyticsArticlePath = '/stories/two'
  document.querySelector('article').dataset.analyticsArticleTitle = 'Story Two'
  analytics.syncGoogleAnalytics(context())
  assert.equal(events('page_view').length, 2)
  assert.equal(events('page_view')[1][2].page_referrer, 'https://neptune-papers.com/stories/one')
  assert.equal(events('page_view')[1][2].article_id, 'id-two')
}))

test('production host, Studio, draft mode and development gates prevent collection', async () => {
  for (const url of ['http://localhost:3000/', 'https://neptune-preview.vercel.app/', 'https://neptune-papers.com/studio/structure']) {
    await browser(({ consent, analytics, context }) => {
      consent.saveCookieConsent('true')
      analytics.syncGoogleAnalytics(context())
      assert.equal(document.querySelector('script'), null)
    }, url)
  }
  for (const excluded of [{ production: false }, { isPreview: true }]) {
    await browser(({ consent, analytics, context }) => {
      consent.saveCookieConsent('true')
      analytics.syncGoogleAnalytics({ ...context(), ...excluded })
      assert.equal(document.querySelector('script'), null)
    })
  }
})

test('revocation stops events and removes analytics cookies without deleting consent', async () => browser(({ consent, analytics, context, events }) => {
  consent.saveCookieConsent('true')
  analytics.syncGoogleAnalytics(context())
  document.cookie = '_ga=test; path=/; domain=neptune-papers.com'
  document.cookie = '_ga_YHCN71B9JT=test; path=/'
  consent.saveCookieConsent('false')
  analytics.syncGoogleAnalytics(context())
  analytics.trackNewsletterSignup()
  assert.equal(window['ga-disable-G-YHCN71B9JT'], true)
  assert.doesNotMatch(document.cookie, /_ga/)
  assert.equal(consent.getCookieConsentValue(), 'false')
  assert.equal(events('newsletter_signup').length, 0)
  consent.saveCookieConsent('true')
  analytics.syncGoogleAnalytics(context())
  analytics.trackNewsletterSignup()
  assert.equal(window['ga-disable-G-YHCN71B9JT'], false)
  assert.equal(document.querySelectorAll('script').length, 1)
  assert.equal(events('newsletter_signup').length, 1)
}))

test('entering Studio disables an already loaded tag and blocks events before route effects run', async () => browser(({ consent, analytics, context, events }) => {
  consent.saveCookieConsent('true')
  analytics.syncGoogleAnalytics(context())
  window.history.pushState({}, '', '/studio/structure')
  analytics.trackNewsletterSignup()
  assert.equal(events('newsletter_signup').length, 0)
  analytics.syncGoogleAnalytics(context())
  assert.equal(window['ga-disable-G-YHCN71B9JT'], true)
  assert.equal(events('page_view').length, 1)
}))

test('scroll thresholds are unique per article and exclude hidden tabs', async () => browser(({ consent, analytics, context, events }) => {
  consent.saveCookieConsent('true')
  analytics.syncGoogleAnalytics(context())
  const body = document.querySelector('[data-analytics-reading-body]')
  body.getBoundingClientRect = () => ({ top: window.innerHeight - 600, height: 1000 })
  analytics.trackArticleScroll()
  analytics.trackArticleScroll()
  assert.deepEqual(events('article_scroll').map(event => event[2].percent_scrolled), [25, 50])
  body.getBoundingClientRect = () => ({ top: window.innerHeight - 1000, height: 1000 })
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
  analytics.trackArticleScroll()
  assert.equal(events('article_scroll').length, 2)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  analytics.trackArticleScroll()
  assert.deepEqual(events('article_scroll').map(event => event[2].percent_scrolled), [25, 50, 75, 90])
  window.history.pushState({}, '', '/stories/two')
  document.querySelector('article').dataset.analyticsArticlePath = '/stories/two'
  analytics.syncGoogleAnalytics(context())
  analytics.trackArticleScroll()
  assert.equal(events('article_scroll').length, 8)
}))

test('events omit email and arbitrary query parameters while preserving campaign attribution', async () => browser(({ consent, analytics, context, commands }) => {
  consent.saveCookieConsent('true')
  analytics.syncGoogleAnalytics(context())
  analytics.trackNewsletterSignup()
  const data = JSON.stringify(commands())
  assert.doesNotMatch(data, /person@example|secret|email=/)
  assert.match(data, /utm_source=newsletter/)
}, 'https://neptune-papers.com/stories/one?email=person@example.com&secret=private&utm_source=newsletter'))

test('the React component responds to consent, navigation and Strict Mode without duplicate views', async () => browser(async ({ consent, analytics, events }) => {
  let pathname = window.location.pathname
  const { GoogleAnalytics } = load('src/components/analytics/GoogleAnalytics.tsx', {
    'next/navigation': { usePathname: () => pathname },
    '@/lib/cookieConsent': consent,
    '@/lib/googleAnalytics': analytics,
  })
  const { createRoot } = require('react-dom/client')
  const root = createRoot(document.getElementById('root'))
  const render = () => React.act(async () => root.render(React.createElement(React.StrictMode, null,
    React.createElement(GoogleAnalytics, { production: true, isPreview: false }))))
  try {
    await render()
    assert.equal(document.querySelector('script'), null)
    await React.act(async () => consent.saveCookieConsent('true'))
    assert.equal(events('page_view').length, 1)
    await render()
    assert.equal(events('page_view').length, 1)
    pathname = '/stories/two'
    window.history.pushState({}, '', pathname)
    document.querySelector('article').dataset.analyticsArticlePath = '/stories/two'
    await render()
    assert.equal(events('page_view').length, 2)
    await React.act(async () => consent.resetCookieConsentValue())
    assert.equal(window['ga-disable-G-YHCN71B9JT'], true)
    analytics.trackNewsletterSignup()
    assert.equal(events('newsletter_signup').length, 0)
  } finally { await React.act(async () => root.unmount()) }
}))

test('streamed articles are counted only when their own title and body arrive', async () => browser(async ({ consent, analytics, events }) => {
  const main = document.querySelector('main')
  const article = main.innerHTML
  main.innerHTML = 'Loading…'
  consent.saveCookieConsent('true')
  const { GoogleAnalytics } = load('src/components/analytics/GoogleAnalytics.tsx', {
    'next/navigation': { usePathname: () => '/stories/one' },
    '@/lib/cookieConsent': consent, '@/lib/googleAnalytics': analytics,
  })
  const { createRoot } = require('react-dom/client')
  const root = createRoot(document.getElementById('root'))
  try {
    await React.act(async () => root.render(React.createElement(GoogleAnalytics, { production: true, isPreview: false })))
    assert.equal(events('page_view').length, 0)
    assert.equal(document.querySelector('script'), null)
    await React.act(async () => { main.innerHTML = article })
    assert.equal(events('page_view').length, 1)
    assert.equal(events('page_view')[0][2].page_title, 'Story One | Neptune Papers')
  } finally { await React.act(async () => root.unmount()) }
}))
