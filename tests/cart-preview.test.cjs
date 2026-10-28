/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the cart with isolated network responses. */
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
  new Function('require', 'module', 'exports', code)(
    name => name in mocks ? mocks[name] : require(name), loaded, loaded.exports,
  )
  return loaded.exports
}

test('every cart response requests the Shopify total and its currency', () => {
  const queries = load('src/lib/shopify/queries.ts')
  for (const name of ['CART_QUERY', 'CART_CREATE_MUTATION', 'CART_LINES_ADD_MUTATION', 'CART_LINES_UPDATE_MUTATION', 'CART_LINES_REMOVE_MUTATION']) {
    assert.match(queries[name], /cost\s*\{\s*totalAmount\s*\{\s*amount\s+currencyCode\s*\}/, name)
  }
})

function cart(amount = '70.00', currencyCode = 'EUR', quantities = [1, 1]) {
  return {
    id: 'cart', checkoutUrl: 'https://example.com/checkout',
    totalQuantity: quantities.reduce((a, b) => a + b, 0),
    cost: { totalAmount: { amount, currencyCode } },
    lines: { edges: quantities.map((quantity, i) => ({ node: {
      id: `line-${i}`, quantity,
      merchandise: {
        id: `variant-${i}`, title: 'Default Title', price: { amount: '35', currencyCode },
        product: { title: `Issue ${i}`, handle: `issue-${i}`, featuredImage: null },
      },
    } })) },
  }
}

test('total follows Shopify amounts through updates, removals, errors and currency changes', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost/' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  const originalFetch = global.fetch
  let saved = cart()
  let resolveMutation
  global.fetch = async (_url, options) => options?.method === 'POST'
    ? new Promise(resolve => { resolveMutation = resolve })
    : Response.json({ cart: saved })
  const events = { CART_UPDATED_EVENT: 'cart-updated', getCartId: () => 'cart', clearCart() {}, setCheckoutUrl() {}, dispatchCartUpdated() {} }
  const { formatPrice } = load('src/lib/shopify/types.ts')
  const { CartPreview } = load('src/components/commerce/CartPreview.tsx', {
    'next/link': { default: props => React.createElement('a', props), __esModule: true },
    'next/image': { default: () => null, __esModule: true },
    '@/lib/cart': events,
    '@/lib/shopify/types': { formatPrice },
  })
  const { createRoot } = require('react-dom/client')
  const root = createRoot(document.getElementById('root'))
  const total = () => document.querySelector('[role="status"]')?.textContent
  const button = label => [...document.querySelectorAll('button')].find(el => el.textContent.trim() === label)
  const click = label => React.act(async () => button(label).click())
  const finish = async next => {
    saved = next
    await React.act(async () => resolveMutation(Response.json({ cart: next })))
  }
  try {
    await React.act(async () => root.render(React.createElement(CartPreview, { isOpen: true, onClose() {} })))
    assert.equal(total(), formatPrice('70', 'EUR'))
    assert.ok(document.body.textContent.includes('Estimated total'))

    await click('+')
    assert.equal(total(), 'Updating…')
    assert.equal(document.querySelector('a').getAttribute('aria-disabled'), 'true')
    assert.ok([...document.querySelectorAll('li button')].every(el => el.disabled))
    // The server total includes a discount; it must not be replaced by 3 x 35.
    await finish(cart('90.00', 'EUR', [2, 1]))
    assert.equal(total(), formatPrice('90', 'EUR'))
    assert.equal(document.querySelector('a').getAttribute('aria-disabled'), 'false')

    await click('Remove')
    assert.equal(total(), 'Updating…')
    await finish(cart('35', 'EUR', [1]))
    assert.equal(total(), formatPrice('35', 'EUR'))

    await click('+')
    await React.act(async () => resolveMutation(Response.json({ error: 'Unavailable' }, { status: 400 })))
    assert.equal(total(), formatPrice('35', 'EUR'))

    await React.act(async () => window.dispatchEvent(new window.CustomEvent(events.CART_UPDATED_EVENT, { detail: { cart: cart('42.50', 'USD', [1]) } })))
    assert.equal(total(), formatPrice('42.50', 'USD'))

    await click('Remove')
    await finish(cart('0', 'USD', []))
    assert.ok(document.body.textContent.includes('Your cart is empty'))
    assert.equal(total(), undefined)
    assert.equal(document.querySelector('a'), null)
  } finally {
    await React.act(async () => root.unmount())
    global.fetch = originalFetch
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})
