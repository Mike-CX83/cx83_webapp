/**
 * CX83 inquiry notifications use the owner's verified Google Workspace mailbox.
 * ChatGPT's connected Gmail token is NOT a server credential. No mail is sent
 * until the website runtime has its own authorized Gmail OAuth grant.
 *
 * A Gmail API success means the provider accepted the message, not that an
 * independent recipient inbox delivery has been proven.
 */
import type { InquiryInput } from '@/forms/inquiry'

export type DeliveryResult =
  | { state: 'unconfigured' }
  | { state: 'accepted'; providerId: string }
  | { state: 'failed'; reason: string }

export const verifiedInquiryMailbox = 'mike@cx83labs.com'

export function gmailDeliveryConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(
    env.CX83_GMAIL_CLIENT_ID &&
    env.CX83_GMAIL_CLIENT_SECRET &&
    env.CX83_GMAIL_REFRESH_TOKEN &&
    env.CX83_INQUIRY_TO?.toLowerCase() === verifiedInquiryMailbox,
  )
}

function encodedMessage(data: InquiryInput, recordId: number | string): string {
  const clean = (value: string) => value.replace(/[\r\n]+/g, ' ').trim()
  const body = [
    'New CX83 Labs website inquiry',
    '',
    'Payload submission: ' + recordId,
    'Inquiry: ' + data.inquiryType,
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Organization: ' + (data.organization || 'Not provided'),
    '',
    'Message:',
    data.message,
    '',
    'Review the stored inquiry in the CX83 Payload admin before replying.',
    'This notification is not a request to expose secrets or customer records.',
  ].join('\r\n')

  return Buffer.from([
    'From: CX83 Labs <' + verifiedInquiryMailbox + '>',
    'To: ' + verifiedInquiryMailbox,
    'Subject: [CX83 website] ' + clean(data.inquiryType) + ' inquiry #' + recordId,
    'Message-ID: <cx83-inquiry-' + recordId + '@cx83labs.com>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n'), 'utf8').toString('base64url')
}

export async function sendInquiryEmail(
  data: InquiryInput,
  recordId: number | string,
  env: Record<string, string | undefined> = process.env,
  fetcher: typeof fetch = fetch,
): Promise<DeliveryResult> {
  if (!gmailDeliveryConfigured(env)) return { state: 'unconfigured' }

  try {
    const token = await fetcher('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.CX83_GMAIL_CLIENT_ID!,
        client_secret: env.CX83_GMAIL_CLIENT_SECRET!,
        refresh_token: env.CX83_GMAIL_REFRESH_TOKEN!,
        grant_type: 'refresh_token',
      }),
      signal: AbortSignal.timeout(9000),
    })
    if (!token.ok) return { state: 'failed', reason: 'Google Workspace authorization failed.' }
    const credentials = (await token.json()) as { access_token?: string }
    if (!credentials.access_token) return { state: 'failed', reason: 'Google Workspace did not issue an access token.' }

    // Address the verified mailbox explicitly. Gmail's send endpoint authorizes
    // the named userId against the OAuth subject, so gmail.send suffices.
    // Avoid users.getProfile: it requires extra restricted read scopes.
    const response = await fetcher('https://gmail.googleapis.com/gmail/v1/users/' + encodeURIComponent(verifiedInquiryMailbox) + '/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + credentials.access_token },
      body: JSON.stringify({ raw: encodedMessage(data, recordId) }),
      signal: AbortSignal.timeout(12000),
    })
    if (response.status >= 500) return { state: 'failed', reason: 'Delivery result could not be confirmed; check Sent before retrying.' }
    if (!response.ok) return { state: 'failed', reason: 'Google Workspace rejected the message.' }

    const result = (await response.json()) as { id?: string }
    if (!result.id) return { state: 'failed', reason: 'Google Workspace gave no acceptance identifier; check Sent before retrying.' }
    return { state: 'accepted', providerId: result.id }
  } catch {
    // The provider might have received the message before the network failed.
    // The outbox keeps this uncertain state for manual reconciliation, not blind retry.
    return { state: 'failed', reason: 'Delivery result could not be confirmed; check Sent before retrying.' }
  }
}
