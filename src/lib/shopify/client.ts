const rawDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? ''
const domain = rawDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN ?? ''
const apiVersion = '2024-10'

const DEBUG = process.env.NODE_ENV === 'development'

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache',
}: {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
}): Promise<T> {
  const url = `https://${domain}/api/${apiVersion}/graphql.json`

  if (DEBUG) {
    const queryName = query.match(/query\s+(\w+)/)?.[1] ?? 'unknown'
    console.debug('[Shopify] Request:', {
      url,
      domain: domain || '(empty)',
      hasToken: !!token,
      tokenPrefix: token ? `${token.slice(0, 8)}...` : '(missing)',
      query: queryName,
      variables: variables ?? undefined,
    })
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
    cache,
    ...(cache === 'force-cache' && { next: { revalidate: 3600 } }),
  })

  const json = await res.json()

  if (DEBUG) {
    console.debug('[Shopify] Response:', {
      status: res.status,
      ok: res.ok,
      hasData: !!json.data,
      hasErrors: !!json.errors?.length,
      errors: json.errors,
    })
  }

  if (json.errors?.length) {
    const err = json.errors[0] as Record<string, unknown> | undefined
    const parts: string[] = []
    if (typeof err?.message === 'string' && err.message) parts.push(err.message)
    if (err?.extensions && typeof err.extensions === 'object') {
      const ext = err.extensions as Record<string, unknown>
      if (ext.code) parts.push(`code: ${String(ext.code)}`)
    }
    const message =
      parts.length > 0 ? parts.join(' | ') : JSON.stringify(json.errors)
    throw new Error(`Shopify API: ${message}`)
  }

  if (!res.ok) {
    throw new Error(`Shopify API: HTTP ${res.status}`)
  }

  return json.data
}
