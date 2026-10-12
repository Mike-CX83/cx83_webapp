import type { ModelMessage } from 'ai'
import { PublicRequestError } from './publicRequest'

export const CAT_INPUT_LIMIT = 2000
export function parseChatMessages(value: unknown): ModelMessage[] {
  if (!Array.isArray(value) || !value.length) throw new PublicRequestError(400, 'Please send a message to Cat.')
  if (value.length > 40) throw new PublicRequestError(400, 'This conversation is long. Start a new conversation to continue.')
  const parsed: ModelMessage[] = value.map((message: unknown) => {
    if (!message || typeof message !== 'object') throw new PublicRequestError(400, 'The conversation is invalid.')
    const m = message as Record<string, unknown>
    if (m.role !== 'user' && m.role !== 'assistant') throw new PublicRequestError(400, 'The conversation is invalid.')
    if (!Array.isArray(m.parts) || m.parts.length < 1 || m.parts.length > 4) throw new PublicRequestError(400, 'Please send text only.')
    const content = m.parts.map((part: unknown) => {
      if (!part || typeof part !== 'object') throw new PublicRequestError(400, 'Please send text only.')
      const p = part as Record<string, unknown>
      if (p.type !== 'text' || typeof p.text !== 'string') throw new PublicRequestError(400, 'Please send text only.')
      return p.text
    }).join('\n').trim()
    if (!content || content.length > (m.role === 'user' ? CAT_INPUT_LIMIT : 8000)) throw new PublicRequestError(400, 'Please shorten your message and try again.')
    // Rebuild the envelope. Client metadata and hidden/tool parts never enter the model request.
    return { role: m.role, content } as ModelMessage
  })
  if (parsed.at(-1)?.role !== 'user') throw new PublicRequestError(400, 'Please send a new message to Cat.')
  const recent = parsed.slice(-12)
  if (recent[0]?.role === 'assistant') recent.shift()
  return recent
}
