/* eslint-disable @typescript-eslint/no-require-imports -- Load TS/TSX with isolated network dependencies. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const { createHash } = require('node:crypto')

function load(relativePath, overrides = {}, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const loadedModule = { exports: {} }
  new Function('require', 'module', 'exports', ...Object.keys(overrides), source)(
    (name) => name in mocks ? mocks[name] : require(name), loadedModule, loadedModule.exports, ...Object.values(overrides),
  )
  return loadedModule.exports
}

function setup(fetch = async () => Response.json({ status: 'subscribed' }), env = {
  MAILCHIMP_API_KEY: 'test-key-us6',
  MAILCHIMP_AUDIENCE_ID: 'test-audience',
}) {
  const calls = []
  const { POST } = load('src/app/api/newsletter/route.ts', {
    fetch: async (...args) => { calls.push(args); return fetch(...args) },
    process: { env },
    console: { error() {} },
  })
  const submit = (body) => POST(new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }))
  return { calls, POST, submit }
}

test('normalizes email and uses the same Mailchimp member for repeated submissions', async () => {
  const { submit, calls } = setup()
  for (const email of [' Person@Example.com ', 'person@example.com']) {
    const result = await submit({ email })
    assert.equal(result.status, 200)
    assert.equal((await result.json()).success, true)
  }
  const [url, options] = calls[0]
  assert.equal(url, `https://us6.api.mailchimp.com/3.0/lists/test-audience/members/${createHash('md5').update('person@example.com').digest('hex')}?skip_merge_validation=true`)
  assert.equal(url, calls[1][0])
  assert.equal(options.method, 'PUT')
  assert.equal(options.headers.Authorization, 'Bearer test-key-us6')
  assert.equal(options.cache, 'no-store')
  assert.ok(options.signal instanceof AbortSignal)
  assert.deepEqual(JSON.parse(options.body), { email_address: 'person@example.com', status_if_new: 'subscribed' })
})

test('rejects invalid input without contacting Mailchimp', async () => {
  const { submit, calls, POST } = setup()
  for (const body of [null, [], {}, { email: 12 }, { email: '' }, { email: 'x@y' }, { email: 'a b@example.com' }, { email: `${'a'.repeat(250)}@example.com` }]) {
    assert.equal((await submit(body)).status, 400)
  }
  assert.equal((await POST(new Request('http://localhost/api/newsletter', { method: 'POST', body: '{' }))).status, 400)
  assert.equal(calls.length, 0)
})

test('missing credentials and invalid data centers fail without network requests', async () => {
  for (const env of [{}, { MAILCHIMP_API_KEY: 'key-us6' }, { MAILCHIMP_API_KEY: 'key-attacker.com', MAILCHIMP_AUDIENCE_ID: 'list' }]) {
    const { submit, calls } = setup(undefined, env)
    assert.equal((await submit({ email: 'person@example.com' })).status, 503)
    assert.equal(calls.length, 0)
  }
})

test('provider failures never return success or expose Mailchimp error details', async () => {
  for (const status of [400, 401, 403, 429, 500]) {
    const { submit } = setup(async () => Response.json({ detail: 'private email and provider details' }, { status }))
    const result = await submit({ email: 'person@example.com' })
    assert.equal(result.status, 502)
    const body = await result.json()
    assert.equal(body.success, undefined)
    assert.doesNotMatch(JSON.stringify(body), /private email/)
  }
})

test('connection failures, timeouts and malformed provider responses fail safely', async () => {
  for (const fetch of [
    async () => { throw new Error('network error') },
    async () => { throw new DOMException('timed out', 'TimeoutError') },
    async () => new Response('not JSON'),
  ]) {
    const { submit } = setup(fetch)
    assert.equal((await submit({ email: 'person@example.com' })).status, 502)
  }
})

test('pending contacts get confirmation instructions', async () => {
  const { submit } = setup(async () => Response.json({ status: 'pending' }))
  const body = await (await submit({ email: 'person@example.com' })).json()
  assert.equal(body.success, true)
  assert.match(body.message, /check your inbox/)
})

test('unsubscribed and bounced contacts are not reactivated or shown a false success', async () => {
  for (const status of ['unsubscribed', 'cleaned', 'transactional']) {
    const { submit, calls } = setup(async () => Response.json({ status }))
    const result = await submit({ email: 'person@example.com' })
    assert.equal(result.status, 422)
    assert.equal((await result.json()).success, undefined)
    assert.equal(JSON.parse(calls[0][1].body).status, undefined)
  }
})

test('form displays a save error, supports retry, and resets after reopening', async () => {
  const React = require('react')
  const { JSDOM } = require('jsdom')
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  const { createRoot } = require('react-dom/client')
  let fail = true
  const { NewsletterModalProvider, useOpenNewsletterModal } = load('src/contexts/NewsletterModalContext.tsx', {
    fetch: async () => fail
      ? Response.json({ error: 'Could not save. Try again.' }, { status: 502 })
      : Response.json({ success: true, message: 'Thank you for subscribing.' }),
  }, {
    'next/link': { default: props => React.createElement('a', props), __esModule: true },
  })
  function OpenButton() {
    return React.createElement('button', { id: 'open', onClick: useOpenNewsletterModal() }, 'Open')
  }
  const root = createRoot(document.getElementById('root'))
  try {
    await React.act(async () => root.render(React.createElement(NewsletterModalProvider, null, React.createElement(OpenButton))))
    await React.act(async () => document.getElementById('open').click())
    await React.act(async () => {
      const input = document.querySelector('input')
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(input, 'person@example.com')
      input.dispatchEvent(new window.Event('input', { bubbles: true }))
    })
    const submit = () => React.act(async () => {
      document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
    })
    await submit()
    assert.match(document.querySelector('[role="alert"]').textContent, /Could not save/)
    assert.equal(document.querySelector('input').value, 'person@example.com')
    fail = false
    await submit()
    assert.match(document.querySelector('[role="status"]').textContent, /Thank you/)
    await React.act(async () => document.querySelector('[aria-label="Close"]').click())
    await React.act(async () => document.getElementById('open').click())
    assert.ok(document.querySelector('form'))
    assert.equal(document.querySelector('[role="status"]'), null)
    const policyLink = document.querySelector('a[href="/policy"]')
    assert.equal(policyLink.textContent, 'Terms and Privacy Policy')
    policyLink.addEventListener('click', event => event.preventDefault())
    await React.act(async () => policyLink.click())
    assert.equal(document.querySelector('dialog'), null)
  } finally {
    await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})

test('opt-in prompt opens once per session, cancels on navigation, and remains manually accessible', async () => {
  const React = require('react')
  const { JSDOM } = require('jsdom')
  const dom = new JSDOM('<div id="root"></div>', { url: 'https://neptune-papers.com/' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  const timers = new Map()
  let nextTimer = 0
  window.setTimeout = (callback, delay) => {
    assert.equal(delay, 1500)
    timers.set(++nextTimer, callback)
    return nextTimer
  }
  window.clearTimeout = id => timers.delete(id)
  const flushTimers = () => React.act(async () => {
    const pending = [...timers.values()]
    timers.clear()
    pending.forEach(callback => callback())
  })
  const { NewsletterModalProvider, useOpenNewsletterModal } = load('src/contexts/NewsletterModalContext.tsx', {}, {
    'next/link': { default: props => React.createElement('a', props), __esModule: true },
  })
  function OpenButton() {
    return React.createElement('button', { id: 'open', onClick: useOpenNewsletterModal() }, 'Subscribe')
  }
  const { createRoot } = require('react-dom/client')
  let root = createRoot(document.getElementById('root'))
  const render = autoOpen => React.act(async () => root.render(
    React.createElement(NewsletterModalProvider, { autoOpen }, React.createElement(OpenButton))
  ))
  const close = () => React.act(async () => document.querySelector('[aria-label="Close"]').click())
  try {
    await render(false)
    assert.equal(timers.size, 0)
    await render(true)
    assert.equal(document.querySelector('dialog'), null)
    assert.equal(timers.size, 1)
    await render(false)
    await flushTimers()
    assert.equal(document.querySelector('dialog'), null)

    await render(true)
    document.getElementById('open').focus()
    await flushTimers()
    assert.ok(document.querySelector('dialog[aria-modal="true"]'))
    assert.equal(document.activeElement.getAttribute('aria-label'), 'Close')
    const policyLink = document.querySelector('a[href="/policy"]')
    await React.act(async () => document.activeElement.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })))
    assert.equal(document.activeElement, policyLink)
    await close()
    assert.equal(document.activeElement.id, 'open')
    await render(false)
    await render(true)
    await flushTimers()
    assert.equal(document.querySelector('dialog'), null)

    // A page reload keeps sessionStorage and must not show the prompt again.
    await React.act(async () => root.unmount())
    root = createRoot(document.getElementById('root'))
    await render(true)
    await flushTimers()
    assert.equal(document.querySelector('dialog'), null)
    await React.act(async () => document.getElementById('open').click())
    assert.ok(document.querySelector('dialog'))
    await close()

    // A new session is eligible again; other open dialogs take priority.
    window.sessionStorage.clear()
    await React.act(async () => root.unmount())
    root = createRoot(document.getElementById('root'))
    const cart = document.createElement('div')
    cart.setAttribute('role', 'dialog')
    cart.setAttribute('aria-modal', 'true')
    document.body.appendChild(cart)
    await render(true)
    await flushTimers()
    assert.equal(document.querySelector('dialog'), null)
    cart.remove()
    await render(false)
    await render(true)
    await flushTimers()
    assert.ok(document.querySelector('dialog'))
  } finally {
    await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})
