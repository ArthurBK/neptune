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
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), mod, mod.exports)
  return mod.exports
}
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
  const annotation = load('src/sanity/schemas/lib/linkAnnotation.ts', { sanity, '@sanity/icons': {} })
  const caption = load('src/sanity/schemas/lib/captionRichText.ts', {
    sanity, '../../components/InlineTextStylePortableTextInput': input,
    './textStyleAnnotation': { textStyleAnnotation: { name: 'textStyle', type: 'object', fields: [{ name: 'textColor', type: 'string' }] } }, './linkAnnotation': annotation,
  })
  const { article } = load('src/sanity/schemas/article.ts', {
    sanity, '@sanity/icons': {}, './lib/captionRichText': caption, './lib/linkAnnotation': annotation,
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
    assert.match(html, /aria-label="Add or edit link"/)
    assert.match(html, /aria-label="Remove link"/)
    assert.equal(toolbarHidden, false)
  }
})

test('Link opens the selected annotation form, edits existing links, and Unlink removes them', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  window.requestAnimationFrame = callback => { callback(); return 1 }
  const { createRoot } = require('react-dom/client')
  let annotations = []
  let additions = 0
  const opened = []
  const editor = {}
  const editorAPI = {
    focus: () => {}, activeAnnotations: () => annotations,
    focusBlock: () => ({ _key: 'paragraph' }),
    hasBlockStyle: (_, style) => style === 'normal', isMarkActive: () => false,
    hasListStyle: () => false,
    isAnnotationActive: (_, type) => annotations.some(a => a._type === type),
    addAnnotation: (_, type, value) => {
      assert.equal(type.name, 'link')
      additions++
      annotations = [{ _key: 'link-id', _type: type.name, ...value }]
      return { markDefPath: [{ _key: 'paragraph' }, 'markDefs', { _key: 'link-id' }] }
    },
    removeAnnotation: (_, type) => { annotations = annotations.filter(a => a._type !== type.name) },
  }
  const { InlineTextStylePortableTextInput } = load('src/sanity/components/InlineTextStylePortableTextInput.tsx', {
    sanity: { PortableTextInput: props => {
      React.useEffect(() => { props.editorRef.current = editor; props.onEditorChange({}, editor) }, [])
      return null
    } }, '@portabletext/editor': { PortableTextEditor: editorAPI }, '@/lib/textStyleFonts': fonts,
  })
  const schemaType = require('@sanity/schema').Schema.compile({ name: 'test', types: [{
    name: 'content', type: 'array', of: [{ type: 'block', marks: { annotations: [{
      name: 'link', type: 'object', fields: [{ name: 'href', type: 'url' }],
    }] } }],
  }] }).get('content')
  const root = createRoot(document.getElementById('root'))
  try {
    for (const path of [['body'], ['body', { _key: 'image' }, 'caption']]) {
      await React.act(async () => root.render(React.createElement(InlineTextStylePortableTextInput, { schemaType, path, onItemOpen: value => opened.push(value) })))
      const link = document.querySelector('[aria-label="Add or edit link"]')
      const down = new window.MouseEvent('mousedown', { bubbles: true, cancelable: true })
      link.dispatchEvent(down)
      assert.equal(down.defaultPrevented, true)
      const before = additions
      await React.act(async () => link.click())
      assert.equal(additions, before + 1)
      assert.deepEqual(opened.at(-1), [...path, { _key: 'paragraph' }, 'markDefs', { _key: 'link-id' }])
      await React.act(async () => link.click())
      assert.equal(additions, before + 1, 'Editing must reuse the existing annotation')
      assert.deepEqual(opened.at(-1), [...path, { _key: 'paragraph' }, 'markDefs', { _key: 'link-id' }])
      await React.act(async () => document.querySelector('[aria-label="Remove link"]').click())
      assert.deepEqual(annotations, [])
    }
  } finally {
    await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})
