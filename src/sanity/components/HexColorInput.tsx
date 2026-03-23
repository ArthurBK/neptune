import { Flex, Text, TextInput } from '@sanity/ui'
import { set, unset, type StringInputProps } from 'sanity'

export function HexColorInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props
  const current = typeof value === 'string' && value.trim().length > 0 ? value : '#1A1A1A'

  return (
    <Flex gap={3} align="center">
      <input
        type="color"
        value={current}
        onChange={(event) => {
          const next = event.currentTarget.value
          onChange(next ? set(next) : unset())
        }}
        style={{ width: 44, height: 32, border: 'none', background: 'transparent', padding: 0 }}
      />
      <div style={{ flex: 1 }}>
        <TextInput
          {...elementProps}
          value={value ?? ''}
          onChange={(event) => {
            const next = event.currentTarget.value
            onChange(next ? set(next) : unset())
          }}
          placeholder="#1A1A1A"
        />
      </div>
      <Text size={1} muted>
        HEX
      </Text>
    </Flex>
  )
}
