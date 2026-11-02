import type { BlockProps, ItemProps } from 'sanity'

type ValidationDetailsProps = Pick<ItemProps, 'validation' | 'path' | 'schemaType'> & {
  onOpen?: () => void
  openLabel: string
}

function ValidationDetails(props: ValidationDetailsProps) {
  const messages = props.validation.filter(marker => marker.level !== 'info')
  if (!messages.length) return null

  const hasErrors = messages.some(marker => marker.level === 'error')
  return (
      <div
        contentEditable={false}
        aria-label="Validation details"
        style={{
          background: hasErrors ? '#FFF5F5' : '#FFFBEB',
          color: hasErrors ? '#8B2020' : '#714B00',
          border: `1px solid ${hasErrors ? '#EBCACA' : '#E8D6A3'}`,
          borderRadius: 4,
          margin: '0 8px 8px',
          padding: '10px 12px',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {messages.map((marker, index) => {
            // Sanity validation paths are absolute; identify the field within this item.
            const fieldName = marker.path.slice(props.path.length).find(segment => typeof segment === 'string')
            const field = 'fields' in props.schemaType
              ? props.schemaType.fields.find(field => field.name === fieldName)
              : undefined
            return (
              <li key={`${JSON.stringify(marker.path)}-${index}`}>
                <strong>{marker.level === 'error' ? 'Error' : 'Warning'}{field ? ` — ${field.type.title || field.name}` : ''}: </strong>
                {marker.message}
              </li>
            )
          })}
        </ul>
        {props.onOpen && (
          <button
            type="button"
            onClick={event => { event.stopPropagation(); props.onOpen?.() }}
            style={{ color: 'inherit', background: 'none', border: 0, padding: '6px 0 0', font: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
          >
            {props.openLabel}
          </button>
        )}
      </div>
  )
}


/** Attach to the array MEMBER, because Sanity resolves items from their own type. */
export function ItemWithValidation(props: ItemProps) {
  return <>
    {props.renderDefault(props)}
    <ValidationDetails {...props} onOpen={'onOpen' in props ? props.onOpen : undefined} openLabel="Open image to review" />
  </>
}

/** Portable Text objects use the block slot, not the array item slot. */
export function BlockWithValidation(props: BlockProps) {
  return <>
    {props.renderDefault(props)}
    <ValidationDetails {...props} openLabel="Open grid to review" />
  </>
}
