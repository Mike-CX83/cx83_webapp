import type { Payload } from 'payload'

const confirmationMessage = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: 'The inquiry was saved.',
            version: 1,
          },
        ],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          version: 1,
        },
      ],
      direction: 'ltr' as const,
      format: '' as const,
    indent: 0,
    version: 1,
  },
}

export async function ensureInquiryForm(payload: Payload): Promise<number> {
  const existing = await payload.find({
    collection: 'forms',
    limit: 1,
    overrideAccess: true,
    where: {
      title: {
        equals: 'CX83 inquiry',
      },
    },
  })

  if (existing.docs[0]) return existing.docs[0].id

  const created = await payload.create({
    collection: 'forms',
    overrideAccess: true,
    data: {
      title: 'CX83 inquiry',
      submitButtonLabel: 'Send inquiry',
      confirmationType: 'message',
      confirmationMessage,
      fields: [
        { blockType: 'text', name: 'name', label: 'Name', required: true, width: 100 },
        { blockType: 'email', name: 'email', label: 'Email', required: true, width: 100 },
        { blockType: 'text', name: 'organization', label: 'Organization', required: false, width: 100 },
        {
          blockType: 'select',
          name: 'inquiry-type',
          label: 'Inquiry',
          required: true,
          width: 100,
          options: [
            { label: 'General contact', value: 'general' },
            { label: 'Project inquiry', value: 'project' },
            { label: 'Services and integrations', value: 'services' },
            { label: 'Software in development', value: 'software' },
          ],
        },
        { blockType: 'textarea', name: 'message', label: 'Message', required: true, width: 100 },
      ],
    },
  })

  return created.id
}
