import { randomUUID } from 'node:crypto'
import { createUIMessageStream, createUIMessageStreamResponse, generateText } from 'ai'
import { buildApprovedKnowledge, buildSystemPrompt, getAssistantRuntimeConfig } from '@/ai/assistant'
import { getLanguageModel } from '@/ai/model'
import { parseChatMessages } from '@/ai/chatProtocol'
import { allowCatAttempt, readPublicJSON, PublicRequestError, publicFailure } from '@/ai/publicRequest'
import { CAT_FALLBACK, contactShortcut, formatVisitorAnswer, privateInstructionShortcut } from '@/ai/visitorAnswer'
import { recordCatOutcome } from '@/ai/catDiagnostics'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await readPublicJSON(req, 64_000)
    const messages = parseChatMessages(body.messages)
    if (!allowCatAttempt(req, 'chat')) throw new PublicRequestError(429, 'Too many messages. Please try again later or use the contact form.')
    const config = await getAssistantRuntimeConfig()
    if (!config.enabled || !config.configured) throw new PublicRequestError(503, 'Cat is temporarily unavailable. Please use the contact form.')
    const last = messages.at(-1)!.content as string
    let answer = privateInstructionShortcut(last) || contactShortcut(last)
    if (!answer) {
      const knowledge = await buildApprovedKnowledge()
      const model = getLanguageModel(config)
      const system = buildSystemPrompt(knowledge, config.extraGuidance)
      const signal = AbortSignal.any([req.signal, AbortSignal.timeout(35_000)])
      // One bounded recovery for a classifier/empty/truncated result. The
      // configured provider, model and output cap stay unchanged. No rejected
      // output enters visitor history or the recovery prompt.
      for (let attempt = 0; attempt < 2; attempt++) {
        const result = await generateText({
          model,
          system: system + (attempt ? '\nRecovery: answer the visitor in one or two complete sentences. Do not output analysis or classifications. Include a useful next action.' : ''),
          messages,
          maxOutputTokens: config.maxOutputTokens,
          maxRetries: 0,
          abortSignal: signal,
        })
        const checked = formatVisitorAnswer(result.text, result.finishReason)
        recordCatOutcome({ provider: config.provider, configuredModel: config.model, responseModel: result.response.modelId, finishReason: result.finishReason, rejected: checked.rejected })
        answer = checked.text
        if (!checked.rejected) break
        if (attempt === 1) console.warn('CX83 Cat reply rejected by output validation.')
      }
    }
    const text = answer || CAT_FALLBACK
    return createUIMessageStreamResponse({
      headers: { 'Cache-Control': 'no-store' },
      stream: createUIMessageStream({
        execute({ writer }) {
          const id = randomUUID()
          writer.write({ type: 'start' })
          writer.write({ type: 'text-start', id })
          writer.write({ type: 'text-delta', id, delta: text })
          writer.write({ type: 'text-end', id })
          writer.write({ type: 'finish', finishReason: 'stop' })
        },
        onError: () => 'Cat could not complete that reply. Please retry or contact CX83.',
      }),
    })
  } catch (error) {
    if (!(error instanceof PublicRequestError)) console.error('CX83 Cat request failed; private details were not logged.')
    return publicFailure(error)
  }
}
