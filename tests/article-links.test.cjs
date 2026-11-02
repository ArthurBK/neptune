/* eslint-disable @typescript-eslint/no-require-imports -- Render the actual Portable Text components. */
const assert = require('node:assert/strict')
const test = require('node:test')
const fs = require('node:fs')
const ts = require('typescript')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { JSDOM } = require('jsdom')
const portable = require('@portabletext/react')

function load(file, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText
  const mod = { exports: {} }
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : name === '@/lib/textAlignment' ? alignment : require(name), mod, mod.exports)
  return mod.exports
}
const alignment = load('src/lib/textAlignment.ts')
const fonts = load('src/lib/textStyleFonts.ts')
const links = load('src/components/shared/PortableTextLink.tsx')
const styles = load('src/components/shared/PortableTextStyle.tsx', { '@/lib/textStyleFonts': fonts })
const captions = load('src/components/shared/SanityCaption.tsx', {
  'next-sanity': portable, './PortableTextLink': links, './PortableTextStyle': styles,
})
const { ArticleBody } = load('src/components/editorial/ArticleBody.tsx', {
  'next-sanity': portable,
  'next/image': { default: () => null, __esModule: true },
  '@/sanity/lib/image': {},
  '@/components/shared/PortableTextLink': links,
  '@/components/shared/SanityCaption': captions,
  '@/components/editorial/ImageGridLightbox': {},
  '@/components/editorial/ClickableSingleImage': {},
  '@/lib/textStyleFonts': fonts,
})
const value = (href, blank = false) => [{
  _type: 'block', _key: 'p', style: 'normal',
  markDefs: [{ _type: 'link', _key: 'link', href, blank }],
  children: [{ _type: 'span', _key: 's', text: 'Linked words', marks: ['strong', 'link'] }],
}]

for (const [name, Component] of [['body', ArticleBody], ['caption', captions.SanityCaption]]) {
  test(`${name} renders editable link destinations and preserves bold text`, () => {
    for (const href of ['https://example.com', '/newsstand', '#credits', 'mailto:hello@example.com', 'tel:+33123456789', '../stories']) {
      const doc = new JSDOM(renderToStaticMarkup(React.createElement(Component, { value: value(href, true) }))).window.document
      const link = doc.querySelector('a')
      assert.equal(link.getAttribute('href'), href)
      assert.equal(link.getAttribute('target'), '_blank')
      assert.equal(link.getAttribute('rel'), 'noopener noreferrer')
      assert.equal(doc.querySelector('strong').textContent, 'Linked words')
    }
    const doc = new JSDOM(renderToStaticMarkup(React.createElement(Component, { value: value('/newsstand') }))).window.document
    assert.equal(doc.querySelector('a').getAttribute('target'), null)
  })
  test(`${name} keeps text readable for invalid or executable links`, () => {
    for (const href of ['', 'javascript:alert(1)', 'data:text/html,test', 'java\nscript:alert(1)']) {
      const doc = new JSDOM(renderToStaticMarkup(React.createElement(Component, { value: value(href) }))).window.document
      assert.equal(doc.querySelector('a'), null)
      assert.equal(doc.querySelector('strong').textContent, 'Linked words')
    }
  })
}

test('article and caption schemas expose the native link editing toolbar', () => {
  const sanity = { defineField: value => value, defineType: value => value, defineArrayMember: value => value }
  let toolbarHidden
  const input = load('src/sanity/components/InlineTextStylePortableTextInput.tsx', {
    sanity: { PortableTextInput: props => { toolbarHidden = props.hideToolbar; return null } },
    '@portabletext/editor': {}, '@/lib/textStyleFonts': fonts,
  })
  const alignedBlock = load('src/sanity/components/AlignedTextBlock.tsx')
  const annotation = load('src/sanity/schemas/lib/linkAnnotation.ts', { sanity, '@sanity/icons': {} })
  const caption = load('src/sanity/schemas/lib/captionRichText.ts', {
    sanity, '../../components/AlignedTextBlock': alignedBlock, '../../components/InlineTextStylePortableTextInput': input,
    './textStyleAnnotation': { textStyleAnnotation: { name: 'textStyle', type: 'object', fields: [{ name: 'textColor', type: 'string' }] } }, './linkAnnotation': annotation,
  })
  const { article } = load('src/sanity/schemas/article.ts', {
    sanity, '../components/AlignedTextBlock': alignedBlock, '@sanity/icons': {}, './lib/captionRichText': caption, './lib/linkAnnotation': annotation,
    '../../lib/textStyleFonts': fonts, '../components/FontSizeCounterInput': {}, '../components/HexColorInput': {},
    '../components/InlineTextStylePortableTextInput': input,
  })
  for (const field of [article.fields.find(f => f.name === 'body'), caption.captionRichTextType]) {
    const block = field.of.find(member => member.type === 'block')
    const link = block.marks.annotations.find(mark => mark.name === 'link')
    assert.ok(link.fields.some(f => f.name === 'href'))
    assert.ok(link.fields.some(f => f.name === 'blank'))
    const schemaType = require('@sanity/schema').Schema.compile({
      name: 'test', types: [{ name: 'testBody', type: 'array', of: [block] }, { name: 'affiliateProduct', type: 'document', fields: [{ name: 'title', type: 'string' }] }],
    }).get('testBody')
    const html = renderToStaticMarkup(React.createElement(input.InlineTextStylePortableTextInput, { schemaType }))
    assert.doesNotMatch(html, /aria-label="Add or edit link"/)
    assert.doesNotMatch(html, /aria-label="Remove link"/)
    assert.match(html, /aria-label="Align center"/)
    assert.ok(schemaType.of[0].fields[1].type.options.list.some(style => style.value === 'normal-center'))
    const problems = require('@sanity/schema/_internal').groupProblems(require('@sanity/schema/_internal').validateSchema([{ name: 'test', type: 'array', of: [block] }, { name: 'affiliateProduct', type: 'document', fields: [{ name: 'title', type: 'string' }] }]).getTypes())
    assert.equal(problems.filter(group => group.problems.some(problem => problem.severity === 'error')).length, 0)
    assert.equal(toolbarHidden, false)
  }
})

test('alignment patches only selected text blocks, including reversed selections and nested captions', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  window.requestAnimationFrame = callback => { callback(); return 1 }
  const { createRoot } = require('react-dom/client')
  const blocks = [{ _type: 'block', _key: 'first' }, { _type: 'pteImageBlock', _key: 'image' }, { _type: 'block', _key: 'last', style: 'h2' }]
  let selection = { anchor: { path: [{ _key: 'last' }] }, focus: { path: [{ _key: 'first' }] } }
  const patches = []
  const editor = {}
  const editorAPI = {
    focus: () => {}, activeAnnotations: () => [],
    getValue: () => blocks, getSelection: () => selection,
  }
  const { InlineTextStylePortableTextInput } = load('src/sanity/components/InlineTextStylePortableTextInput.tsx', {
    sanity: { set: require('sanity').set, PortableTextInput: props => {
      React.useEffect(() => { props.editorRef.current = editor; props.onEditorChange({}, editor) }, [])
      return null
    } }, '@portabletext/editor': { PortableTextEditor: editorAPI }, '@/lib/textStyleFonts': fonts,
  })
  const schemaType = require('@sanity/schema').Schema.compile({ name: 'test', types: [{
    name: 'content', type: 'array', of: [{ type: 'block', styles: alignment.alignedTextStyles([{title: 'Normal', value: 'normal'}, {title: 'Heading', value: 'h2'}]) }],
  }] }).get('content')
  const root = createRoot(document.getElementById('root'))
  const render = async (path, readOnly = false) => React.act(async () => root.render(React.createElement(InlineTextStylePortableTextInput, {
    schemaType, path, readOnly, onChange: value => patches.push(...value),
  })))
  try {
    await render(['body'])
    const button = document.querySelector('[aria-label="Align center"]')
    const down = new window.MouseEvent('mousedown', { bubbles: true, cancelable: true })
    button.dispatchEvent(down)
    assert.equal(down.defaultPrevented, true, 'Clicking the toolbar preserves the text selection')
    await React.act(async () => button.click())
    assert.deepEqual(patches.map(patch => [patch.path, patch.value]), [
      [[{ _key: 'first' }, 'style'], 'normal-center'], [[{ _key: 'last' }, 'style'], 'h2-center'],
    ])
    patches.length = 0
    selection = { anchor: { path: [{ _key: 'first' }] }, focus: { path: [{ _key: 'first' }] } }
    await render(['body', { _key: 'image' }, 'caption'])
    await React.act(async () => document.querySelector('[aria-label="Align right"]').click())
    assert.equal(patches.length, 1)
    assert.deepEqual(patches[0].path, [{ _key: 'first' }, 'style'], 'Patches stay relative to the caption field')
    assert.equal(patches[0].value, 'normal-right')
    await render(['body'], true)
    assert.equal(document.querySelector('[aria-label="Align center"]').disabled, true)
    patches.length = 0
    selection = null
    await render(['body'])
    await React.act(async () => document.querySelector('[aria-label="Align center"]').click())
    assert.equal(patches.length, 0, 'No selection must not update the whole article')
  } finally {
    await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})

for (const [name, Component, styles] of [['body', ArticleBody, ['normal', 'h2', 'h3', 'blockquote', 'pullQuote']], ['caption', captions.SanityCaption, ['normal']]]) {
  test(`${name} renders saved paragraph alignment and keeps existing content unchanged`, () => {
    for (const style of styles) {
      for (const textAlign of ['left', 'center', 'right', undefined, 'invalid']) {
        const blocks = value('/newsstand').map(block => ({ ...block, style: textAlign && textAlign !== 'invalid' ? `${style}-${textAlign}` : style }))
        const doc = new JSDOM(renderToStaticMarkup(React.createElement(Component, { value: blocks }))).window.document
        const el = doc.querySelector('[style*="text-align"]')
        assert.equal(el?.style.textAlign, alignment.textAlignment(textAlign))
        assert.equal(doc.querySelector('a').getAttribute('href'), '/newsstand')
      }
    }
  })
}
