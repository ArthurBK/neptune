import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { PortableTextInput, type PortableTextInputProps } from 'sanity'
import { PortableTextEditor, type PortableTextObject } from '@portabletext/editor'

import { TEXT_STYLE_FONT_FAMILIES, type TextStyleFontFamily } from '@/lib/textStyleFonts'

const TEXT_STYLE_MARK = 'textStyle'
const AFFILIATE_PRODUCT_MARK = 'affiliateProductEmbed'

const COLOR_PRESETS = [
  { title: 'Black', value: '#1A1A1A' },
  { title: 'Warm gray', value: '#6B6B6B' },
  { title: 'Soft beige', value: '#E8E1D8' },
  { title: 'Brown', value: '#8A6A55' },
  { title: 'White', value: '#FFFFFF' },
] as const

const BLOCK_LABELS: Record<string, string> = {
  normal: 'P',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  h4: 'H4',
  h5: 'H5',
  h6: 'H6',
  blockquote: 'Quote',
  pullQuote: 'Pull',
}

const DECORATOR_LABELS: Record<string, string> = {
  strong: 'B',
  em: 'I',
  underline: 'U',
  'strike-through': 'S',
  code: 'Code',
}

const BLOCK_OBJECT_LABELS: Record<string, string> = {
  pteImageBlock: 'Image',
  pteImageGridBlock: 'Grid',
  pteVideoBlock: 'Video',
  adBannerEmbedBlock: 'Ad',
}

const MIN_FONT_SIZE = 6
const MAX_FONT_SIZE = 50
const DEFAULT_COLOR = '#1A1A1A'

type SchemaAction = {
  title: string
  value: string
  label: string
}

type TextStyleValue = {
  _type: typeof TEXT_STYLE_MARK
  textColor?: string
  fontSize?: number
  fontFamily?: TextStyleFontFamily
}

type ToolbarState = {
  activeBlockStyle: string
  activeMarks: string[]
  activeListStyle?: string
  textStyle: Partial<TextStyleValue>
  affiliateProductActive: boolean
}

const defaultToolbarState: ToolbarState = {
  activeBlockStyle: 'normal',
  activeMarks: [],
  textStyle: {},
  affiliateProductActive: false,
}

function toSchemaActions(
  values: unknown,
  fallback: SchemaAction[],
  labels: Record<string, string>,
): SchemaAction[] {
  if (!Array.isArray(values) || values.length === 0) return fallback

  return values
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const value = (item as { value?: unknown }).value
      if (typeof value !== 'string') return null
      const title = (item as { title?: unknown }).title
      return {
        value,
        title: typeof title === 'string' ? title : value,
        label: labels[value] ?? value,
      }
    })
    .filter((item): item is SchemaAction => item !== null)
}

function getBlockSchema(props: PortableTextInputProps) {
  const blockMember = props.schemaType.of?.find((member) => member.name === 'block')
  return blockMember as
    | {
        styles?: Array<{ title?: string; value?: string }>
        marks?: {
          decorators?: Array<{ title?: string; value?: string }>
          annotations?: Array<{ name?: string; title?: string }>
        }
      }
    | undefined
}

function hasAnnotation(props: PortableTextInputProps, name: string) {
  return Boolean(getBlockSchema(props)?.marks?.annotations?.some((annotation) => annotation.name === name))
}

function getBlockObjectActions(props: PortableTextInputProps): SchemaAction[] {
  return (props.schemaType.of || [])
    .filter((member) => member.name && member.name !== 'block')
    .map((member) => ({
      value: member.name,
      title: member.title || member.name,
      label: BLOCK_OBJECT_LABELS[member.name] || member.title || member.name,
    }))
}

function isTextStyleAnnotation(
  annotation: PortableTextObject,
): annotation is TextStyleValue & PortableTextObject {
  return annotation._type === TEXT_STYLE_MARK
}

function normalizeHexColor(value: string | undefined) {
  if (!value) return undefined
  const trimmed = value.trim()
  return /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(trimmed) ? trimmed : undefined
}

function normalizeFontSize(value: number | undefined) {
  if (!Number.isFinite(value)) return undefined
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value as number)))
}

function normalizeTextStyle(value: Partial<TextStyleValue>) {
  const textColor = normalizeHexColor(value.textColor)
  const fontSize = normalizeFontSize(value.fontSize)
  const fontFamily = value.fontFamily
  const next: Partial<TextStyleValue> = { _type: TEXT_STYLE_MARK }

  if (textColor) next.textColor = textColor
  if (fontSize) next.fontSize = fontSize
  if (fontFamily) next.fontFamily = fontFamily

  return next
}

function hasTextStyleValue(value: Partial<TextStyleValue>) {
  return Boolean(value.textColor || value.fontSize || value.fontFamily)
}

function controlButtonStyle(active?: boolean): CSSProperties {
  return {
    alignItems: 'center',
    background: active ? '#1A1A1A' : '#FFFFFF',
    border: '1px solid #D8D2C8',
    borderRadius: 0,
    color: active ? '#FFFFFF' : '#1A1A1A',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 500,
    height: 32,
    justifyContent: 'center',
    minWidth: 32,
    padding: '0 10px',
  }
}

function fieldStyle(width: number): CSSProperties {
  return {
    background: '#FFFFFF',
    border: '1px solid #D8D2C8',
    borderRadius: 0,
    color: '#1A1A1A',
    fontFamily: 'inherit',
    fontSize: 12,
    height: 32,
    padding: '0 8px',
    width,
  }
}

function separatorStyle(): CSSProperties {
  return {
    background: '#D8D2C8',
    height: 24,
    width: 1,
  }
}

export function InlineTextStylePortableTextInput(props: PortableTextInputProps) {
  const editorRef = useRef<PortableTextEditor | null>(null)
  const [toolbarState, setToolbarState] = useState<ToolbarState>(defaultToolbarState)

  const blockSchema = getBlockSchema(props)
  const blockStyles = toSchemaActions(blockSchema?.styles, [{ title: 'Normal', value: 'normal', label: 'P' }], BLOCK_LABELS)
  const decorators = toSchemaActions(
    blockSchema?.marks?.decorators,
    [
      { title: 'Strong', value: 'strong', label: 'B' },
      { title: 'Emphasis', value: 'em', label: 'I' },
      { title: 'Underline', value: 'underline', label: 'U' },
    ],
    DECORATOR_LABELS,
  )
  const showAffiliateProduct = hasAnnotation(props, AFFILIATE_PRODUCT_MARK)
  const blockObjects = getBlockObjectActions(props)

  const syncToolbarState = useCallback(
    (editor: PortableTextEditor) => {
      const activeAnnotations = PortableTextEditor.activeAnnotations(editor)
      const textStyle = activeAnnotations.find(isTextStyleAnnotation) || defaultToolbarState.textStyle

      setToolbarState({
        activeBlockStyle:
          blockStyles.find((style) => PortableTextEditor.hasBlockStyle(editor, style.value))?.value || 'normal',
        activeMarks: decorators
          .filter((decorator) => PortableTextEditor.isMarkActive(editor, decorator.value))
          .map((decorator) => decorator.value),
        activeListStyle: ['bullet', 'number'].find((listStyle) =>
          PortableTextEditor.hasListStyle(editor, listStyle),
        ),
        textStyle,
        affiliateProductActive: PortableTextEditor.isAnnotationActive(editor, AFFILIATE_PRODUCT_MARK),
      })
    },
    [blockStyles, decorators],
  )

  const runEditorAction = useCallback(
    (action: (editor: PortableTextEditor) => void) => {
      const editor = editorRef.current
      if (!editor) return

      PortableTextEditor.focus(editor)
      action(editor)
      window.requestAnimationFrame(() => syncToolbarState(editor))
    },
    [syncToolbarState],
  )

  const applyTextStyle = useCallback(
    (partial: Partial<TextStyleValue>) => {
      runEditorAction((editor) => {
        const activeStyle = PortableTextEditor.activeAnnotations(editor).find(isTextStyleAnnotation) || {}
        const nextStyle = normalizeTextStyle({ ...activeStyle, ...partial })

        if (hasTextStyleValue(nextStyle)) {
          PortableTextEditor.addAnnotation(editor, { name: TEXT_STYLE_MARK }, nextStyle)
        } else {
          PortableTextEditor.removeAnnotation(editor, { name: TEXT_STYLE_MARK })
        }
      })
    },
    [runEditorAction],
  )

  const resetTextStyle = useCallback(() => {
    runEditorAction((editor) => {
      PortableTextEditor.removeAnnotation(editor, { name: TEXT_STYLE_MARK })
    })
  }, [runEditorAction])

  const preventEditorBlur = (event: MouseEvent) => {
    event.preventDefault()
  }

  return (
    <div>
      <div
        aria-label="Text formatting"
        style={{
          alignItems: 'center',
          background: '#FFFFFF',
          border: '1px solid #D8D2C8',
          boxShadow: '0 6px 20px rgba(26, 26, 26, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginBottom: 8,
          padding: 8,
          position: 'sticky',
          top: 0,
          zIndex: 2,
        }}
      >
        {blockStyles.map((style) => (
          <button
            key={style.value}
            aria-label={style.title}
            onClick={() =>
              runEditorAction((editor) => PortableTextEditor.toggleBlockStyle(editor, style.value))
            }
            onMouseDown={preventEditorBlur}
            style={controlButtonStyle(toolbarState.activeBlockStyle === style.value)}
            title={style.title}
            type="button"
          >
            {style.label}
          </button>
        ))}

        <span style={separatorStyle()} />

        {decorators.map((decorator) => (
          <button
            key={decorator.value}
            aria-label={decorator.title}
            onClick={() =>
              runEditorAction((editor) => PortableTextEditor.toggleMark(editor, decorator.value))
            }
            onMouseDown={preventEditorBlur}
            style={controlButtonStyle(toolbarState.activeMarks.includes(decorator.value))}
            title={decorator.title}
            type="button"
          >
            {decorator.label}
          </button>
        ))}

        <button
          aria-label="Bullet list"
          onClick={() => runEditorAction((editor) => PortableTextEditor.toggleList(editor, 'bullet'))}
          onMouseDown={preventEditorBlur}
          style={controlButtonStyle(toolbarState.activeListStyle === 'bullet')}
          title="Bullet list"
          type="button"
        >
          List
        </button>
        <button
          aria-label="Numbered list"
          onClick={() => runEditorAction((editor) => PortableTextEditor.toggleList(editor, 'number'))}
          onMouseDown={preventEditorBlur}
          style={controlButtonStyle(toolbarState.activeListStyle === 'number')}
          title="Numbered list"
          type="button"
        >
          1.
        </button>

        {blockObjects.length > 0 ? (
          <>
            <span style={separatorStyle()} />
            {blockObjects.map((blockObject) => (
              <button
                key={blockObject.value}
                aria-label={blockObject.title}
                onClick={() =>
                  runEditorAction((editor) =>
                    PortableTextEditor.insertBlock(editor, { name: blockObject.value }, {}),
                  )
                }
                onMouseDown={preventEditorBlur}
                style={controlButtonStyle()}
                title={blockObject.title}
                type="button"
              >
                {blockObject.label}
              </button>
            ))}
          </>
        ) : null}

        {showAffiliateProduct ? (
          <>
            <span style={separatorStyle()} />
            <button
              aria-label="Affiliate product"
              onClick={() =>
                runEditorAction((editor) =>
                  PortableTextEditor.addAnnotation(editor, { name: AFFILIATE_PRODUCT_MARK }),
                )
              }
              onMouseDown={preventEditorBlur}
              style={controlButtonStyle(toolbarState.affiliateProductActive)}
              title="Affiliate product"
              type="button"
            >
              Product
            </button>
            <button
              aria-label="Remove affiliate product"
              onClick={() =>
                runEditorAction((editor) =>
                  PortableTextEditor.removeAnnotation(editor, { name: AFFILIATE_PRODUCT_MARK }),
                )
              }
              onMouseDown={preventEditorBlur}
              style={controlButtonStyle()}
              title="Remove affiliate product"
              type="button"
            >
              Unproduct
            </button>
          </>
        ) : null}

        <span style={separatorStyle()} />

        {COLOR_PRESETS.map((color) => {
          const isLight = color.value === '#FFFFFF' || color.value === '#E8E1D8'
          return (
            <button
              key={color.value}
              aria-label={color.title}
              onClick={() => applyTextStyle({ textColor: color.value })}
              onMouseDown={preventEditorBlur}
              style={{
                ...controlButtonStyle(toolbarState.textStyle.textColor === color.value),
                background: color.value,
                color: isLight ? '#1A1A1A' : '#FFFFFF',
                minWidth: 32,
                padding: 0,
              }}
              title={color.title}
              type="button"
            >
              A
            </button>
          )
        })}

        <input
          aria-label="Custom text color"
          onChange={(event) => applyTextStyle({ textColor: event.currentTarget.value })}
          style={{
            background: '#FFFFFF',
            border: '1px solid #D8D2C8',
            borderRadius: 0,
            height: 32,
            padding: 3,
            width: 42,
          }}
          title="Custom text color"
          type="color"
          value={toolbarState.textStyle.textColor || DEFAULT_COLOR}
        />

        <input
          aria-label="Font size in pixels"
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          onChange={(event) => {
            const fontSize = Number(event.currentTarget.value)
            if (Number.isFinite(fontSize)) applyTextStyle({ fontSize })
          }}
          placeholder="px"
          style={fieldStyle(58)}
          title="Font size in pixels"
          type="number"
          value={toolbarState.textStyle.fontSize || ''}
        />

        <select
          aria-label="Font family"
          onChange={(event) =>
            applyTextStyle({
              fontFamily:
                event.currentTarget.value === ''
                  ? undefined
                  : (event.currentTarget.value as TextStyleFontFamily),
            })
          }
          style={fieldStyle(178)}
          title="Font family"
          value={toolbarState.textStyle.fontFamily || ''}
        >
          <option value="">Font</option>
          {TEXT_STYLE_FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.title}
            </option>
          ))}
        </select>

        <button
          aria-label="Reset text style"
          onClick={resetTextStyle}
          onMouseDown={preventEditorBlur}
          style={controlButtonStyle()}
          title="Reset text style"
          type="button"
        >
          Reset
        </button>
      </div>

      <PortableTextInput
        {...props}
        editorRef={editorRef}
        hideToolbar
        onEditorChange={(change, editor) => {
          props.onEditorChange?.(change, editor)
          syncToolbarState(editor)
        }}
      />
    </div>
  )
}
