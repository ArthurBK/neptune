import type { BlockProps } from 'sanity'
import { blockTextAlignment } from '@/lib/textAlignment'

export function AlignedTextBlock(props: BlockProps) {
  return <div style={{ textAlign: blockTextAlignment(props.value) }}>{props.renderDefault(props)}</div>
}
