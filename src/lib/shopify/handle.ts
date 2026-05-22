export function normalizeShopifyProductHandle(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  if (!trimmedValue) {
    return null
  }

  const withoutQueryOrHash = trimmedValue.split(/[?#]/)[0].replace(/\/+$/, '')
  const productPathMatch = withoutQueryOrHash.match(/(?:^|\/)products\/([^/]+)$/i)
  const rawHandle = productPathMatch?.[1] ?? withoutQueryOrHash.split('/').filter(Boolean).at(-1)

  if (!rawHandle) {
    return null
  }

  try {
    return decodeURIComponent(rawHandle)
  } catch {
    return rawHandle
  }
}
