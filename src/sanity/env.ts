// Sanity dev uses SANITY_STUDIO_* prefix; Next.js uses NEXT_PUBLIC_*
// https://www.sanity.io/docs/environment-variables
export const apiVersion =
  process.env.SANITY_STUDIO_API_VERSION ??
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ??
  '2026-03-06'

export const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: SANITY_DATASET (set SANITY_STUDIO_DATASET or NEXT_PUBLIC_SANITY_DATASET)'
)

export const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: SANITY_PROJECT_ID (set SANITY_STUDIO_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID)'
)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
