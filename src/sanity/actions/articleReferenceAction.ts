import { useState } from 'react'
import { useToast } from '@sanity/ui'
import { useClient, type DocumentActionComponent } from 'sanity'
import { prepareArticleUnpublish } from '../lib/prepareArticleUnpublish'

const actionCache = new WeakMap<DocumentActionComponent, DocumentActionComponent>()

export function articleReferenceAction(useNativeAction: DocumentActionComponent): DocumentActionComponent {
  const cached = actionCache.get(useNativeAction)
  if (cached) return cached

  const useArticleReferenceAction: DocumentActionComponent = (props) => {
    const action = useNativeAction(props)
    const client = useClient({ apiVersion: '2026-03-06' }).withConfig({ useCdn: false })
    const toast = useToast()
    const [preparing, setPreparing] = useState(false)
    if (!action || props.release) return action

    return {
      ...action,
      group: Array.from(new Set([...(action.group ?? ['default']), 'paneActions'])),
      disabled: action.disabled || preparing,
      label: preparing ? 'Preparing…' : action.label,
      onHandle: async () => {
        if (action.disabled || preparing) return
        setPreparing(true)
        try {
          await prepareArticleUnpublish(client, props.id)
          // Keep native permissions, confirmation, and draft-preservation behavior.
          action.onHandle?.()
        } catch (error) {
          toast.push({
            status: 'error',
            title: 'Could not prepare the article. Refresh the Studio and try again.',
            description: error instanceof Error ? error.message : undefined,
          })
        } finally {
          setPreparing(false)
        }
      },
    }
  }

  useArticleReferenceAction.action = useNativeAction.action
  useArticleReferenceAction.displayName = 'ArticleReferenceAction'
  actionCache.set(useNativeAction, useArticleReferenceAction)
  return useArticleReferenceAction
}
