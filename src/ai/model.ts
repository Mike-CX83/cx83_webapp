import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

import type { AssistantRuntimeConfig } from './assistant'

/**
 * OpenAI is the first provider. Another hosted provider or a future CX83
 * inference service should be added here. The chat interface stays the same.
 */
export function getLanguageModel(config: AssistantRuntimeConfig): LanguageModel {
  if (config.provider !== 'openai') {
    throw new Error(
      `AI provider "${config.provider}" is not implemented. Add it in src/ai/model.ts.`,
    )
  }

  const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  return openai(config.model)
}
