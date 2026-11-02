import type { BlockAnnotationProps } from 'sanity'
import { styled } from 'styled-components'

const LinkedText = styled.span<{ $invalid: boolean }>`
  &, & * {
    color: ${({ $invalid }) => $invalid ? '#dc2626' : '#2563eb'} !important;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  [data-scheme='dark'] &, [data-scheme='dark'] & * {
    color: ${({ $invalid }) => $invalid ? '#fca5a5' : '#93c5fd'} !important;
  }
`

export function LinkAnnotation(props: BlockAnnotationProps) {
  const invalid = props.validation.some(marker => marker.level === 'error')
  // Style only the text, preserving Sanity's edit/remove controls and error indicators.
  return props.renderDefault({
    ...props,
    textElement: <LinkedText $invalid={invalid}>{props.textElement}</LinkedText>,
  })
}
