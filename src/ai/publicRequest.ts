import { createHash } from 'node:crypto'

export class PublicRequestError extends Error {
  constructor(public status: number, message: string) { super(message) }
}

export function requireSameOrigin(req: Request): void {
  const origin = req.headers.get('origin')
  const allowed = new Set([new URL(req.url).origin, process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean))
  if (req.headers.get('sec-fetch-site') === 'cross-site' || (origin && !allowed.has(origin))) {
    throw new PublicRequestError(403, 'Please use the CX83 website to send this request.')
  }
}

export async function readPublicJSON(req: Request, limit: number): Promise<Record<string, unknown>> {
  requireSameOrigin(req)
  if (!req.headers.get('content-type')?.includes('application/json')) throw new PublicRequestError(415, 'Send this request as JSON.')
  if (Number(req.headers.get('content-length') || 0) > limit) throw new PublicRequestError(413, 'This request is too large.')
  const reader = req.body?.getReader()
  if (!reader) throw new PublicRequestError(400, 'This request is empty.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > limit) { await reader.cancel(); throw new PublicRequestError(413, 'This request is too large.') }
      chunks.push(value)
    }
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid object')
    return parsed as Record<string, unknown>
  } catch (error) {
    if (error instanceof PublicRequestError) throw error
    throw new PublicRequestError(400, 'This request was not valid JSON.')
  } finally { reader.releaseLock() }
}

// One web replica today. No raw IP, message or contact data is kept here.
// Keep the map bounded even when a bot supplies many different identifiers.
const attempts = new Map<string, number[]>()
export function allowCatAttempt(req: Request, scope: 'chat' | 'report' | 'plan', now = Date.now()): boolean {
  const ip = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || 'unknown'
  const key = createHash('sha256').update((process.env.PAYLOAD_SECRET || 'local') + ':' + scope + ':' + ip).digest('hex')
  const recent = (attempts.get(key) || []).filter((t) => now - t < 15 * 60_000)
  if (recent.length >= (scope === 'chat' ? 30 : 5)) return false
  if (!attempts.has(key) && attempts.size >= 2000) attempts.delete(attempts.keys().next().value!)
  attempts.set(key, [...recent, now])
  return true
}

export function publicFailure(error: unknown): Response {
  const known = error instanceof PublicRequestError
  return Response.json({ error: known ? error.message : 'Cat is temporarily unavailable. Please use the contact form.' }, {
    status: known ? error.status : 503,
    headers: { 'Cache-Control': 'no-store', ...(known && error.status === 429 ? { 'Retry-After': '900' } : {}) },
  })
}
