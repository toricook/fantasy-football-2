import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'announcement',
  title: 'Commissioner Announcement',
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
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'priority',
      title: 'Priority',
      type: 'string',
      options: {
        list: [
          { title: 'Low', value: 'low' },
          { title: 'Normal', value: 'normal' },
          { title: 'High', value: 'high' },
          { title: 'Urgent', value: 'urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      description: 'Toggle to show/hide this announcement',
      initialValue: true,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expires at',
      type: 'datetime',
      description: 'Optional: When should this announcement stop showing?',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      priority: 'priority',
      isActive: 'isActive',
      publishedAt: 'publishedAt',
    },
    prepare(selection) {
      const { title, priority, isActive, publishedAt } = selection
      const priorityEmoji: Record<string, string> = {
        low: '🔵',
        normal: '⚪',
        high: '🟡',
        urgent: '🔴',
      }
      return {
        title: title,
        subtitle: `${priorityEmoji[priority] || '⚪'} ${isActive ? '✅' : '❌'} ${new Date(publishedAt).toLocaleDateString()}`,
      }
    },
  },
  orderings: [
    {
      title: 'Priority, Newest first',
      name: 'priorityNew',
      by: [
        { field: 'priority', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' },
      ],
    },
  ],
})