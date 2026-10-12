import { allowCatAttempt, PublicRequestError, publicFailure, readPublicJSON } from '@/ai/publicRequest'
import { PLAN_DAYS, rejectSensitiveSubmission } from '@/ai/catSubmissions'
import { ensureInquiryForm } from '@/forms/ensure-inquiry-form'
import { dispatchInquiry, inquiryDeliveryLabel, isSafeRequestId, saveInquiry, withInquiryLock } from '@/forms/inquiryOutbox'
import { getPayloadClient } from '@/lib/payload'

export const runtime = 'nodejs'
export function validateCatPlan(body: Record<string, unknown>) {
  if (body.confirmed !== true) throw new PublicRequestError(400, 'Please review and confirm the plan before sending.')
  if (!isSafeRequestId(body.requestId)) throw new PublicRequestError(400, 'The request identifier is invalid.')
  const plan = typeof body.plan === 'string' ? body.plan.trim() : ''
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const organization = typeof body.organization === 'string' ? body.organization.trim() : ''
  if (plan.length < 20 || plan.length > 4500) throw new PublicRequestError(400, 'Provide a plan between 20 and 4500 characters.')
  if (name.length > 120 || organization.length > 160 || email.length > 200 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new PublicRequestError(400, 'Please check the optional contact details.')
  rejectSensitiveSubmission(plan + '\n' + name + '\n' + organization)
  return { requestId: body.requestId, data: {
    name: name || 'Visitor, name not provided', email, organization, inquiryType: 'project' as const, source: 'cat-plan' as const,
    message: 'Preliminary visitor project plan. Requirements and desired budget or dates are visitor preferences, not CX83 commitments.\n\n' + plan,
  } }
}
export async function POST(req: Request) {
  try {
    const input = validateCatPlan(await readPublicJSON(req, 14_000))
    if (!allowCatAttempt(req, 'plan')) throw new PublicRequestError(429, 'Too many submissions. Please try again later.')
    const payload = await getPayloadClient()
    if (!payload) throw new PublicRequestError(503, 'The project plan was not saved. Please try again later.')
    return await withInquiryLock(input.requestId, async () => {
      const form = await ensureInquiryForm(payload)
      const { submission, duplicate, conflict } = await saveInquiry(payload, form, input.data, input.requestId)
      if (conflict) throw new PublicRequestError(409, 'This request identifier was already used for a different inquiry.')
      if (!duplicate) {
        // Source and TTL are saved atomically with the plan by saveInquiry.
        try { await dispatchInquiry(payload, submission) } catch { console.error('CX83 plan saved; notification needs owner review.') }
      }
      const latest = duplicate ? submission : await payload.findByID({ collection: 'form-submissions', id: submission.id, overrideAccess: true })
      return Response.json({ saved: true, duplicate, notification: inquiryDeliveryLabel(latest), retentionDays: PLAN_DAYS, message: 'Your preliminary plan was saved for CX83 to review. Pricing, scope and timing require a separate agreement.' }, { status: duplicate ? 200 : 201, headers: { 'Cache-Control': 'no-store' } })
    })
  } catch (error) { return publicFailure(error) }
}
