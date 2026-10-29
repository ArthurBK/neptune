const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const ts = require('typescript')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => mocks[name] ?? require(name), mod, mod.exports)
  return mod.exports
}
const { resolveArticleTypography } = load('src/lib/articleTypography.ts', {
  '@/lib/textStyleFonts': load('src/lib/textStyleFonts.ts'),
})

test('title color and size can change independently of article body styling', () => {
  const current = resolveArticleTypography({ textColor: '#123456', bodySize: 'sm', titleSize: 'lg', titleColor: ' #D24 ' })
  const original = resolveArticleTypography({ textColor: '#123456', bodySize: 'sm' })
  assert.equal(current.titleColor, '#D24')
  assert.equal(current.textColor, original.textColor)
  assert.equal(current.bodySizeClass, original.bodySizeClass)
  assert.notEqual(current.titleSizeClass, original.titleSizeClass)
})

test('existing articles retain their color and default title size; invalid colors are ignored', () => {
  assert.equal(resolveArticleTypography({ textColor: '#123456' }).titleColor, '#123456')
  assert.equal(resolveArticleTypography({ textColor: '#123456', titleColor: 'red' }).titleColor, '#123456')
  assert.equal(resolveArticleTypography({ titleColor: 'url(example)' }).titleColor, undefined)
  assert.equal(resolveArticleTypography(null).titleColor, undefined)
  assert.equal(resolveArticleTypography(null).titleSizeClass, resolveArticleTypography({ titleSize: 'md' }).titleSizeClass)
})
