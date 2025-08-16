import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'newsArticle',
  title: 'News Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
        },
      ],
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                title: 'URL',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alternative Text',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'season',
      title: 'Season',
      type: 'string',
      description: 'Which fantasy season this article belongs to (e.g., "2025", "2024")',
      validation: (Rule) => Rule.required(),
      initialValue: () => new Date().getFullYear().toString(),
      options: {
        list: [
          { title: '2025', value: '2025' },
          { title: '2024', value: '2024' },
          { title: '2023', value: '2023' },
          { title: '2022', value: '2022' },
          { title: '2021', value: '2021' },
          { title: '2020', value: '2020' },
          { title: '2019', value: '2019' },
          { title: '2018', value: '2018' },
        ].reverse(), // Most recent first
      },
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Commissioner',
    }),
    defineField({
      name: 'isPublished',
      title: 'Published',
      type: 'boolean',
      description: 'Toggle to publish/unpublish this article',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      season: 'season',
      isPublished: 'isPublished',
      media: 'featuredImage',
    },
    prepare(selection) {
      const { title, author, season, isPublished, media } = selection
      return {
        title: title,
        subtitle: `${season} • ${author} • ${isPublished ? '✅ Published' : '❌ Draft'}`,
        media: media,
      }
    },
  },
  orderings: [
    {
      title: 'Season & Date (Newest first)',
      name: 'seasonDateDesc',
      by: [
        { field: 'season', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' }
      ],
    },
    {
      title: 'Newest first',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
    {
      title: 'Oldest first',
      name: 'publishedAtAsc',
      by: [{ field: 'publishedAt', direction: 'asc' }],
    },
  ],
})