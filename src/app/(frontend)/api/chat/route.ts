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

  if (!config.configured || config.provider !== 'openai') {
    const reason =
      config.provider !== 'openai'
        ? `The configured provider is ${config.provider}, and only OpenAI is connected in this version.`
        : 'OPENAI_API_KEY is not set.'

    return mockResponse(
      `Mock response. ${reason} This is not a live OpenAI reply. The assistant can still explain that CX83 Labs focuses on AI systems, automation, software, and business integration, and that a real inquiry belongs on the contact form.`,
    )
  }

  try {
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
    console.error('CX83 assistant request failed.', message.replace(/sk-[A-Za-z0-9_-]+/g, '[redacted]'))
    return mockResponse(
      'Mock response. The live assistant request failed, so this is not an OpenAI reply. Please use the contact form.',
    )
  }
}
