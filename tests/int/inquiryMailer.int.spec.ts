import { describe, expect, it, vi } from 'vitest'
import { gmailDeliveryConfigured, sendInquiryEmail } from '@/forms/inquiryMailer'

const data = {
  name: 'Synthetic Test',
  email: 'test@example.invalid',
  organization: 'CX83 verification',
  inquiryType: 'software' as const,
  message: 'Synthetic test only. No customer records.',
}

const env = {
  CX83_INQUIRY_TO: 'mike@cx83labs.com',
  CX83_GMAIL_CLIENT_ID: 'synthetic-client',
  CX83_GMAIL_CLIENT_SECRET: 'synthetic-secret',
  CX83_GMAIL_REFRESH_TOKEN: 'synthetic-refresh',
}

describe('CX83 inquiry Gmail provider', () => {
  it('does not send with missing or unverified configuration', async () => {
    const send = vi.fn()
    expect(gmailDeliveryConfigured({ ...env, CX83_INQUIRY_TO: 'unknown@example.com' })).toBe(false)
    expect(await sendInquiryEmail(data, 1, {}, send as unknown as typeof fetch)).toEqual({ state: 'unconfigured' })
    expect(send).not.toHaveBeenCalled()
  })

  it('records provider acceptance, not assumed inbox delivery', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'synthetic-access' }))
      .mockResolvedValueOnce(Response.json({ emailAddress: 'mike@cx83labs.com' }))
      .mockResolvedValueOnce(Response.json({ id: 'synthetic-gmail-accepted-id' }))
    const result = await sendInquiryEmail(data, 18, env, send as unknown as typeof fetch)
    expect(result).toEqual({ state: 'accepted', providerId: 'synthetic-gmail-accepted-id' })
    expect(String(send.mock.calls[0][0])).toContain('oauth2.googleapis.com')
    expect(String(send.mock.calls[1][0])).toContain('/profile')
    expect(String(send.mock.calls[2][0])).toContain('/messages/send')
    const request = JSON.parse(send.mock.calls[2][1].body)
    const decoded = Buffer.from(request.raw, 'base64url').toString('utf8')
    expect(decoded).toContain('To: mike@cx83labs.com')
    expect(decoded).toContain('Synthetic test only')
    expect(decoded).not.toContain('synthetic-secret')
  })

  it('refuses to send when the OAuth grant belongs to a different mailbox', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'synthetic-access' }))
      .mockResolvedValueOnce(Response.json({ emailAddress: 'other@example.com' }))
    expect(await sendInquiryEmail(data, 20, env, send as unknown as typeof fetch)).toEqual({
      state: 'failed', reason: 'The Google Workspace sender is not the authorized CX83 mailbox.',
    })
    expect(send).toHaveBeenCalledTimes(2)
  })

  it('does not claim acceptance when the provider rejects', async () => {
    const send = vi.fn().mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
    expect(await sendInquiryEmail(data, 19, env, send as unknown as typeof fetch))
      .toEqual({ state: 'failed', reason: 'Google Workspace authorization failed.' })
  })
})
