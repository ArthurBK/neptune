/** Convert article references only, preserving their positions, IDs, and other metadata. */
export function articleReferenceUpdates(document, articleIds) {
  const set = {}
  let referenceCount = 0

  function visit(value, path) {
    if (!value || typeof value !== 'object') return
    if (value._type === 'reference' && articleIds.has(value._ref)) {
      let changed = false
      if (value._weak !== true) {
        set[`${path}._weak`] = true
        changed = true
      }
      // Otherwise publishing an existing draft could turn this back into a strong reference.
      if (value._strengthenOnPublish && value._strengthenOnPublish.weak !== true) {
        set[`${path}._strengthenOnPublish.weak`] = true
        changed = true
      }
      if (changed) referenceCount++
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const selector = typeof item?._key === 'string'
          ? `[_key==${JSON.stringify(item._key)}]`
          : `[${index}]`
        visit(item, `${path}${selector}`)
      })
      return
    }
    for (const [key, child] of Object.entries(value)) {
      visit(child, path ? `${path}.${key}` : key)
    }
  }

  visit(document, '')
  return { set, referenceCount }
}
