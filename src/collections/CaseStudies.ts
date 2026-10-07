import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished'
import { populatePublishedAt } from '../hooks/populatePublishedAt'

export const CaseStudies: CollectionConfig = {
  slug: 'case-studies',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'summary', type: 'textarea' },
    { name: 'problem', type: 'textarea' },
    { name: 'context', type: 'textarea' },
    { name: 'approach', type: 'textarea' },
    { name: 'systemDesigned', type: 'textarea', label: 'System designed' },
    { name: 'technology', type: 'textarea' },
    { name: 'outcome', type: 'textarea' },
    { name: 'lessons', type: 'textarea' },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [populatePublishedAt],
  },
  versions: {
    drafts: true,
    maxPerDoc: 25,
  },
}
