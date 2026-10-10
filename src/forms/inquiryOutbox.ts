/**
 * Durable inquiry outbox, stored IN THE EXISTING Payload form-submission row.
 * There is no second database or schema migration. Delivery metadata and the
 * inquiry are committed together, so a saved submission can be reconciled.
 */
import { createHash } from 'node:crypto'
import type { Payload } from 'payload'
import type { FormSubmission } from '@/payload-types'
import { gmailDeliveryConfigured } from '@/forms/inquiryMailer'
import type { InquiryInput } from '@/forms/inquiry'
import { sendInquiryEmail } from '@/forms/inquiryMailer'

type StoredInquiry = FormSubmission

type Entry = { field: string; value: string }

const MAX_SCAN = 200
const attempts = new Map<string, number[]>()
const inflight = new Map<string, Promise<unknown>>()

export function fingerprintInquiry(data: InquiryInput): string {
  return createHash('sha256').update(JSON.stringify(data)).digest('hex')
}

export function isSafeRequestId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9-]{16,64}$/i.test(value)
}

export function allowInquiryAttempt(identifier: string, now = Date.now()): boolean {
  const key = createHash('sha256').update('cx83:' + (process.env.PAYLOAD_SECRET || 'local') + ':' + identifier).digest('hex')
  const recent = (attempts.get(key) || []).filter((time) => now - time < 15 * 60_000)
  if (recent.length >= 5) return false
  attempts.set(key, [...recent, now])
  if (attempts.size > 2000) {
    for (const [entry, values] of attempts) {
      if (values.every((time) => now - time > 15 * 60_000)) attempts.delete(entry)
    }
  }
  return true
}

export async function withInquiryLock<T>(requestId: string, operation: () => Promise<T>): Promise<T> {
  const previous = inflight.get(requestId)
  if (previous) await previous.catch(() => undefined)
  const current = operation()
  inflight.set(requestId, current)
  try {
    return await current
  } finally {
    if (inflight.get(requestId) === current) inflight.delete(requestId)
  }
}

export function fieldValue(submission: { submissionData?: { field: string; value?: string | null }[] | null }, key: string): string {
  return submission.submissionData?.find((entry) => entry.field === key)?.value || ''
}

function updateEntries(
  original: { submissionData?: { field: string; value?: string | null }[] | null },
  values: Record<string, string>,
): Entry[] {
  const keys = new Set(Object.keys(values))
  return [
    ...(original.submissionData || []).filter((entry) => !keys.has(entry.field)).map((entry) => ({ field: entry.field, value: entry.value || '' })),
    ...Object.entries(values).map(([field, value]) => ({ field, value })),
  ]
}

export async function saveInquiry(
  payload: Payload,
  form: number,
  data: InquiryInput,
  requestId: string,
): Promise<{ submission: StoredInquiry; duplicate: boolean; conflict: boolean }> {
  // Bounded deduplication window with a single-process lock. Staging runs
  // one web replica. Multi-replica production needs a database UNIQUE index.
  const recent = await payload.find({
    collection: 'form-submissions',
    overrideAccess: true,
    depth: 0,
    sort: '-createdAt',
    limit: MAX_SCAN,
    where: { form: { equals: form } },
  })
  const found = recent.docs.find((item) => fieldValue(item, 'cx83-request-id') === requestId)
  if (found) {
    return {
      submission: found as StoredInquiry,
      duplicate: true,
      conflict: fieldValue(found, 'cx83-content-digest') !== fingerprintInquiry(data),
    }
  }
  const submission = await payload.create({
    collection: 'form-submissions',
    overrideAccess: true,
    data: {
      form,
      submissionData: [
        { field: 'name', value: data.name },
        { field: 'email', value: data.email },
        { field: 'organization', value: data.organization },
        { field: 'inquiry-type', value: data.inquiryType },
        { field: 'message', value: data.message },
        { field: 'cx83-request-id', value: requestId },
        { field: 'cx83-content-digest', value: fingerprintInquiry(data) },
        { field: 'cx83-delivery-status', value: 'pending' },
        { field: 'cx83-delivery-attempts', value: '0' },
      ],
    },
  })
  return { submission: submission as StoredInquiry, duplicate: false, conflict: false }
}

function inputFromSubmission(submission: StoredInquiry): InquiryInput | null {
  const type = fieldValue(submission, 'inquiry-type')
  if (!['general', 'project', 'services', 'software'].includes(type)) return null
  const data: InquiryInput = {
    name: fieldValue(submission, 'name'),
    email: fieldValue(submission, 'email'),
    organization: fieldValue(submission, 'organization'),
    inquiryType: type as InquiryInput['inquiryType'],
    message: fieldValue(submission, 'message'),
  }
  return data.name && data.email && data.message ? data : null
}

export async function dispatchInquiry(
  payload: Payload,
  submission: StoredInquiry,
): Promise<'accepted' | 'unconfigured' | 'failed' | 'skipped'> {
  const status = fieldValue(submission, 'cx83-delivery-status')
  if (status === 'accepted' || status === 'sending' || status === 'uncertain') return 'skipped'
  const data = inputFromSubmission(submission)
  if (!data) return 'skipped'
  const attemptCount = Number(fieldValue(submission, 'cx83-delivery-attempts') || 0)
  if (attemptCount >= 3) return 'skipped'

  if (!gmailDeliveryConfigured()) {
    await payload.update({
      collection: 'form-submissions',
      id: submission.id,
      overrideAccess: true,
      data: { submissionData: updateEntries(submission, { 'cx83-delivery-status': 'unconfigured' }) },
    })
    return 'unconfigured'
  }

  // Persist the delivery claim before any external call. Never automatically
  // re-send a "sending" row after a crash; reconcile it against Sent first.
  const claimed = await payload.update({
    collection: 'form-submissions',
    id: submission.id,
    overrideAccess: true,
    data: { submissionData: updateEntries(submission, {
      'cx83-delivery-status': 'sending',
      'cx83-delivery-attempts': String(attemptCount + 1),
    }) },
  })
  const result = await sendInquiryEmail(data, submission.id)
  const state = result.state === 'failed' && (result.reason.includes('could not be confirmed') || result.reason.includes('no acceptance identifier'))
    ? 'uncertain'
    : result.state

  await payload.update({
    collection: 'form-submissions',
    id: submission.id as number,
    overrideAccess: true,
    data: { submissionData: updateEntries(claimed, {
      'cx83-delivery-status': state,
      'cx83-provider-id': result.state === 'accepted' ? result.providerId : '',
      'cx83-delivery-note': result.state === 'failed' ? result.reason : '',
    }) },
  })
  return result.state
}

export function inquiryDeliveryLabel(submission: StoredInquiry): string {
  const status = fieldValue(submission, 'cx83-delivery-status')
  if (status === 'accepted') return 'provider-accepted'
  if (status === 'failed') return 'delivery-failed'
  if (status === 'unconfigured') return 'needs-configuration'
  return 'queued'
}
