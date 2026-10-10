import { getAssistantRuntimeConfig } from '@/ai/assistant'

export async function GET() {
  const config = await getAssistantRuntimeConfig()

  return Response.json({
    enabled: config.enabled,
    configured: config.configured,
  })
}
