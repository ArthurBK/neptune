import { alignedStyle, blockTextAlignment, type TextAlignment } from '@/lib/textAlignment'
import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { PortableTextInput, set, type PortableTextInputProps } from 'sanity'
import { PortableTextEditor, type PortableTextObject } from '@portabletext/editor'
import type { BlockSchemaType } from '@sanity/types'
import { ResetIcon } from '@sanity/icons'

import { TEXT_STYLE_FONT_FAMILIES, type TextStyleFontFamily } from '@/lib/textStyleFonts'

const TEXT_STYLE_MARK = 'textStyle'

const COLOR_PRESETS = [
  { title: 'Black', value: '#1A1A1A' },
  { title: 'Warm gray', value: '#6B6B6B' },
  { title: 'Soft beige', value: '#E8E1D8' },
  { title: 'Brown', value: '#8A6A55' },
  { title: 'White', value: '#FFFFFF' },
] as const

const MIN_FONT_SIZE = 6
const MAX_FONT_SIZE = 50
const DEFAULT_COLOR = '#1A1A1A'

type TextStyleValue = {
  _type: typeof TEXT_STYLE_MARK
  textColor?: string
  fontSize?: number
  fontFamily?: TextStyleFontFamily
}

type ToolbarState = {
  textStyle: Partial<TextStyleValue>
  alignment?: string
  hasTextSelection: boolean
}

const defaultToolbarState: ToolbarState = { textStyle: {}, hasTextSelection: false }

function selectedTextBlocks(editor: PortableTextEditor) {
  const selection = PortableTextEditor.getSelection(editor)
  const blocks = PortableTextEditor.getValue(editor) || []
  if (!selection) return []
  const anchor = selection.anchor.path[0]
  const focus = selection.focus.path[0]
  if (typeof anchor !== 'object' || typeof focus !== 'object' || !('_key' in anchor) || !('_key' in focus)) return []
  const start = blocks.findIndex(block => block._key === anchor._key)
  const end = blocks.findIndex(block => block._key === focus._key)
  if (start < 0 || end < 0) return []
  return blocks.slice(Math.min(start, end), Math.max(start, end) + 1)
    .filter(block => block._type === 'block')
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
    borderRadius: 4,
    color: active ? '#FFFFFF' : '#1A1A1A',
    cursor: 'pointer',
    display: 'inline-flex',
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 500,
    gap: 4,
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
    borderRadius: 4,
    color: '#1A1A1A',
    fontFamily: 'inherit',
    fontSize: 12,
    height: 32,
    padding: '0 8px',
    width,
  }
}

function ToolbarSeparator() {
  return <span aria-hidden="true" style={{ width: 1, height: 24, background: '#D8D2C8', margin: '0 4px', flexShrink: 0 }} />
}

export function InlineTextStylePortableTextInput(props: PortableTextInputProps) {
  const editorRef = useRef<PortableTextEditor | null>(null)
  const [toolbarState, setToolbarState] = useState<ToolbarState>(defaultToolbarState)

  const blockSchema = props.schemaType.of?.find(member => member.name === 'block') as BlockSchemaType | undefined
  const supportsAlignment = blockSchema?.fields[1].type.options?.list?.some(style => typeof style === 'object' && 'value' in style && style.value === 'normal-center')

  const syncToolbarState = useCallback((editor: PortableTextEditor) => {
    const blocks = selectedTextBlocks(editor)
    const alignment = blockTextAlignment(blocks[0])
    setToolbarState({
      textStyle: PortableTextEditor.activeAnnotations(editor).find(isTextStyleAnnotation) || {},
      alignment: blocks.every(block => blockTextAlignment(block) === alignment) ? alignment as string | undefined : undefined,
      hasTextSelection: blocks.length > 0,
    })
  }, [])

  const runEditorAction = useCallback(
    (action: (editor: PortableTextEditor) => void) => {
      const editor = editorRef.current
      if (!editor || props.readOnly) return

      PortableTextEditor.focus(editor)
      action(editor)
      window.requestAnimationFrame(() => syncToolbarState(editor))
    },
    [syncToolbarState, props.readOnly],
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

  const applyAlignment = (alignment: TextAlignment) => runEditorAction(editor => {
    const blocks = selectedTextBlocks(editor)
    if (!blocks.length) return
    props.onChange(blocks.map(block => set(alignedStyle('style' in block ? block.style : 'normal', alignment), [{ _key: block._key }, 'style'])))
    setToolbarState(state => ({ ...state, alignment }))
  })

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
          borderRadius: 6,
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
        {supportsAlignment && (
          <>
          <div role="group" aria-label="Paragraph alignment" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {(['left', 'center', 'right'] as const).map(alignment => (
              <button key={alignment} type="button" aria-label={`Align ${alignment}`}
                title={`Align paragraph ${alignment}`} aria-pressed={toolbarState.alignment === alignment}
                disabled={props.readOnly || !toolbarState.hasTextSelection}
                onMouseDown={preventEditorBlur} onClick={() => applyAlignment(alignment)}
                style={controlButtonStyle(toolbarState.alignment === alignment)}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  {[3, 6, 9, 12].map((y, index) => {
                    const short = index % 2 === 1
                    const x = !short || alignment === 'left' ? 1 : alignment === 'center' ? 4 : 7
                    return <path key={y} d={`M${x} ${y}h${short ? 8 : 14}`} stroke="currentColor" strokeWidth="1.5" />
                  })}
                </svg>
              </button>
            ))}
          </div>
          <ToolbarSeparator />
          </>
        )}
        {COLOR_PRESETS.map((color) => {
          return (
            <button
              key={color.value}
              disabled={props.readOnly}
              aria-label={color.title}
              aria-pressed={toolbarState.textStyle.textColor === color.value}
              onClick={() => applyTextStyle({ textColor: color.value })}
              onMouseDown={preventEditorBlur}
              style={{
                ...controlButtonStyle(toolbarState.textStyle.textColor === color.value),
                background: color.value,
                minWidth: 32,
                padding: 0,
                outline: toolbarState.textStyle.textColor === color.value ? '2px solid #2563EB' : undefined,
                outlineOffset: 1,
              }}
              title={color.title}
              type="button"
            >
              <span className="sr-only">{color.title}</span>
            </button>
          )
        })}

        <input
          disabled={props.readOnly}
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

        <ToolbarSeparator />
        <span style={{ fontSize: 12 }}>Size (px)</span>
        <input
          disabled={props.readOnly}
          aria-label="Font size in pixels"
          min={MIN_FONT_SIZE}
          max={MAX_FONT_SIZE}
          onChange={(event) => {
            const fontSize = Number(event.currentTarget.value)
            applyTextStyle({ fontSize: event.currentTarget.value === '' ? undefined : fontSize })
          }}
          placeholder="px"
          style={fieldStyle(58)}
          title="Font size in pixels"
          type="number"
          value={toolbarState.textStyle.fontSize || ''}
        />

        <select
          disabled={props.readOnly}
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
          <option value="">Default font</option>
          {TEXT_STYLE_FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.title}
            </option>
          ))}
        </select>

        <ToolbarSeparator />
        <button
          disabled={props.readOnly}
          aria-label="Reset text style"
          onClick={resetTextStyle}
          onMouseDown={preventEditorBlur}
          style={controlButtonStyle()}
          title="Reset text style"
          type="button"
        >
          <ResetIcon aria-hidden style={{ fontSize: 18 }} />
          Reset text style
        </button>
      </div>

      <PortableTextInput
        {...props}
        editorRef={editorRef}
        // Standard formatting, links, lists and media are provided only by Sanity.
        hideToolbar={false}
        onEditorChange={(change, editor) => {
          props.onEditorChange?.(change, editor)
          syncToolbarState(editor)
        }}
      />
    </div>
  )
}
