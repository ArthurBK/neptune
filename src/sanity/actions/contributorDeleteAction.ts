import type { DocumentActionComponent } from 'sanity'

const actionCache = new WeakMap<DocumentActionComponent, DocumentActionComponent>()

/** Expose the native delete action in both the footer and the document menu. */
export function contributorDeleteAction(
  useNativeDeleteAction: DocumentActionComponent,
): DocumentActionComponent {
  const cachedAction = actionCache.get(useNativeDeleteAction)
  if (cachedAction) return cachedAction

  const useContributorDeleteAction: DocumentActionComponent = (props) => {
    const action = useNativeDeleteAction(props)
    if (!action) return null

    return {
      ...action,
      group: Array.from(new Set([...(action.group ?? ['default']), 'paneActions'])),
    }
  }

  useContributorDeleteAction.action = useNativeDeleteAction.action
  useContributorDeleteAction.displayName = 'ContributorDeleteAction'
  actionCache.set(useNativeDeleteAction, useContributorDeleteAction)
  return useContributorDeleteAction
}
