import { EyeOpenIcon } from '@sanity/icons'
import type { DocumentActionComponent } from 'sanity'
import { useRouter } from 'sanity/router'
import { articlePreviewPath } from '../presentation/resolve'

export const articlePreviewAction: DocumentActionComponent = function useArticlePreviewAction({ draft, published, id, onComplete }) {
  const router = useRouter()
  const document = draft ?? published
  const href = articlePreviewPath((document?.slug as { current?: string } | undefined)?.current)

  return {
    label: 'Preview',
    icon: EyeOpenIcon,
    group: ['default', 'paneActions'],
    disabled: !href,
    title: href ? 'Preview this article before publishing' : 'Generate a slug to enable preview',
    onHandle: () => {
      if (!href) return
      onComplete()
      router.navigateIntent('edit', {
        id,
        type: 'article',
        mode: 'presentation',
        presentation: 'presentation',
        preview: href,
      })
    },
  }
}
