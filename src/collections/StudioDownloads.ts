import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

const platforms = [
  { label: 'Mac arm64', value: 'mac-arm64' },
  { label: 'Windows x64', value: 'windows-x64' },
]

export const StudioProducts: CollectionConfig = {
  slug: 'studio-products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: { useAsTitle: 'name', group: 'Brand Studio' },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
  ],
}

export const StudioReleases: CollectionConfig = {
  slug: 'studio-releases',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: { useAsTitle: 'version', group: 'Brand Studio' },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'studio-products', required: true },
    { name: 'version', type: 'text', required: true },
  ],
}

export const StudioArtifacts: CollectionConfig = {
  slug: 'studio-artifacts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: { useAsTitle: 'filename', group: 'Brand Studio' },
  fields: [
    { name: 'release', type: 'relationship', relationTo: 'studio-releases', required: true },
    { name: 'catalogId', type: 'text', required: true, unique: true },
    { name: 'platform', type: 'select', required: true, options: platforms },
    { name: 'filename', type: 'text', required: true },
    { name: 'sha256', type: 'text' },
    {
      name: 'signingStatus',
      type: 'select',
      required: true,
      options: ['unsigned', 'developer-id', 'notarized'],
    },
  ],
}

export const StudioEntitlements: CollectionConfig = {
  slug: 'studio-entitlements',
  access: {
    create: authenticated,
    delete: authenticated,
    update: authenticated,
    read: ({ req: { user } }) => {
      if (!user) return false
      return { user: { equals: user.id } }
    },
  },
  admin: { group: 'Brand Studio' },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'productSlug', type: 'text', required: true, defaultValue: 'client-brand-studio' },
    {
      name: 'grant',
      type: 'select',
      required: true,
      options: [
        { label: 'Test grant, not a sale', value: 'test' },
        { label: 'Owner grant', value: 'owner' },
      ],
    },
    { name: 'platforms', type: 'select', hasMany: true, required: true, options: platforms },
  ],
}

export const StudioDownloadEvents: CollectionConfig = {
  slug: 'studio-download-events',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: () => false,
  },
  admin: { group: 'Brand Studio' },
  fields: [
    { name: 'user', type: 'relationship', relationTo: 'users', required: true },
    { name: 'catalogId', type: 'text', required: true },
    { name: 'testGrant', type: 'checkbox', defaultValue: false },
  ],
}
