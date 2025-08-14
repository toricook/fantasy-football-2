import { type SchemaTypeDefinition } from 'sanity'
import announcement from './announcement'
import newsArticle from './newsArticle'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [announcement, newsArticle],
}