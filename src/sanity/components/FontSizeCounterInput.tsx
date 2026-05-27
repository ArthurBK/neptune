import { Button, Flex, Text, TextInput } from '@sanity/ui'
import { set, unset, type NumberInputProps } from 'sanity'

const MIN_FONT_SIZE = 6
const MAX_FONT_SIZE = 50
const DEFAULT_FONT_SIZE = 16

function clampFontSize(value: number): number {
  return Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, Math.round(value)))
}

export function FontSizeCounterInput(props: NumberInputProps) {
  const { value, onChange, elementProps } = props
  const currentValue = typeof value === 'number' ? value : undefined
  const isReadOnly = elementProps.readOnly

  const setValue = (nextValue: number) => {
    onChange(set(clampFontSize(nextValue)))
  }

  const stepValue = (delta: number) => {
    setValue((currentValue ?? DEFAULT_FONT_SIZE) + delta)
  }

  return (
    <Flex align="center" gap={2}>
      <Button
        aria-label="Decrease font size"
        disabled={isReadOnly || (currentValue !== undefined && currentValue <= MIN_FONT_SIZE)}
        mode="ghost"
        onClick={() => stepValue(-1)}
        text="-"
      />
      <div style={{ width: 88 }}>
        <TextInput
          {...elementProps}
          inputMode="numeric"
          max={MAX_FONT_SIZE}
          min={MIN_FONT_SIZE}
          onChange={(event) => {
            const nextValue = event.currentTarget.value

            if (nextValue === '') {
              onChange(unset())
              return
            }

            const parsed = Number(nextValue)
            if (Number.isFinite(parsed)) onChange(set(Math.round(parsed)))
          }}
          placeholder={`${DEFAULT_FONT_SIZE}`}
          step={1}
          type="number"
          value={currentValue === undefined ? '' : `${currentValue}`}
        />
      </div>
      <Button
        aria-label="Increase font size"
        disabled={isReadOnly || (currentValue !== undefined && currentValue >= MAX_FONT_SIZE)}
        mode="ghost"
        onClick={() => stepValue(1)}
        text="+"
      />
      <Text muted size={1}>
        px
      </Text>
    </Flex>
  )
}
