import { createGoogle } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import type { LanguageModel } from 'ai'

import type { AssistantRuntimeConfig } from './assistant'

/**
 * Provider selection stays here. The chat interface does not change with the provider.
 * A missing key throws. This function does not choose the other provider.
 */
export function getLanguageModel(config: AssistantRuntimeConfig): LanguageModel {
  if (config.configurationError || config.provider == null) {
    throw new Error(config.configurationError ?? 'The AI provider is not configured.')
  }

  if (config.provider === 'google') {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set.')
    }

    return createGoogle({ apiKey })(config.model)
  }

  if (config.provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY?.trim()
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set.')
    }

    return createOpenAI({ apiKey })(config.model)
  }

  throw new Error(`AI provider "${config.provider}" is not supported. Set AI_PROVIDER to google or openai.`)
}
