import { randomUUID } from 'node:crypto'
import type { Payload } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/database', () => ({ databaseConfigured: () => true }))
vi.mock('@/lib/payload', () => ({ getPayloadClient: vi.fn() }))
vi.mock('@/forms/ensure-inquiry-form', () => ({ ensureInquiryForm: async () => 77 }))
vi.mock('@/forms/inquiryMailer', () => ({
  gmailDeliveryConfigured: () => false,
  sendInquiryEmail: vi.fn(),
}))

import { POST } from '@/app/(frontend)/api/inquiries/route'
import { sendInquiryEmail } from '@/forms/inquiryMailer'
import { fieldValue } from '@/forms/inquiryOutbox'
import { getPayloadClient } from '@/lib/payload'

type StoredSubmission = {
  id: number
  form: number
  createdAt: string
  updatedAt: string
  submissionData: { field: string; value: string }[]
}

const visitorMessage = 'Please connect our intake and calendar.\nKeep this note exactly as written.'
const baseInquiry = {
  name: 'CX83 Synthetic Context Test',
  email: 'context@example.invalid',
  organization: '',
  inquiryType: 'general',
  message: visitorMessage,
}

let rows: StoredSubmission[]
let create: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.clearAllMocks()
  rows = []
  create = vi.fn(async ({ data }: { data: Pick<StoredSubmission, 'form' | 'submissionData'> }) => {
    const row = { ...data, id: rows.length + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    rows.push(row)
    return row
  })
  const payload = {
    find: vi.fn(async () => ({ docs: rows })),
    create,
    findByID: vi.fn(async ({ id }: { id: number }) => rows.find((row) => row.id === id)),
    update: vi.fn(async ({ id, data }: { id: number; data: Pick<StoredSubmission, 'submissionData'> }) => {
      const index = rows.findIndex((row) => row.id === id)
      rows[index] = { ...rows[index], ...data }
      return rows[index]
    }),
  }
  vi.mocked(getPayloadClient).mockResolvedValue(payload as unknown as Payload)
})

async function post(data: Record<string, unknown>, requestId = randomUUID()) {
  return POST(new Request('http://localhost:3000/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-real-ip': 'synthetic-context-' + randomUUID() },
    body: JSON.stringify({ ...data, requestId }),
  }))
}

describe('inquiry context API and durable storage', () => {
  const approved = [
    { token: 'websites-and-business-tools', label: 'Custom websites and business tools', inquiryType: 'project' },
    { token: 'automation-and-integrations', label: 'Business automation and integrations', inquiryType: 'services' },
    { token: 'ai-setup-and-workflows', label: 'AI setup and reusable workflows', inquiryType: 'services' },
    { token: 'connected-websites', label: 'Connected Website Platform', inquiryType: 'software' },
    { token: 'client-brand-studio', label: 'Client Brand Studio', inquiryType: 'software' },
  ] as const

  it.each(approved)('stores $token visibly without replacing the visitor message', async (context) => {
    const response = await post({ ...baseInquiry, inquiryType: context.inquiryType, context: context.token })
    expect(response.status).toBe(201)
    expect(await response.json()).toMatchObject({ saved: true, duplicate: false, notification: 'needs-configuration' })
    expect(rows).toHaveLength(1)
    expect(fieldValue(rows[0], 'message')).toBe('Selected interest: ' + context.label + '\n\n' + visitorMessage)
    expect(fieldValue(rows[0], 'inquiry-type')).toBe(context.inquiryType)
    expect(sendInquiryEmail).not.toHaveBeenCalled()
  })

  it('stores a direct general inquiry without adding context to the message', async () => {
    const response = await post(baseInquiry)
    expect(response.status).toBe(201)
    expect(fieldValue(rows[0], 'inquiry-type')).toBe('general')
    expect(fieldValue(rows[0], 'message')).toBe(visitorMessage)
  })

  const rejected: { label: string; change: Record<string, unknown>; error: string }[] = [
    { label: 'unknown context', change: { context: 'unlisted-service' }, error: 'context' },
    { label: 'empty supplied context', change: { context: '' }, error: 'context' },
    { label: 'array context', change: { context: ['connected-websites'] }, error: 'context' },
    { label: 'object context', change: { context: { token: 'connected-websites' } }, error: 'context' },
    { label: 'null context', change: { context: null }, error: 'context' },
    { label: 'numeric context', change: { context: 1 }, error: 'context' },
    { label: 'incompatible category', change: { context: 'connected-websites', inquiryType: 'project' }, error: 'context' },
    { label: 'unknown category', change: { inquiryType: 'sales' }, error: 'inquiryType' },
    { label: 'array category', change: { inquiryType: ['services'] }, error: 'inquiryType' },
    { label: 'missing category', change: { inquiryType: undefined }, error: 'inquiryType' },
  ]

  it.each(rejected)('rejects $label before accessing storage', async ({ change, error }) => {
    const response = await post({ ...baseInquiry, ...change })
    expect(response.status).toBe(400)
    expect((await response.json()).errors[error]).toBeTruthy()
    expect(getPayloadClient).not.toHaveBeenCalled()
    expect(create).not.toHaveBeenCalled()
  })

  it('deduplicates concurrent contextual retries and refuses a changed interest under the same ID', async () => {
    const id = randomUUID()
    const data = { ...baseInquiry, inquiryType: 'services', context: 'automation-and-integrations' }
    const responses = await Promise.all([post(data, id), post(data, id)])
    expect(responses.map((response) => response.status).sort()).toEqual([200, 201])
    const results = await Promise.all(responses.map((response) => response.json()))
    expect(results.map((result) => result.duplicate).sort()).toEqual([false, true])
    expect(create).toHaveBeenCalledTimes(1)
    expect(rows).toHaveLength(1)
    expect(fieldValue(rows[0], 'message')).toBe('Selected interest: Business automation and integrations\n\n' + visitorMessage)

    const changed = await post({ ...data, context: 'ai-setup-and-workflows' }, id)
    expect(changed.status).toBe(409)
    const cleared = await post({ ...baseInquiry, inquiryType: 'services' }, id)
    expect(cleared.status).toBe(409)
    expect(create).toHaveBeenCalledTimes(1)
  })
})
