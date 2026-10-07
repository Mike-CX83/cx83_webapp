import { ensureInquiryForm } from '@/forms/ensure-inquiry-form'
import { validateInquiry } from '@/forms/inquiry'
import { databaseConfigured } from '@/lib/database'
import { getPayloadClient } from '@/lib/payload'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ ok: false, error: 'The inquiry was not valid JSON.' }, { status: 400 })
  }

  const { data, errors } = validateInquiry(body)
  if (!data) {
    return Response.json({ ok: false, errors }, { status: 400 })
  }

  if (!databaseConfigured()) {
    return Response.json(
      {
        ok: false,
        error: 'The inquiry form is not connected to PostgreSQL yet, so this message was not saved.',
      },
      { status: 503 },
    )
  }

  const payload = await getPayloadClient()
  if (!payload) {
    return Response.json(
      {
        ok: false,
        error: 'PostgreSQL did not accept the connection, so this message was not saved.',
      },
      { status: 503 },
    )
  }

  const form = await ensureInquiryForm(payload)

  await payload.create({
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
      ],
    },
  })

  return Response.json({
    ok: true,
    message: 'Your inquiry was saved. It is visible to the site owner in Payload.',
  })
}
