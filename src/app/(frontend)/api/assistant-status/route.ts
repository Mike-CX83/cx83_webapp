import { getAssistantRuntimeConfig } from '@/ai/assistant'
import { getPayloadClient } from '@/lib/payload'
import { pruneExpiredCatSubmissions } from '@/ai/catSubmissions'

export async function GET() {
  try {
    const config = await getAssistantRuntimeConfig()
    const payload = await getPayloadClient()
    if (payload) await pruneExpiredCatSubmissions(payload).catch(() => console.error('CX83 Cat retention needs owner review.'))
    return Response.json({ enabled: config.enabled, configured: config.configured }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json({ enabled: false, configured: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }
}
