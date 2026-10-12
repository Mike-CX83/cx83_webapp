import { randomUUID } from 'node:crypto'
import type { Payload, PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/payload', () => ({ getPayloadClient: vi.fn() }))
vi.mock('@/forms/ensure-inquiry-form', () => ({ ensureInquiryForm: async () => 77, confirmationMessage: { root: { type: 'root' } } }))
vi.mock('@/ai/assistant', () => ({ getAssistantRuntimeConfig: async () => ({ provider: 'openrouter', model: 'existing-model' }) }))
vi.mock('@/forms/inquiryMailer', () => ({ gmailDeliveryConfigured: () => false, sendInquiryEmail: vi.fn() }))
import { POST as report, GET as review } from '@/app/(frontend)/api/cat-reports/route'
import { POST as plan, validateCatPlan } from '@/app/(frontend)/api/cat-plans/route'
import { validateCatReport, protectCatSubmissionCreate, expireCatSubmissionRead, pruneExpiredCatSubmissions } from '@/ai/catSubmissions'
import { minimizeDiagnosticText } from '@/ai/catPrivacy'
import { getPayloadClient } from '@/lib/payload'
import { fieldValue } from '@/forms/inquiryOutbox'

type Row = { id: number; form: number; createdAt: string; submissionData: { field: string; value: string }[] }
let rows: Row[]
let payload: Payload
let user: { id: number; collection: 'users' } | null
beforeEach(() => {
  vi.clearAllMocks(); rows = []; user = null
  payload = {
    auth: vi.fn(async () => ({ user })),
    find: vi.fn(async (options) => {
      if (options.collection === 'forms') return { docs: [{ id: 88, title: 'Cat problem reports' }] }
      return { docs: rows, hasNextPage: false }
    }),
    create: vi.fn(async ({ data }) => {
      const row = { ...data, id: rows.length + 1, createdAt: new Date().toISOString() }
      rows.push(row); return row
    }),
    findByID: vi.fn(async ({ collection, id }) => collection === 'forms' ? { id, title: 'Cat problem reports' } : rows.find((r) => r.id === id)),
    update: vi.fn(async ({ id, data }) => {
      const idx = rows.findIndex((r) => r.id === id); rows[idx] = { ...rows[idx], ...data }; return rows[idx]
    }),
    delete: vi.fn(async ({ id }) => { const row = rows.find((r) => r.id === id); rows = rows.filter((r) => r.id !== id); return row }),
  } as unknown as Payload
  vi.mocked(getPayloadClient).mockResolvedValue(payload)
})
const req = (body: unknown) => new Request('https://cx83labs.com/api/cat-reports', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': randomUUID() }, body: JSON.stringify(body) })
const baseReport = () => ({ confirmed: true, details: 'Incorrect answer', includeExchange: false, requestId: randomUUID() })
const basePlan = () => ({ confirmed: true, plan: 'Goal: reduce manual intake. Tools: Gmail and Sheets. Need approval before sending messages.', requestId: randomUUID() })

describe('Cat consent, report privacy and authorized review', () => {
  it('saves an anonymous note without unconsented exchange or contact data', async () => {
    const r = await report(req({ ...baseReport(), question: 'private discarded', answer: 'private discarded', email: 'discarded@example.invalid' }))
    expect(r.status).toBe(201); expect(await r.json()).toMatchObject({ saved: true })
    const serialized = JSON.stringify(rows)
    expect(serialized).not.toContain('private discarded'); expect(serialized).not.toContain('discarded@example.invalid')
    expect(fieldValue(rows[0], 'cx83-source')).toBe('cat-report')
    expect(fieldValue(rows[0], 'cx83-expires-at')).toBeTruthy()
  })
  it('stores only the selected consented pair and removes common identifiers', async () => {
    const r = await report(req({ ...baseReport(), includeExchange: true, question: 'Email me at synthetic@example.invalid, 918-555-0101', answer: 'Use /contact', transcript: 'Entire history discarded' }))
    expect(r.status).toBe(201)
    expect(fieldValue(rows[0], 'question')).toBe('Email me at [email removed], [phone removed]')
    expect(JSON.stringify(rows)).not.toContain('Entire history')
  })
  it.each([false, undefined, 'true', 1])('refuses report without boolean confirmation %#', async (confirmed) => {
    expect((await report(req({ ...baseReport(), confirmed }))).status).toBe(400)
    expect(payload.create).not.toHaveBeenCalled()
  })
  it('deduplicates report retries and conflicts on changed content', async () => {
    const input = baseReport()
    const results = await Promise.all([report(req(input)), report(req(input))])
    expect(results.map((r) => r.status).sort()).toEqual([200, 201]); expect(rows).toHaveLength(1)
    expect((await report(req({ ...input, details: 'changed' }))).status).toBe(409)
  })
  it('never exposes review contents to an anonymous requester', async () => {
    const r = await review(new Request('https://cx83labs.com/api/cat-reports'))
    expect(r.status).toBe(404); expect(payload.find).not.toHaveBeenCalled()
  })
  it('uses normal access checks for an authenticated reviewer', async () => {
    user = { id: 1, collection: 'users' }
    const r = await review(new Request('https://cx83labs.com/api/cat-reports'))
    expect(r.status).toBe(200)
    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({ collection: 'form-submissions', overrideAccess: false, user }))
  })
  it('blocks direct anonymous report creates through the generic Payload API', async () => {
    expect(await protectCatSubmissionCreate({ req: { payload, user: null } as unknown as PayloadRequest, data: { form: 88 } })).toBe(false)
  })
  it('leaves other public form create behavior intact', async () => {
    vi.mocked(payload.findByID).mockResolvedValueOnce({ id: 90, title: 'Other public form' } as never)
    expect(await protectCatSubmissionCreate({ req: { payload, user: null } as unknown as PayloadRequest, data: { form: 90 } })).toBe(true)
  })
  it('expires contents on read without affecting ordinary inquiry records', async () => {
    const doc = { submissionData: [{ field: 'cx83-source', value: 'cat-report' }, { field: 'cx83-expires-at', value: '2000-01-01' }, { field: 'answer', value: 'expired contents' }] }
    const result = await expireCatSubmissionRead({ doc } as never)
    expect(JSON.stringify(result)).not.toContain('expired contents')
    const normal = { submissionData: [{ field: 'message', value: 'ordinary retained inquiry' }] }
    expect(await expireCatSubmissionRead({ doc: normal } as never)).toBe(normal)
  })
  it('prunes old Cat records, preserves recent plans and all ordinary inquiries', async () => {
    const old = new Date(Date.now() - 100 * 86400_000).toISOString()
    rows = [
      { id: 1, form: 88, createdAt: old, submissionData: [{ field: 'cx83-source', value: 'cat-report' }] },
      { id: 2, form: 77, createdAt: old, submissionData: [{ field: 'cx83-source', value: 'cat-plan' }] },
      { id: 3, form: 77, createdAt: old, submissionData: [{ field: 'message', value: 'regular inquiry' }] },
      { id: 4, form: 77, createdAt: new Date().toISOString(), submissionData: [{ field: 'cx83-source', value: 'cat-plan' }] },
    ]
    expect(await pruneExpiredCatSubmissions(payload, true)).toBe(2)
    expect(rows.map((r) => r.id)).toEqual([3, 4])
  })
  it('refuses obvious credentials or sensitive identifiers', () => {
    expect(() => validateCatReport({ ...baseReport(), details: 'SSN: 123-45-6789' })).toThrow()
    expect(() => validateCatPlan({ ...basePlan(), plan: 'password: syntheticSecret123' })).toThrow()
  })
  it('does not claim diagnostic redaction is comprehensive', () => {
    expect(minimizeDiagnosticText('My name is Synthetic Visitor')).toBe('My name is Synthetic Visitor')
  })
})

describe('confirmed project plans through the existing inquiry workflow', () => {
  it('saves a plan with optional contact omitted and stores no conversation history', async () => {
    const r = await plan(req({ ...basePlan(), transcript: 'discard entire conversation' }))
    expect(r.status).toBe(201)
    expect(await r.json()).toMatchObject({ saved: true, notification: 'needs-configuration' })
    expect(fieldValue(rows[0], 'email')).toBe(''); expect(fieldValue(rows[0], 'cx83-source')).toBe('cat-plan')
    expect(fieldValue(rows[0], 'message')).toContain('not CX83 commitments')
    expect(JSON.stringify(rows)).not.toContain('discard entire conversation')
    expect(rows[0].form).toBe(77)
  })
  it('keeps explicitly supplied contact details for the intended follow up', async () => {
    const r = await plan(req({ ...basePlan(), name: 'Synthetic Visitor', email: 'visitor@example.invalid', organization: 'Synthetic Company' }))
    expect(r.status).toBe(201)
    expect(fieldValue(rows[0], 'email')).toBe('visitor@example.invalid')
  })
  it.each([false, undefined, 'true'])('rejects unconfirmed plan %#', async (confirmed) => {
    expect((await plan(req({ ...basePlan(), confirmed }))).status).toBe(400); expect(rows).toHaveLength(0)
  })
  it.each(['tiny', 'a'.repeat(4501)])('bounds plan content %#', async (text) => expect((await plan(req({ ...basePlan(), plan: text }))).status).toBe(400))
  it('rejects malformed optional contact email', async () => expect((await plan(req({ ...basePlan(), email: 'bad' }))).status).toBe(400))
  it('preserves idempotency through retries without edits', async () => {
    const input = basePlan()
    expect((await plan(req(input))).status).toBe(201)
    expect((await plan(req(input))).status).toBe(200)
    expect(rows).toHaveLength(1)
    expect((await plan(req({ ...input, plan: input.plan + 'Changed scope' }))).status).toBe(409)
  })
  it('reports storage failure honestly and never claims a saved plan', async () => {
    vi.mocked(getPayloadClient).mockResolvedValueOnce(null)
    const r = await plan(req(basePlan()))
    expect(r.status).toBe(503); expect(await r.text()).not.toContain('"saved":true')
  })
  it('rejects cross origin submissions before storage', async () => {
    const input = basePlan()
    const r = await plan(new Request('https://cx83labs.com/api/cat-plans', { method: 'POST', headers: { 'content-type': 'application/json', origin: 'https://evil.example' }, body: JSON.stringify(input) }))
    expect(r.status).toBe(403); expect(rows).toHaveLength(0)
  })
})
