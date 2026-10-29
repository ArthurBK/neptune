'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {presentationTool} from 'sanity/presentation'
import {media} from 'sanity-plugin-media'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import {apiVersion, dataset, projectId} from './src/sanity/env'
import {schema} from './src/sanity/schemas'
import {structure} from './src/sanity/structure'
import {contributorDeleteAction} from './src/sanity/actions/contributorDeleteAction'
import {articleReferenceAction} from './src/sanity/actions/articleReferenceAction'
import {articlePreviewAction} from './src/sanity/actions/articlePreviewAction'
import {resolve} from './src/sanity/presentation/resolve'

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemas' folder
  schema: {
    ...schema,
    // Existing photographer documents remain editable; all new people are contributors.
    templates: (templates) => templates.filter((template) => template.schemaType !== 'photographer'),
  },
  document: {
    actions: (actions, {schemaType}) =>
      schemaType === 'contributor' || schemaType === 'photographer'
        ? actions.filter((action) => schemaType !== 'photographer' || action.action !== 'duplicate').map((action) =>
            action.action === 'delete' ? contributorDeleteAction(action) : action,
          )
        : schemaType === 'article'
          ? [...actions.map((action) =>
              action.action === 'unpublish' || action.action === 'delete'
                ? articleReferenceAction(action)
                : action,
            ), articlePreviewAction]
          : actions,
  },
  plugins: [
    structureTool({structure}),
    presentationTool({
      title: 'Preview',
      resolve,
      previewUrl: {
        // Embedded Studio: use the current origin in production and local development.
        initial: '/',
        previewMode: { enable: '/api/draft-mode/enable', shareAccess: false },
      },
    }),
    // Media: browse assets, bulk upload, select multiple at once
    media(),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
