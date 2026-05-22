import { sanityFetch } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries'

import { NewsletterPageContent } from '@/components/newsletter/NewsletterPageContent'
import type { PageIntroPortableText } from '@/components/shared/PageIntroText'

export const revalidate = 3600

export default async function NewslettersPage() {
  const settings = await sanityFetch<{
    newsletterHeadline?: string | null
    newsletterSubtitle?: string | null
    newsletterDescriptionRichText?: PageIntroPortableText | null
    newsletterImage?: { asset?: { _ref: string } } | null
    newsletterImageLegend?: unknown | null
  } | null>(SITE_SETTINGS_QUERY)

  const imageUrl =
    settings?.newsletterImage?.asset
      ? urlFor(settings.newsletterImage).width(1920).quality(85).url()
      : null

  return (
    <NewsletterPageContent
      subtitle={settings?.newsletterSubtitle}
      descriptionRichText={settings?.newsletterDescriptionRichText}
      imageUrl={imageUrl}
      imageLegend={settings?.newsletterImageLegend}
    />
  )
}
