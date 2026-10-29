/* eslint-disable @typescript-eslint/no-require-imports -- Test the actual consent component and browser storage. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { JSDOM, CookieJar } = require('jsdom')
const { renderToString } = require('react-dom/server')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => mocks[name] ?? require(name), mod, mod.exports)
  return mod.exports
}
const consent = load('src/lib/cookieConsent.ts')
const { CookieBanner } = load('src/components/layout/CookieBanner.tsx', { '@/lib/cookieConsent': consent })

async function browser(url, run, { cookieJar = new CookieJar(), blockedCookies = false, blockedStorage = false } = {}) {
  const dom = new JSDOM('<div id="root"></div>', { url, cookieJar })
  global.window = dom.window
  global.document = dom.window.document
  global.location = dom.window.location
  global.IS_REACT_ACT_ENVIRONMENT = true
  if (blockedCookies) Object.defineProperty(document, 'cookie', { configurable: true, get: () => '', set() {} })
  if (blockedStorage) Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Storage blocked') } })
  const { createRoot } = require('react-dom/client')
  let root
  async function mount() {
    root = createRoot(document.getElementById('root'))
    await React.act(async () => root.render(React.createElement(CookieBanner)))
  }
  const buttons = () => [...document.querySelectorAll('button')]
  try {
    await run({
      mount, buttons, cookieJar,
      choose: async label => React.act(async () => buttons().find(button => button.textContent === label).click()),
      reload: async () => {
        await React.act(async () => root.unmount())
        await mount()
      },
    })
  } finally {
    if (root) await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.location
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
}

test('SSR waits for browser storage instead of flashing a banner to returning visitors', () => {
  assert.equal(renderToString(React.createElement(CookieBanner)), '')
})

test('acceptance and refusal survive reloads on production, preview and localhost', async () => {
  for (const url of ['https://www.neptune-papers.com/newsstand', 'https://neptune-psi.vercel.app/', 'http://localhost:3000/']) {
    for (const [label, value] of [['Accept', 'true'], ['Decline', 'false']]) {
      await browser(url, async ({ mount, choose, reload, buttons, cookieJar }) => {
        await mount()
        assert.equal(buttons().length, 2)
        await choose(label)
        assert.equal(buttons().length, 0)
        assert.equal(consent.getCookieConsentValue(), value)
        const saved = cookieJar.getCookiesSync(url).find(cookie => cookie.key === consent.COOKIE_CONSENT_NAME)
        assert.equal(saved.value, value)
        assert.equal(saved.path, '/')
        assert.ok(saved.expires.getTime() > Date.now() + 360 * 86400000)
        await reload()
        assert.equal(buttons().length, 0)
      })
    }
  }
})

test('consent is shared between www and the root domain, across pages', async () => {
  const cookieJar = new CookieJar()
  await browser('https://www.neptune-papers.com/newsstand/issue-eleven', async ({ mount, choose }) => {
    await mount()
    await choose('Accept')
  }, { cookieJar })
  await browser('https://neptune-papers.com/', async ({ mount, buttons }) => {
    await mount()
    assert.equal(buttons().length, 0)
    assert.equal(consent.getCookieConsentValue(), 'true')
  }, { cookieJar })
})

test('local preference preserves both choices when cookies are blocked, without extending expiry on reload', async () => {
  for (const [label, value] of [['Accept', 'true'], ['Decline', 'false']]) {
    await browser('https://www.neptune-papers.com/', async ({ mount, choose, reload, buttons }) => {
      await mount()
      await choose(label)
      const saved = localPreference()
      assert.equal(saved.value, value)
      assert.equal(document.cookie, '')
      await reload()
      assert.equal(buttons().length, 0)
      assert.deepEqual(localPreference(), saved)
    }, { blockedCookies: true })
  }
})

function localPreference() {
  return JSON.parse(window.localStorage.getItem(consent.COOKIE_CONSENT_NAME))
}

test('existing cookies work without local storage and reset removes both saved choices', async () => {
  await browser('https://www.neptune-papers.com/', async ({ mount, buttons }) => {
    document.cookie = `${consent.COOKIE_CONSENT_NAME}=false; Path=/`
    await mount()
    assert.equal(buttons().length, 0)
  }, { blockedStorage: true })
  await browser('https://www.neptune-papers.com/', async ({ mount, choose, reload, buttons }) => {
    await mount()
    await choose('Accept')
    await React.act(async () => consent.resetCookieConsentValue())
    assert.equal(window.localStorage.getItem(consent.COOKIE_CONSENT_NAME), null)
    assert.equal(consent.getCookieConsentValue(), undefined)
    await reload()
    assert.equal(buttons().length, 2)
  })
})

test('expired or malformed local preferences show the banner again', async () => {
  for (const value of ['broken-json', 'null', JSON.stringify({ value: 'true', expiresAt: Date.now() - 1 })]) {
    await browser('https://www.neptune-papers.com/', async ({ mount, buttons }) => {
      window.localStorage.setItem(consent.COOKIE_CONSENT_NAME, value)
      await mount()
      assert.equal(buttons().length, 2)
    }, { blockedCookies: true })
  }
})
