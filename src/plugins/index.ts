import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'

import { Page, Post } from '@/payload-types'
import { repositoryTools } from '@/plugins/repositoryTools'
import { getServerSideURL } from '@/utilities/getURL'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | CX83 Labs` : 'CX83 Labs'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

const mcpContent = {
  enabled: {
    find: true,
    create: true,
    update: true,
    delete: true,
  },
} as const

export const plugins: Plugin[] = [
  mcpPlugin({
    disabled: process.env.NODE_ENV === 'production' && process.env.PAYLOAD_MCP_ENABLED !== 'true',
    collections: {
      pages: { description: 'Website pages.', ...mcpContent },
      posts: { description: 'Articles.', ...mcpContent },
      media: { description: 'Uploaded media.', ...mcpContent },
      services: { description: 'CX83 services.', ...mcpContent },
      projects: { description: 'CX83 projects.', ...mcpContent },
      'case-studies': { description: 'CX83 case studies.', ...mcpContent },
      forms: { description: 'Payload forms.', ...mcpContent },
      'form-submissions': { description: 'Saved form submissions.', ...mcpContent },
      users: { description: 'Admin users.', ...mcpContent },
      categories: { description: 'Post categories.', ...mcpContent },
    },
    globals: {
      header: { description: 'Header navigation.', enabled: { find: true, update: true } },
      footer: { description: 'Footer navigation.', enabled: { find: true, update: true } },
      'site-settings': { description: 'Site settings.', enabled: { find: true, update: true } },
      'assistant-settings': {
        description: 'Visitor assistant settings.',
        enabled: { find: true, update: true },
      },
    },
    mcp: {
      handlerOptions: {
        maxDuration: 300,
      },
      serverOptions: {
        serverInfo: {
          name: 'CX83 Website',
          version: '0.2.0',
        },
        instructions:
          'This server is the CX83 Labs owner connection. Content tools find, create, update, and delete pages, posts, media, services, projects, case studies, forms, form submissions, categories, and users, and they find and update header, footer, site settings, and assistant settings. Those tools run with the authenticated owner account. Code tools read and search this repository, read the local development log, and apply a unique text edit in the git checkout. getRepositoryStatus reports the staging checkout commit, the deployed commit, and whether a fast-forward is safe. syncRepositoryCheckout fast-forwards only the staging-host checkout of Mike-CX83/cx83_webapp to that deployed commit, and it refuses uncommitted work, the wrong branch, an unexpected origin, a detached HEAD, and diverged history. runRepositoryCheck starts typecheck, lint, or test:int and returns immediately with an id. Call it again with that id to retrieve the exit code and output. Do not ask for or repeat credential files. These code tools are not available to the public visitor assistant.',
      },
      tools: repositoryTools,
    },
  }),
  redirectsPlugin({
    collections: ['pages', 'posts', 'services', 'projects', 'case-studies'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
