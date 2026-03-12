import { sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'

import { NewsletterPageContent } from '@/components/newsletter/NewsletterPageContent'

export const revalidate = 3600

export default async function NewslettersPage() {
  const settings = await sanityFetch<{
    newsletterHeadline?: string | null
    newsletterSubtitle?: string | null
    newsletterImage?: { asset?: { _ref: string } } | null
    newsletterImageLegend?: string | null
  } | null>(SITE_SETTINGS_QUERY)

  const imageUrl =
    settings?.newsletterImage?.asset
      ? urlFor(settings.newsletterImage).width(1920).quality(85).url()
      : null

  return (
    <NewsletterPageContent
      headline={settings?.newsletterHeadline}
      subtitle={settings?.newsletterSubtitle}
      imageUrl={imageUrl}
      imageLegend={settings?.newsletterImageLegend}
    />
  )
}
