import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schema } from './schemas'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

export default defineConfig({
  name: 'default',
  title: 'Fantasy Football League',
  projectId,
  dataset,
  basePath: '/studio', // Add this line
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Commissioner Announcements')
              .child(
                S.documentTypeList('announcement')
                  .title('Announcements')
                  .defaultOrdering([{ field: 'priority', direction: 'desc' }, { field: 'publishedAt', direction: 'desc' }])
              ),
            S.listItem()
              .title('News Articles')
              .child(
                S.documentTypeList('newsArticle')
                  .title('News Articles')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              ),
            S.divider(),
            ...S.documentTypeListItems().filter(
              (listItem) => !['announcement', 'newsArticle'].includes(listItem.getId()!)
            ),
          ])
    }),
    visionTool(),
  ],
  schema,
})