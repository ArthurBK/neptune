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
  const linkPreview = load('src/sanity/components/LinkAnnotation.tsx')
  const annotation = load('src/sanity/schemas/lib/linkAnnotation.ts', { sanity, '@sanity/icons': {}, '../../components/LinkAnnotation': linkPreview })
  const caption = load('src/sanity/schemas/lib/captionRichText.ts', {
    sanity, '../../components/AlignedTextBlock': alignedBlock, '../../components/InlineTextStylePortableTextInput': input,
    './textStyleAnnotation': { textStyleAnnotation: { name: 'textStyle', type: 'object', fields: [{ name: 'textColor', type: 'string' }] } }, './linkAnnotation': annotation,
  })
  const { article, pteImageGridBlock } = load('src/sanity/schemas/article.ts', {
    sanity, '../components/ItemWithValidation': load('src/sanity/components/ItemWithValidation.tsx'), '../components/AlignedTextBlock': alignedBlock, '@sanity/icons': {}, './lib/captionRichText': caption, './lib/linkAnnotation': annotation,
    '../../lib/textStyleFonts': fonts, '../components/FontSizeCounterInput': {}, '../components/HexColorInput': {},
    '../components/InlineTextStylePortableTextInput': input,
  })
  const compiledGrid = require('@sanity/schema').Schema.compile({ name: 'grid-test', types: [pteImageGridBlock] }).get('pteImageGridBlock')
  assert.equal(typeof compiledGrid.components.block, 'function', 'Body uses the Portable Text block renderer')
  const imagesField = compiledGrid.fields.find(field => field.name === 'images')
  assert.equal(typeof imagesField.type.of[0].components.item, 'function', 'Image row renderer must be on the member type, not on the parent array')
  for (const field of [article.fields.find(f => f.name === 'body'), caption.captionRichTextType]) {
    const block = field.of.find(member => member.type === 'block')
    const link = block.marks.annotations.find(mark => mark.name === 'link')
    assert.ok(link.fields.some(f => f.name === 'href'))
    assert.ok(link.fields.some(f => f.name === 'blank'))
    assert.equal(link.components.annotation, linkPreview.LinkAnnotation)
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
    getValue: () => blocks, getSelection: () => selection, getFragment: () => blocks,
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


test('grid image validation shows nested errors with their field names and keeps the native row', () => {
  const { ItemWithValidation } = load('src/sanity/components/ItemWithValidation.tsx')
  const path = ['body', { _key: 'grid' }, 'images', { _key: 'photo' }]
  const props = {
    path, schemaType: { fields: [{ name: 'alt', type: { title: 'Alt text' } }, { name: 'caption', type: { title: 'Caption' } }] },
    validation: [
      { level: 'error', message: 'Add alt text describing this image.', path: [...path, 'alt'] },
      { level: 'warning', message: 'Check this destination.', path: [...path, 'caption', { _key: 'p' }, 'markDefs', { _key: 'link' }, 'href'] },
    ],
    onOpen: () => {},
    renderDefault: () => React.createElement('div', { 'data-native-row': true }, 'Image preview'),
  }
  const doc = new JSDOM(renderToStaticMarkup(React.createElement(ItemWithValidation, props))).window.document
  assert.equal(doc.querySelectorAll('[data-native-row]').length, 1)
  assert.match(doc.body.textContent, /Error — Alt text: Add alt text describing this image/)
  assert.match(doc.body.textContent, /Warning — Caption: Check this destination/)
  assert.equal(doc.querySelector('button').textContent, 'Open image to review')
  const valid = renderToStaticMarkup(React.createElement(ItemWithValidation, { ...props, validation: [] }))
  assert.doesNotMatch(valid, /Validation details|Open image to review/)
  assert.match(valid, /Image preview/)
})


test('Body image grid exposes validation messages before opening its dialog', () => {
  const { BlockWithValidation } = load('src/sanity/components/ItemWithValidation.tsx')
  const path = ['body', { _key: 'grid' }]
  const html = renderToStaticMarkup(React.createElement(BlockWithValidation, {
    path, schemaType: { fields: [{ name: 'images', type: { title: 'Images' } }] },
    validation: [{ level: 'error', message: 'Add at least one image to this grid.', path: [...path, 'images'] }],
    onOpen: () => {}, renderDefault: () => React.createElement('div', {}, 'Image Grid (0)'),
  }))
  const doc = new JSDOM(html).window.document
  assert.match(doc.body.textContent, /Error — Images: Add at least one image to this grid/)
  assert.equal(doc.querySelector('button').textContent, 'Open grid to review')
  assert.equal(doc.querySelector('[aria-label="Validation details"]').getAttribute('contenteditable'), 'false')
})


test('selected links expose their URL and edit/remove controls in bodies and nested captions', async () => {
  const dom = new JSDOM('<div id="root"></div>', { url: 'http://localhost' })
  global.window = dom.window
  global.document = dom.window.document
  global.IS_REACT_ACT_ENVIRONMENT = true
  window.requestAnimationFrame = callback => { callback(); return 1 }
  const { createRoot } = require('react-dom/client')
  const block = {
    _type: 'block', _key: 'paragraph', style: 'normal',
    markDefs: [{_key: 'link', _type: 'link', href: 'https://example.com'}, {_key: 'other', _type: 'link', href: '/newsstand'}],
    children: [{_type: 'span', _key: 'linked', text: 'Blue text', marks: ['strong', 'link']}, {_type: 'span', _key: 'other-text', text: 'Other link', marks: ['other']}],
  }
  const point = offset => ({ path: [{_key: 'paragraph'}, 'children', {_key: 'linked'}], offset })
  let selection = {anchor: point(0), focus: point(9)}
  let fragment = [{ ...block, children: [block.children[0]] }]
  const editor = {}
  let notify, closeLink
  const api = {focus: () => {}, activeAnnotations: () => [], getSelection: () => selection, getValue: () => [block], getFragment: () => fragment}
  const { InlineTextStylePortableTextInput } = load('src/sanity/components/InlineTextStylePortableTextInput.tsx', {
    sanity: { set: require('sanity').set, unset: require('sanity').unset, PortableTextInput: props => {
      notify = () => props.onEditorChange({}, editor)
      closeLink = props.onItemClose
      React.useEffect(() => { props.editorRef.current = editor; notify() }, [])
      return null
    } }, '@portabletext/editor': { PortableTextEditor: api }, '@/lib/textStyleFonts': fonts,
  })
  const schemaType = require('@sanity/schema').Schema.compile({name: 'test', types: [{name:'body',type:'array',of:[{type:'block'}]}]}).get('body')
  const root = createRoot(document.getElementById('root'))
  const opened = [], patches = []
  const render = (path, readOnly = false) => React.act(async () => root.render(React.createElement(InlineTextStylePortableTextInput, {
    schemaType, path, readOnly, onItemOpen: path => opened.push(path), onItemClose: () => {}, onChange: value => patches.push(...value),
  })))
  const click = async text => React.act(async () => [...document.querySelectorAll('button')].find(b => b.textContent === text).click())
  try {
    for (const path of [['body'], ['body', {_key:'grid'}, 'images', {_key:'image'}, 'caption']]) {
      await render(path)
      const group = document.querySelector('[aria-label="Selected link"]')
      assert.match(group.textContent, /https:\/\/example.com/)
      assert.doesNotMatch(group.textContent, /newsstand/)
      await click('Edit link')
      assert.deepEqual(opened.at(-1), [...path, {_key:'paragraph'}, 'markDefs', {_key:'link'}])
    }
    await React.act(async () => closeLink())
    assert.equal(patches.length, 0, 'Closing a populated URL keeps the link')
    selection = {anchor: point(3), focus: point(3)}
    fragment = [{...block, children: [{...block.children[0], text:''}]}]
    await React.act(async () => notify())
    assert.ok(document.querySelector('[aria-label="Selected link"]'), 'Cursor inside a link also exposes it')
    block.markDefs[0].href = ''
    await React.act(async () => notify())
    assert.match(document.querySelector('[aria-label="Selected link"]').textContent, /Missing URL/)
    await click('Edit link')
    assert.equal(patches.length, 0, 'Empty URLs are kept while the dialog is open for typing')
    await React.act(async () => closeLink())
    assert.equal(patches.length, 2, 'Closing an empty URL removes just its annotation and mark')
    patches.length = 0
    await click('Remove link')
    assert.deepEqual(patches.map(p => [p.type, p.path, p.value]), [
      ['unset', [{_key:'paragraph'}, 'markDefs', {_key:'link'}], undefined],
      ['set', [{_key:'paragraph'}, 'children', {_key:'linked'}, 'marks'], ['strong']],
    ])
    patches.length = 0
    block.markDefs[0].href = 'javascript:invalid'
    await click('Edit link')
    await React.act(async () => closeLink())
    assert.equal(patches.length, 0, 'Invalid nonempty URLs remain available to correct')
    block.markDefs[0].href = '   '
    await click('Edit link')
    await React.act(async () => closeLink())
    assert.equal(patches.length, 2, 'Whitespace-only URLs are removed on close')
    patches.length = 0
    await render(['body'], true)
    await click('View link')
    await React.act(async () => closeLink())
    assert.equal(patches.length, 0, 'Read-only links must not be cleaned up')
    assert.equal([...document.querySelectorAll('button')].find(b => b.textContent === 'Remove link').disabled, true)
    assert.ok([...document.querySelectorAll('button')].some(b => b.textContent === 'View link'))
    selection = null
    await React.act(async () => notify())
    assert.equal(document.querySelector('[aria-label="Selected link"]'), null)
  } finally {
    await React.act(async () => root.unmount())
    dom.window.close()
    delete global.window
    delete global.document
    delete global.IS_REACT_ACT_ENVIRONMENT
  }
})
