import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { Payload } from 'payload'
import { getPayloadClient } from '@/lib/payload'
import { POST as postReport, GET as getReports } from '@/app/(frontend)/api/cat-reports/route'
import { POST as postPlan } from '@/app/(frontend)/api/cat-plans/route'
import { fieldValue } from '@/forms/inquiryOutbox'
import { gmailDeliveryConfigured } from '@/forms/inquiryMailer'

function isolatedCI(): boolean {
  if (!process.env.CI) return false
  try { const u = new URL(process.env.DATABASE_URL || ''); return ['localhost', '127.0.0.1'].includes(u.hostname) && u.pathname === '/cx83_webapp_ci' }
  catch { return false }
}
const createdIds: number[] = []
let payload: Payload
const request = (body: unknown) => new Request('http://localhost:3000/api/cat-reports', { method: 'POST', headers: { 'content-type': 'application/json', 'x-real-ip': 'synthetic-ci-' + randomUUID() }, body: JSON.stringify(body) })
async function stored(id: string) {
  const records = await payload.find({ collection: 'form-submissions', overrideAccess: true, depth: 0, limit: 10, where: { 'submissionData.value': { equals: id } } })
  return records.docs.filter((row) => fieldValue(row, 'cx83-request-id') === id)
}

describe.skipIf(!isolatedCI())('real Cat storage in the guarded CI PostgreSQL database', () => {
  beforeAll(async () => {
    expect(gmailDeliveryConfigured()).toBe(false)
    const client = await getPayloadClient(); expect(client).toBeTruthy(); payload = client!
  }, 60_000)
  afterAll(async () => {
    for (const id of createdIds) await payload.delete({ collection: 'form-submissions', id, overrideAccess: true })
  })
  it('stores a consented minimized report and correctly deduplicates an actual SQL retry', async () => {
    const id = randomUUID()
    const input = { requestId: id, confirmed: true, details: 'SYNTHETIC CI REPORT, no visitor data', includeExchange: true, question: 'Reach synthetic@example.invalid', answer: 'Use /contact' }
    const first = await postReport(request(input)); expect(first.status).toBe(201)
    const rows = await stored(id); createdIds.push(...rows.map((r) => r.id))
    expect(rows).toHaveLength(1)
    expect(fieldValue(rows[0], 'cx83-source')).toBe('cat-report')
    expect(fieldValue(rows[0], 'question')).toBe('Reach [email removed]')
    expect(fieldValue(rows[0], 'cx83-expires-at')).toBeTruthy()
    expect((await postReport(request(input))).status).toBe(200)
    expect(await stored(id)).toHaveLength(1)
    expect((await postReport(request({ ...input, details: 'changed content' }))).status).toBe(409)
  }, 60_000)
  it('stores a confirmed plan in the actual existing inquiry outbox with optional contact omitted', async () => {
    const id = randomUUID()
    const input = { requestId: id, confirmed: true, plan: 'SYNTHETIC CI PLAN: organize test intake with email and spreadsheets. Require owner approval. No real project commitment.' }
    const first = await postPlan(request(input)); expect(first.status).toBe(201)
    expect(await first.json()).toMatchObject({ saved: true, notification: 'needs-configuration' })
    const rows = await stored(id); createdIds.push(...rows.map((r) => r.id))
    expect(rows).toHaveLength(1)
    expect(fieldValue(rows[0], 'cx83-source')).toBe('cat-plan')
    expect(fieldValue(rows[0], 'email')).toBe('')
    expect(fieldValue(rows[0], 'cx83-delivery-status')).toBe('unconfigured')
    expect(fieldValue(rows[0], 'message')).toContain('not CX83 commitments')
    expect((await postPlan(request(input))).status).toBe(200)
    expect(await stored(id)).toHaveLength(1)
  }, 60_000)
  it('denies real anonymous collection reads and diagnostic review', async () => {
    const anonymous = await payload.find({ collection: 'form-submissions', overrideAccess: false, depth: 0, limit: 1 }).catch(() => null)
    expect(anonymous === null || anonymous.docs.length === 0).toBe(true)
    expect((await getReports(new Request('http://localhost:3000/api/cat-reports'))).status).toBe(404)
  })
  it('denies generic anonymous creates for the protected report form', async () => {
    const forms = await payload.find({ collection: 'forms', overrideAccess: true, where: { title: { equals: 'Cat problem reports' } }, limit: 1 })
    expect(forms.docs[0]).toBeTruthy()
    await expect(payload.create({ collection: 'form-submissions', overrideAccess: false, data: { form: forms.docs[0].id, submissionData: [{ field: 'details', value: 'unconfirmed direct create' }] } })).rejects.toThrow()
  })
  it('hides expired report content through actual Payload read hooks', async () => {
    const forms = await payload.find({ collection: 'forms', overrideAccess: true, where: { title: { equals: 'Cat problem reports' } }, limit: 1 })
    const row = await payload.create({ collection: 'form-submissions', overrideAccess: true, data: { form: forms.docs[0].id, submissionData: [
      { field: 'cx83-source', value: 'cat-report' }, { field: 'cx83-expires-at', value: '2000-01-01T00:00:00.000Z' }, { field: 'answer', value: 'EXPIRED SYNTHETIC CONTENT' },
    ] } })
    createdIds.push(row.id)
    const result = await payload.findByID({ collection: 'form-submissions', id: row.id, overrideAccess: true })
    expect(JSON.stringify(result)).not.toContain('EXPIRED SYNTHETIC CONTENT')
  })
})
