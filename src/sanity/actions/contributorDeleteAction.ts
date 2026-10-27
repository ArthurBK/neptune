import { useState } from 'react'
import { useToast } from '@sanity/ui'
import { useClient, type DocumentActionComponent } from 'sanity'
import { deleteContributor } from '../lib/deleteContributor'

const actionCache = new WeakMap<DocumentActionComponent, DocumentActionComponent>()

/** Preserve credits when deleting a contributor, retaining native permission checks. */
export function contributorDeleteAction(
  useNativeDeleteAction: DocumentActionComponent,
): DocumentActionComponent {
  const cachedAction = actionCache.get(useNativeDeleteAction)
  if (cachedAction) return cachedAction

  const useContributorDeleteAction: DocumentActionComponent = (props) => {
    const action = useNativeDeleteAction(props)
    const client = useClient({ apiVersion: '2026-03-06' }).withConfig({ useCdn: false })
    const toast = useToast()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    if (!action) return null
    // Release-version deletion has different semantics; retain Sanity's native action.
    if (props.release) return action

    return {
      ...action,
      group: Array.from(new Set([...(action.group ?? ['default']), 'paneActions'])),
      disabled: action.disabled || isDeleting,
      label: isDeleting ? 'Deleting…' : action.label,
      onHandle: () => setConfirmOpen(true),
      dialog: confirmOpen && {
        type: 'confirm',
        tone: 'critical',
        message: 'Delete this contributor? Articles will remain, with the name kept as plain text in writing and photography credits. Links to this profile will be removed.',
        confirmButtonText: 'Delete contributor',
        onCancel: () => setConfirmOpen(false),
        onConfirm: async () => {
          setConfirmOpen(false)
          setIsDeleting(true)
          try {
            await deleteContributor(client, props.id)
            toast.push({ status: 'success', title: 'Contributor deleted. Article credits have been preserved.' })
            props.onComplete()
          } catch (error) {
            toast.push({
              status: 'error',
              title: 'Could not confirm deletion. Refresh the Studio before trying again.',
              description: error instanceof Error ? error.message : 'Please refresh and try again.',
            })
          } finally {
            setIsDeleting(false)
          }
        },
      },
    }
  }

  useContributorDeleteAction.action = useNativeDeleteAction.action
  useContributorDeleteAction.displayName = 'ContributorDeleteAction'
  actionCache.set(useNativeDeleteAction, useContributorDeleteAction)
  return useContributorDeleteAction
}
