import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'CX83 Labs',
      required: true,
    },
    { name: 'tagline', type: 'text' },
    { name: 'overview', type: 'textarea' },
    { name: 'founder', type: 'textarea', label: 'Founder' },
    { name: 'mission', type: 'textarea' },
    { name: 'approach', type: 'textarea' },
    {
      name: 'capabilities',
      type: 'array',
      fields: [{ name: 'item', type: 'text', required: true }],
    },
    { name: 'contactEmail', type: 'email' },
    { name: 'schedulingUrl', type: 'text', label: 'Scheduling link' },
    { name: 'schedulingLabel', type: 'text', defaultValue: 'Schedule a conversation' },
  ],
}
