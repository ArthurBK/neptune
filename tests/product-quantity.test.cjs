/* eslint-disable @typescript-eslint/no-require-imports -- Exercise TSX with isolated Shopify calls. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const React = require('react')
const { JSDOM } = require('jsdom')

function load(file, mocks = {}, overrides = {}) {
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', ...Object.keys(overrides), code)(
    name => name in mocks ? mocks[name] : require(name), mod, mod.exports, ...Object.values(overrides),
  )
  return mod.exports
}

test('product quantity controls send the chosen quantity; listing buttons still add one', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  const { createRoot } = require('react-dom/client')
  const requests = []
  const cart = {
    getCartId: () => null, setCartId() {}, setCheckoutUrl() {},
    dispatchCartUpdated() {}, dispatchOpenCart() {}, clearCart() {},
  }
  const currency = { getStoredCountry: () => null, COUNTRY_CHANGED_EVENT: 'country-changed' }
  const { AddToCartButton } = load('src/components/commerce/AddToCartButton.tsx', {
    '@/lib/cart': cart, '@/lib/currency': currency,
  }, {
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body))
      return Response.json({ cartId: 'cart', checkoutUrl: 'https://example.com/checkout', cart: {} })
    },
  })
  const { ProductForm } = load('src/components/commerce/ProductForm.tsx', {
    './AddToCartButton': { AddToCartButton }, '@/lib/cart': cart, '@/lib/currency': currency,
    '@/lib/shopify/types': { formatPriceNoDecimals: () => '35 €' },
  })
  const variant = { id: 'gid://shopify/ProductVariant/123', availableForSale: true, price: { amount: '35', currencyCode: 'EUR' } }
  const root = createRoot(document.getElementById('root'))
  const click = selector => React.act(async () => document.querySelector(selector).click())
  try {
    await React.act(async () => root.render(React.createElement(ProductForm, {
      variants: [variant], productTitle: 'Issue Ten', productHandle: 'issue-ten',
    })))
    assert.match(document.body.textContent, /35 €All tax included\./)
    assert.equal(document.querySelector('[aria-label="Decrease quantity"]').disabled, true)
    await click('[aria-label="Decrease quantity"]')
    assert.equal(document.querySelector('output').textContent, '1')
    await click('[aria-label="Increase quantity"]')
    await click('[aria-label="Increase quantity"]')
    await click('[aria-label="Decrease quantity"]')
    assert.equal(document.querySelector('output').textContent, '2')
    await click('button:not([aria-label])')
    assert.equal(requests[0].quantity, 2)
    assert.equal(requests[0].variantId, variant.id)
    await React.act(async () => root.render(React.createElement(AddToCartButton, { variant, productTitle: 'Issue Ten' })))
    await click('button')
    assert.equal(requests[1].quantity, 1)
  } finally {
    await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})

test('cart API preserves quantities for new and existing carts and rejects invalid values', async () => {
  const calls = []
  const { POST } = load('src/app/api/cart/add/route.ts', {
    '@/lib/shopify/queries': { CART_CREATE_MUTATION: 'create', CART_LINES_ADD_MUTATION: 'add' },
    '@/lib/shopify/client': {
      shopifyFetch: async request => {
        calls.push(request)
        const result = { cart: { id: 'cart', checkoutUrl: 'https://example.com/checkout' }, userErrors: [] }
        return { cartCreate: result, cartLinesAdd: result }
      },
    },
  })
  const submit = body => POST(new Request('http://localhost/api/cart/add', { method: 'POST', body: JSON.stringify({ variantId: 'variant', ...body }) }))
  for (const quantity of [0, -1, 1.5, '2', null]) assert.equal((await submit({ quantity })).status, 400)
  assert.equal(calls.length, 0)
  assert.equal((await submit({ quantity: 3 })).status, 200)
  assert.equal(calls[0].variables.input.lines[0].quantity, 3)
  assert.equal((await submit({ quantity: 4, cartId: 'cart' })).status, 200)
  assert.equal(calls[1].variables.lines[0].quantity, 4)
  assert.equal((await submit({})).status, 200)
  assert.equal(calls[2].variables.input.lines[0].quantity, 1)
})
