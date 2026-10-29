/* eslint-disable @typescript-eslint/no-require-imports -- Exercise the actual Next.js redirect configuration. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const ts = require('typescript')
const { unstable_getResponseFromNextConfig, getRedirectUrl } = require('next/experimental/testing/server')

const configPath = path.join(__dirname, '../next.config.ts')
const source = fs.readFileSync(configPath, 'utf8').replace('import.meta.url', JSON.stringify(pathToFileURL(configPath).href))
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText
const loaded = { exports: {} }
new Function('require', 'module', 'exports', code)(require, loaded, loaded.exports)
const nextConfig = loaded.exports.default

test('old production hosts redirect permanently while keeping the path and query string', async () => {
  for (const host of ['neptune-psi.vercel.app', 'www.neptune-papers.com']) {
    for (const suffix of ['/', '/newsstand?cover=one', '/newsstand/issue-eleven', '/studio', '/api/revalidate']) {
      const response = await unstable_getResponseFromNextConfig({ url: `https://${host}${suffix}`, nextConfig })
      assert.equal(response.status, 308)
      assert.equal(getRedirectUrl(response), `https://neptune-papers.com${suffix}`)
    }
  }
})

test('canonical, local and preview hosts do not loop or redirect to production', async () => {
  for (const origin of ['https://neptune-papers.com', 'http://localhost:3000', 'https://neptune-preview.vercel.app']) {
    const response = await unstable_getResponseFromNextConfig({ url: `${origin}/newsstand`, nextConfig })
    assert.equal(getRedirectUrl(response), null)
  }
})

test('existing article redirects still resolve under the canonical domain', async () => {
  const response = await unstable_getResponseFromNextConfig({ url: 'https://neptune-papers.com/arts/example', nextConfig })
  assert.equal(getRedirectUrl(response), 'https://neptune-papers.com/stories/example')
})
