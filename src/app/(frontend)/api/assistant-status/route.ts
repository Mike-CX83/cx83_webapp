import { getAssistantRuntimeConfig } from '@/ai/assistant'

export async function GET() {
  const config = await getAssistantRuntimeConfig()

  return Response.json({
    enabled: config.enabled,
    provider: config.provider,
    model: config.model,
    configured: config.configured,
    mock: config.mock,
  })
}
