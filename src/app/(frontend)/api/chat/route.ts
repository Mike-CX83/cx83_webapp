import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText, type UIMessage } from 'ai'

import { buildApprovedKnowledge, buildSystemPrompt, getAssistantRuntimeConfig } from '@/ai/assistant'
import { getLanguageModel } from '@/ai/model'

const historyLimit = 12

function mockResponse(text: string) {
  const stream = createUIMessageStream({
    execute({ writer }) {
      const id = 'mock'
      writer.write({ type: 'start' })
      writer.write({ type: 'start-step' })
      writer.write({ type: 'text-start', id })
      writer.write({ type: 'text-delta', id, delta: text })
      writer.write({ type: 'text-end', id })
      writer.write({ type: 'finish-step' })
      writer.write({ type: 'finish', finishReason: 'stop' })
    },
  })

  return createUIMessageStreamResponse({ stream })
}

export async function POST(req: Request) {
  const config = await getAssistantRuntimeConfig()

  if (!config.enabled) {
    return mockResponse('Mock response. The CX83 assistant is turned off. This is not a live model reply.')
  }

  let body: { messages?: UIMessage[] } = {}
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'The chat request was not valid JSON.' }, { status: 400 })
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-historyLimit) : []

  if (config.configurationError) {
    return Response.json({ error: config.configurationError }, { status: 503 })
  }

  try {
    // Public site knowledge and the visitor's chat messages only. Form submissions stay out of this request.
    const knowledge = await buildApprovedKnowledge()
    const result = streamText({
      model: getLanguageModel(config),
      system: buildSystemPrompt(knowledge, config.extraGuidance),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: config.maxOutputTokens,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(
      'CX83 assistant request failed.',
      message.replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]').replace(/AIza[0-9A-Za-z_-]{10,}/g, '[redacted]'),
    )
    return Response.json(
      { error: 'The assistant request failed before a reply started. The selected provider was not changed.' },
      { status: 502 },
    )
  }
}
