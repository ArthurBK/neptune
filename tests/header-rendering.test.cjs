/* eslint-disable @typescript-eslint/no-require-imports -- This CommonJS harness loads transpiled TSX with isolated dependencies. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { renderToString } = require('react-dom/server')
const { JSDOM } = require('jsdom')
const { PathnameContext } = require('next/dist/shared/lib/hooks-client-context.shared-runtime')
const { LayoutRouterContext } = require('next/dist/shared/lib/app-router-context.shared-runtime')

function load(relativePath, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loadedModule = { exports: {} }
  new Function('require', 'module', 'exports', source)(name => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports)
  return loadedModule.exports
}

const context = load('src/contexts/HeaderVariantContext.tsx')
const { Header } = load('src/components/layout/Header.tsx', {
  '@/contexts/HeaderVariantContext': context,
  'next/image': { default: props => {
    const imageProps = { ...props }
    delete imageProps.priority
    return React.createElement('img', imageProps)
  }, __esModule: true },
  'next/link': { default: props => React.createElement('a', props), __esModule: true },
  '@/lib/cart': { CART_OPEN_EVENT: 'cart-open', getCartId: () => null },
  '@/components/commerce/CartPreview': { CartPreview: () => null },
  './SearchModal': { SearchModal: () => null },
})
const { LayoutShell } = load('src/components/layout/LayoutShell.tsx', {
  '@/contexts/HeaderVariantContext': context,
  '@/contexts/FooterVisibilityContext': { FooterVisibilityProvider: React.Fragment, useFooterVisibility: () => ({ isFooterSuppressed: true }) },
  '@/contexts/NewsletterModalContext': { NewsletterModalProvider: React.Fragment },
  './Header': { Header },
  './Footer': { Footer: () => null },
  './CookieBanner': { CookieBanner: () => null },
})
const { HomeScrollContainer } = load('src/components/home/HomeScrollContainer.tsx', {
  '@/contexts/HeaderVariantContext': context,
  './StickyHeroStack': { StickyHeroStack: () => React.createElement('div', null, 'Hero') },
})

function app(pathname, segment = null) {
  return React.createElement(PathnameContext.Provider, { value: pathname },
    React.createElement(LayoutRouterContext.Provider, { value: { parentTree: ['', { children: [segment ?? '__PAGE__', {}] }] } },
      React.createElement(LayoutShell, null, segment === null
        ? React.createElement(HomeScrollContainer, { sections: [
          { type: 'video', data: { videoUrl: '/test.mp4' } },
          { type: 'newsstandPhotos', data: { slides: [] } },
          { type: 'image', data: {} },
        ] })
        : React.createElement('main', null, 'Inner page'))))
}

function headerMarkup(html) {
  return html.match(/<header[^>]*>/)?.[0] ?? ''
}

test('homepage HTML is transparent for both public and Vercel internal paths', () => {
  assert.match(headerMarkup(renderToString(app('/'))), /background:transparent/)
  assert.match(headerMarkup(renderToString(app('/index'))), /background:transparent/)
})

test('other routes stay solid, including a real not-found /index route', () => {
  for (const [pathname, segment] of [['/about', 'about'], ['/stories/article', 'stories'], ['/index', '_not-found']]) {
    assert.match(headerMarkup(renderToString(app(pathname, segment))), /background:#fff/)
  }
  assert.equal(headerMarkup(renderToString(app('/studio', 'studio'))), '')
})

test('internal-path SSR hydrates without a white header; scrolling and navigation update its color', async () => {
  const dom = new JSDOM(`<div id="root">${renderToString(app('/index'))}</div>`, { url: 'http://localhost/' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  global.ResizeObserver = class { observe() {} disconnect() {} }
  Object.defineProperty(window.HTMLElement.prototype, 'clientHeight', { get: () => 800 })
  window.HTMLElement.prototype.scrollTo = function (arg, y) { this.scrollTop = typeof arg === 'object' ? arg.top : y }
  const { hydrateRoot } = require('react-dom/client')
  const errors = []
  let root
  try {
    await React.act(async () => { root = hydrateRoot(document.getElementById('root'), app('/'), { onRecoverableError: error => errors.push(error) }) })
    const background = expected => assert.equal(document.querySelector('header').style.background, expected)
    background('transparent')
    const scroller = document.querySelector('.overflow-y-auto.w-full')
    for (const [top, transparent] of [
      [2, true],
      [500, true],
      [799, true],
      [800, true],
      [1200, true],
      [1600, false],
      [2400, false],
      [800, true],
      [799, true],
      [500, true],
      [2, true],
      [0, true],
    ]) {
      await React.act(async () => { scroller.scrollTop = top; scroller.dispatchEvent(new window.Event('scroll')) })
      background(transparent ? 'transparent' : 'rgb(255, 255, 255)')
    }
    await React.act(async () => root.render(app('/about', 'about')))
    background('rgb(255, 255, 255)')
    await React.act(async () => root.render(app('/index')))
    background('transparent')
    assert.deepEqual(errors, [])
  } finally {
    if (root) await React.act(async () => root.unmount())
    dom.window.close()
  }
})
