import { allowCatAttempt, PublicRequestError, publicFailure, readPublicJSON } from '@/ai/publicRequest'
import { ensureCatReportForm, saveCatReport, validateCatReport, pruneExpiredCatSubmissions, CAT_REPORT_FORM } from '@/ai/catSubmissions'
import { getAssistantRuntimeConfig } from '@/ai/assistant'
import { withInquiryLock } from '@/forms/inquiryOutbox'
import { getPayloadClient } from '@/lib/payload'
import { catDiagnosticCounters } from '@/ai/catDiagnostics'

export const runtime = 'nodejs'
export async function POST(req: Request) {
  try {
    const body = await readPublicJSON(req, 14_000)
    const input = validateCatReport(body)
    if (!allowCatAttempt(req, 'report')) throw new PublicRequestError(429, 'Too many reports. Please try again later.')
    const payload = await getPayloadClient()
    if (!payload) throw new PublicRequestError(503, 'The report could not be saved. Please try again later.')
    const config = await getAssistantRuntimeConfig()
    return await withInquiryLock('report:' + input.requestId, async () => {
      const form = await withInquiryLock('cat-report-form', () => ensureCatReportForm(payload))
      const { duplicate } = await saveCatReport(payload, form, input, { provider: config.provider, model: config.model })
      return Response.json({ saved: true, duplicate, message: 'Your report was saved for the CX83 owner to review.' }, { status: duplicate ? 200 : 201, headers: { 'Cache-Control': 'no-store' } })
    })
  } catch (error) { return publicFailure(error) }
}

export async function GET(req: Request) {
  try {
    const payload = await getPayloadClient()
    if (!payload) return Response.json({ error: 'Not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    const { user } = await payload.auth({ headers: req.headers })
    if (!user || user.collection !== 'users') return Response.json({ error: 'Not found.' }, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    await pruneExpiredCatSubmissions(payload, true)
    const forms = await payload.find({ collection: 'forms', user, overrideAccess: false, depth: 0, limit: 1, where: { title: { equals: CAT_REPORT_FORM } } })
    if (!forms.docs[0]) return Response.json({ reports: [] }, { headers: { 'Cache-Control': 'no-store' } })
    const records = await payload.find({ collection: 'form-submissions', user, overrideAccess: false, depth: 0, limit: 50, sort: '-createdAt', where: { form: { equals: forms.docs[0].id } } })
    return Response.json({ reports: records.docs, diagnostics: catDiagnosticCounters() }, { headers: { 'Cache-Control': 'no-store' } })
  } catch { return Response.json({ error: 'Reports are temporarily unavailable.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } }) }
}
