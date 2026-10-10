import { randomUUID } from 'node:crypto'
import { ensureInquiryForm } from '@/forms/ensure-inquiry-form'
import { validateInquiry } from '@/forms/inquiry'
import { allowInquiryAttempt, dispatchInquiry, inquiryDeliveryLabel, isSafeRequestId, saveInquiry, withInquiryLock } from '@/forms/inquiryOutbox'
import { databaseConfigured } from '@/lib/database'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return Response.json({ ok: false, error: 'Send the inquiry as JSON.' }, { status: 415 })
  }

  let body: Record<string, unknown>
  try {
    if (Number(req.headers.get('content-length') || 0) > 12_000) {
      return Response.json({ ok: false, error: 'The inquiry is too large.' }, { status: 413 })
    }
    const text = await req.text()
    if (text.length > 12_000) return Response.json({ ok: false, error: 'The inquiry is too large.' }, { status: 413 })
    const parsed: unknown = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid object')
    body = parsed as Record<string, unknown>
  } catch {
    return Response.json({ ok: false, error: 'The inquiry was not valid JSON.' }, { status: 400 })
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return Response.json({ ok: false, error: 'The inquiry could not be processed.' }, { status: 400 })
  }

  const { data, errors } = validateInquiry(body)
  if (!data) return Response.json({ ok: false, errors }, { status: 400 })

  const id = body.requestId === undefined ? randomUUID() : body.requestId
  if (!isSafeRequestId(id)) {
    return Response.json({ ok: false, error: 'The request identifier is invalid.' }, { status: 400 })
  }

  const ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  if (!allowInquiryAttempt(ip)) {
    return Response.json({ ok: false, error: 'Too many inquiries. Please try again later.' }, { status: 429, headers: { 'Retry-After': '900' } })
  }

  if (!databaseConfigured()) {
    return Response.json({ ok: false, error: 'The inquiry system is unavailable. Your message was not saved.' }, { status: 503 })
  }
  const payload = await getPayloadClient()
  if (!payload) {
    return Response.json({ ok: false, error: 'The inquiry system is unavailable. Your message was not saved.' }, { status: 503 })
  }

  try {
    return await withInquiryLock(id, async () => {
      const form = await ensureInquiryForm(payload)
      const { submission, duplicate, conflict } = await saveInquiry(payload, form, data, id)
      if (conflict) {
        return Response.json({ ok: false, error: 'This request identifier was already used for another inquiry.' }, { status: 409 })
      }
      // Delivery is secondary to durable storage; a mail failure cannot make a
      // successfully persisted inquiry disappear or claim inbox delivery.
      if (!duplicate) {
        try {
          await dispatchInquiry(payload, submission)
        } catch {
          console.error('CX83 inquiry saved; notification processing needs owner review.')
        }
      }
      const latest = duplicate
        ? submission
        : (await payload.findByID({ collection: 'form-submissions', id: submission.id as number, overrideAccess: true }))
      return Response.json({
        ok: true,
        saved: true,
        duplicate,
        notification: inquiryDeliveryLabel(latest),
        message: 'Your inquiry was saved in the CX83 system. Thank you for reaching out.',
      }, { status: duplicate ? 200 : 201 })
    })
  } catch {
    console.error('CX83 inquiry could not be persisted; no customer details logged.')
    return Response.json({ ok: false, error: 'The inquiry could not be saved. Please try again or contact us by email.' }, { status: 503 })
  }
}
