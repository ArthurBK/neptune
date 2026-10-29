import 'server-only'

// Dedicated Viewer token. Never use the write token or a NEXT_PUBLIC variable.
export const readToken = process.env.SANITY_API_READ_TOKEN

export function requireReadToken(): string {
  if (!readToken) throw new Error('Article preview requires SANITY_API_READ_TOKEN with Viewer permissions.')
  return readToken
}
