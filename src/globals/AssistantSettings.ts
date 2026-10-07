import type { GlobalConfig } from 'payload'

export const AssistantSettings: GlobalConfig = {
  slug: 'assistant-settings',
  label: 'Assistant settings',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Settings',
    description:
      'Visitor chatbot settings. Environment variables override the model and the enabled switch.',
  },
  fields: [
    { name: 'enabled', type: 'checkbox', defaultValue: true },
    {
      name: 'welcomeMessage',
      type: 'textarea',
      defaultValue: 'Ask about CX83 Labs services, projects, or how to start a conversation.',
    },
    {
      name: 'extraGuidance',
      type: 'textarea',
      admin: {
        description: 'Additional instructions for the visitor assistant. Do not put secrets here.',
      },
    },
    {
      name: 'model',
      type: 'text',
      admin: {
        description: 'Used when OPENAI_MODEL is not set. The default is an inexpensive OpenAI model.',
      },
    },
    {
      name: 'maxOutputTokens',
      type: 'number',
      defaultValue: 800,
      min: 100,
      max: 4000,
    },
  ],
}
