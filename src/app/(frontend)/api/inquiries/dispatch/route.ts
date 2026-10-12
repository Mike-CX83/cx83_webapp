/**
 * Authorized manual/recovery dispatch. Never a public visitor endpoint.
 * A standalone secret is required; no CRON_SECRET or owner MCP token reuse.
 */
import { timingSafeEqual } from 'node:crypto'
import { dispatchInquiry, fieldValue } from '@/forms/inquiryOutbox'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'

function authorized(req: Request): boolean {
  const secret = process.env.CX83_INQUIRY_DISPATCH_SECRET
  const supplied = req.headers.get('authorization')?.replace(/^Bearer /, '') || ''
  if (!secret || secret.length < 32 || supplied.length !== secret.length) return false
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(secret))
}

export async function POST(req: Request) {
  if (!authorized(req)) return Response.json({ error: 'Not found.' }, { status: 404 })

  const payload = await getPayloadClient()
  if (!payload) return Response.json({ error: 'Inquiry storage is unavailable.' }, { status: 503 })

  const recent = await payload.find({
    collection: 'form-submissions',
    overrideAccess: true,
    depth: 0,
    limit: 200,
    sort: '-createdAt',
  })
  let attempted = 0
  let accepted = 0
  let unresolved = 0
  for (const submission of recent.docs) {
    const status = fieldValue(submission, 'cx83-delivery-status')
    if (!['pending', 'unconfigured', 'failed'].includes(status)) continue
    if (!fieldValue(submission, 'cx83-request-id')) continue
    if (attempted >= 10) break
    attempted++
    try {
      const result = await dispatchInquiry(payload, submission)
      if (result === 'accepted') accepted++
      else unresolved++
    } catch {
      unresolved++
    }
  }
  return Response.json({ attempted, providerAccepted: accepted, unresolved, note: 'Provider acceptance does not prove recipient inbox delivery.' })
}
