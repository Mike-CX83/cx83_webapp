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
  CX83_INQUIRY_TO: 'hello@cx83labs.com',
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

  it('uses the verified public hello alias with existing Google Workspace OAuth identity', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'synthetic-access' }))
      .mockResolvedValueOnce(Response.json({ id: 'synthetic-gmail-accepted-id' }))
    const result = await sendInquiryEmail(data, 18, env, send as unknown as typeof fetch)
    expect(result).toEqual({ state: 'accepted', providerId: 'synthetic-gmail-accepted-id' })
    expect(send).toHaveBeenCalledTimes(2)
    expect(String(send.mock.calls[0][0])).toContain('oauth2.googleapis.com')
    expect(String(send.mock.calls[1][0])).toContain('users/me/messages/send')
    const request = JSON.parse(send.mock.calls[1][1].body)
    const decoded = Buffer.from(request.raw, 'base64url').toString('utf8')
    expect(decoded).toContain('To: hello@cx83labs.com')
    expect(decoded).toContain('From: CX83 Labs <hello@cx83labs.com>')
    expect(decoded).toContain('Synthetic test only')
    expect(decoded).not.toContain('synthetic-secret')
  })

  it('rejects a Google Workspace principal that lacks send permission', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'synthetic-wrong-user' }))
      .mockResolvedValueOnce(new Response('Forbidden', { status: 403 }))
    expect(await sendInquiryEmail(data, 20, env, send as unknown as typeof fetch)).toEqual({
      state: 'failed', reason: 'Google Workspace rejected the message.',
    })
    expect(send).toHaveBeenCalledTimes(2)
    expect(String(send.mock.calls[1][0])).toContain('users/me/messages/send')
  })

  it('marks ambiguous Google server responses as unconfirmed, never accepted', async () => {
    const send = vi.fn()
      .mockResolvedValueOnce(Response.json({ access_token: 'synthetic-access' }))
      .mockResolvedValueOnce(new Response('Transient server error', { status: 503 }))
    expect(await sendInquiryEmail(data, 21, env, send as unknown as typeof fetch)).toEqual({
      state: 'failed',
      reason: 'Delivery result could not be confirmed; check Sent before retrying.',
    })
  })

  it('does not claim acceptance when the provider rejects', async () => {
    const send = vi.fn().mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }))
    expect(await sendInquiryEmail(data, 19, env, send as unknown as typeof fetch))
      .toEqual({ state: 'failed', reason: 'Google Workspace authorization failed.' })
  })
})
