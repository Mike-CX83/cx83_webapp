import type { Payload, CollectionBeforeReadHook, Access } from 'payload'
import { createHash } from 'node:crypto'
import { PublicRequestError } from './publicRequest'
import { minimizeDiagnosticText } from './catPrivacy'
import { isSafeRequestId, fieldValue } from '@/forms/inquiryOutbox'
import { confirmationMessage } from '@/forms/ensure-inquiry-form'

export const CAT_REPORT_FORM = 'Cat problem reports'
export const REPORT_DAYS = 30
export const PLAN_DAYS = 90

type Entry = { field: string; value: string }
type Stored = { id: number; createdAt: string; submissionData?: Entry[] | null }

export function rejectSensitiveSubmission(text: string): void {
  if (/\b(?:ssn|social security|medical record number|patient name|date of birth|password|api[_ -]?key|private key)\s*[:=]|\b\d{3}-\d{2}-\d{4}\b|\bsk-[a-z0-9_-]{10,}|-----BEGIN .*PRIVATE KEY-----/i.test(text)) {
    throw new PublicRequestError(400, 'Remove sensitive personal information or credentials before submitting.')
  }
}

export function validateCatReport(body: Record<string, unknown>) {
  if (body.confirmed !== true) throw new PublicRequestError(400, 'Please confirm before sending a report.')
  if (!isSafeRequestId(body.requestId)) throw new PublicRequestError(400, 'The request identifier is invalid.')
  const details = typeof body.details === 'string' ? body.details.trim() : ''
  if (details.length > 1000) throw new PublicRequestError(400, 'Report details must be 1000 characters or fewer.')
  const includeExchange = body.includeExchange === true
  const question = includeExchange && typeof body.question === 'string' ? body.question.trim() : ''
  const answer = includeExchange && typeof body.answer === 'string' ? body.answer.trim() : ''
  if (question.length > 2000 || answer.length > 8000) throw new PublicRequestError(400, 'Please shorten the attached exchange.')
  rejectSensitiveSubmission(details + '\n' + question + '\n' + answer)
  return { requestId: body.requestId, details: minimizeDiagnosticText(details), question: minimizeDiagnosticText(question), answer: minimizeDiagnosticText(answer), includeExchange }
}

export async function ensureCatReportForm(payload: Payload): Promise<number> {
  const found = await payload.find({ collection: 'forms', overrideAccess: true, depth: 0, limit: 1, where: { title: { equals: CAT_REPORT_FORM } } })
  if (found.docs[0]) return found.docs[0].id
  const form = await payload.create({ collection: 'forms', overrideAccess: true, data: {
    title: CAT_REPORT_FORM, submitButtonLabel: 'Send report', confirmationType: 'message',
    confirmationMessage,
    // No email hook recipients. Reports are reviewed in the existing authenticated owner admin.
    fields: [{ blockType: 'textarea', name: 'details', label: 'Problem details', required: false, width: 100 }],
  } })
  return form.id
}

export async function saveCatReport(payload: Payload, form: number, input: ReturnType<typeof validateCatReport>, config: { provider: string | null; model: string }) {
  const digest = createHash('sha256').update(JSON.stringify({ ...input, requestId: undefined })).digest('hex')
  const existing = await payload.find({ collection: 'form-submissions', overrideAccess: true, depth: 0, limit: 100,
    where: { and: [{ form: { equals: form } }, { 'submissionData.field': { equals: 'cx83-request-id' } }, { 'submissionData.value': { equals: input.requestId } }] },
  })
  const old = existing.docs.find((d) => fieldValue(d, 'cx83-request-id') === input.requestId)
  if (old) {
    if (fieldValue(old, 'cx83-content-digest') !== digest) throw new PublicRequestError(409, 'This request identifier was already used for a different report.')
    return { duplicate: true }
  }
  await payload.create({ collection: 'form-submissions', overrideAccess: true, data: { form, submissionData: [
    { field: 'cx83-source', value: 'cat-report' },
    { field: 'cx83-request-id', value: input.requestId },
    { field: 'cx83-content-digest', value: digest },
    { field: 'details', value: input.details || 'Visitor flagged an unusual answer.' },
    { field: 'exchange-consent', value: String(input.includeExchange) },
    ...(input.includeExchange ? [{ field: 'question', value: input.question }, { field: 'answer', value: input.answer }] : []),
    { field: 'configuration-at-report-time', value: JSON.stringify(config) },
    { field: 'cx83-expires-at', value: new Date(Date.now() + REPORT_DAYS * 86400_000).toISOString() },
  ] } })
  return { duplicate: false }
}

// The plugin otherwise permits anonymous direct creates, bypassing custom route validation.
// Preserve public behavior for other forms; only the existing inquiry and new Cat report form are protected.
export const protectCatSubmissionCreate: Access = async ({ req, data }) => {
  if (req.user) return true
  const id = typeof data?.form === 'number' ? data.form : Number(data?.form)
  if (!Number.isInteger(id) || id <= 0) return false
  try {
    const form = await req.payload.findByID({ collection: 'forms', id, overrideAccess: true, depth: 0 })
    return form.title !== CAT_REPORT_FORM && form.title !== 'CX83 inquiry'
  } catch { return false }
}

export const expireCatSubmissionRead: CollectionBeforeReadHook = ({ doc }) => {
  const source = fieldValue(doc, 'cx83-source')
  const expires = fieldValue(doc, 'cx83-expires-at')
  if (['cat-report', 'cat-plan'].includes(source) && expires && Date.parse(expires) <= Date.now()) {
    return { ...doc, submissionData: [{ field: 'cx83-source', value: source }, { field: 'status', value: 'Expired; contents are no longer available.' }] }
  }
  return doc
}

// On-demand cleanup, invoked by Cat status and the authenticated review endpoint.
// The application does not retain a general conversation archive. Backups need their separate server retention policy.
let lastPrune = 0
export async function pruneExpiredCatSubmissions(payload: Payload, force = false): Promise<number> {
  if (!force && Date.now() - lastPrune < 3600_000) return 0
  lastPrune = Date.now()
  let removed = 0
  const expired: number[] = []
  try {
    for (let page = 1; page <= 20; page++) {
      const found = await payload.find({ collection: 'form-submissions', overrideAccess: true, depth: 0, limit: 100, page, sort: 'createdAt',
        where: { 'submissionData.field': { equals: 'cx83-expires-at' } },
      })
      for (const row of found.docs as Stored[]) {
        // beforeRead hides expired values, so identify the Cat record and use creation age as the fallback.
        const source = fieldValue(row, 'cx83-source')
        const days = source === 'cat-report' ? REPORT_DAYS : source === 'cat-plan' ? PLAN_DAYS : null
        if (days && Date.parse(row.createdAt) + days * 86400_000 <= Date.now()) {
          expired.push(row.id)
        }
      }
      if (!found.hasNextPage) break
    }
    for (const id of expired) { await payload.delete({ collection: 'form-submissions', id, overrideAccess: true }); removed++ }
    return removed
  } catch { lastPrune = 0; throw new Error('Cat retention cleanup failed; private contents were not logged.') }
}
