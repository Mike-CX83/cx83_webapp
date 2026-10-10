import { loadCaseStudies, loadProjects, loadServices, loadSiteCopy } from '@/content/load'
import { getPayloadClient } from '@/lib/payload'
import { softwareProducts } from '@/content/softwareCatalog'

const defaultOpenAIModel = 'gpt-6-luna'
const defaultGoogleModel = 'gemini-3.5-flash-lite'
const defaultOpenRouterModel = 'openrouter/free'
const defaultMaxOutputTokens = 800

export type AssistantProvider = 'google' | 'openai' | 'openrouter'

export type AssistantRuntimeConfig = {
  enabled: boolean
  provider: AssistantProvider | null
  model: string
  maxOutputTokens: number
  configured: boolean
  configurationError: string | null
  extraGuidance: string
}

function missingKeyError(provider: AssistantProvider, keyName: string): string {
  return `AI_PROVIDER is ${provider}, but ${keyName} is not set. No other provider was used as a fallback.`
}

export async function getAssistantRuntimeConfig(): Promise<AssistantRuntimeConfig> {
  const requested = process.env.AI_PROVIDER?.trim() ?? ''
  const provider: AssistantProvider | null =
    requested === 'google' || requested === 'openai' || requested === 'openrouter' ? requested : null
  const envMax = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS)
  let model = ''
  let maxOutputTokens = Number.isFinite(envMax) && envMax > 0 ? envMax : defaultMaxOutputTokens
  let extraGuidance = ''
  let enabled = process.env.CHATBOT_ENABLED !== 'false'
  let configurationError: string | null = null

  if (provider == null) {
    configurationError = requested
      ? `AI_PROVIDER is "${requested}". Set it to openrouter, google, or openai. No other provider was used.`
      : 'AI_PROVIDER is not set. Set it to openrouter, google, or openai.'
  } else if (provider === 'google') {
    model = process.env.GOOGLE_MODEL?.trim() || defaultGoogleModel
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
      configurationError = missingKeyError('google', 'GOOGLE_GENERATIVE_AI_API_KEY')
    }
  } else if (provider === 'openai') {
    model = process.env.OPENAI_MODEL?.trim() || defaultOpenAIModel
    if (!process.env.OPENAI_API_KEY?.trim()) {
      configurationError = missingKeyError('openai', 'OPENAI_API_KEY')
    }
  } else {
    model = process.env.OPENROUTER_MODEL?.trim() || defaultOpenRouterModel
    if (!process.env.OPENROUTER_API_KEY?.trim()) {
      configurationError = missingKeyError('openrouter', 'OPENROUTER_API_KEY')
    }
  }

  const payload = await getPayloadClient()
  if (payload) {
    const settings = await payload.findGlobal({ slug: 'assistant-settings' })
    if (typeof settings.enabled === 'boolean' && process.env.CHATBOT_ENABLED == null) {
      enabled = settings.enabled
    }
    if (provider === 'openai' && !process.env.OPENAI_MODEL?.trim() && settings.model) {
      model = settings.model
    }
    if (!process.env.OPENAI_MAX_OUTPUT_TOKENS && settings.maxOutputTokens) {
      maxOutputTokens = settings.maxOutputTokens
    }
    extraGuidance = settings.extraGuidance || ''
  }

  return {
    enabled,
    provider,
    model,
    maxOutputTokens: Math.min(Math.max(maxOutputTokens, 100), 4000),
    configured: configurationError == null,
    configurationError,
    extraGuidance,
  }
}

export async function buildApprovedKnowledge(): Promise<string> {
  const [site, services, projects, caseStudies] = await Promise.all([
    loadSiteCopy(),
    loadServices(),
    loadProjects(),
    loadCaseStudies(),
  ])

  const lines = [
    `Site name: ${site.copy.siteName}`,
    `Positioning: ${site.copy.tagline}`,
    `Overview: ${site.copy.overview}`,
    `Founder: ${site.copy.founder}`,
    `Mission: ${site.copy.mission}`,
    `Approach: ${site.copy.approach}`,
    `Capabilities: ${site.copy.capabilities.join(', ')}`,
    site.copy.contactEmail ? `Contact email: ${site.copy.contactEmail}` : 'Contact email: not published yet.',
    site.copy.schedulingUrl
      ? `Scheduling: ${site.copy.schedulingLabel} at ${site.copy.schedulingUrl}`
      : 'Scheduling: a scheduling link has not been published yet. Direct visitors to the contact form.',
    '',
    'Brand: CX83 Labs stands for Catalyst X83. Catalyst means meaningful, practical change. Our founder is Mike Hankins, whose nursing and hospice operations background informed the company founded in 2025.',
    'CAT is the CX83 Labs public visitor assistant. CAT can only explain approved public information; it cannot administer, edit, deploy, bill or access customer records. The owner AI is separate and works only through authorized owner tools.',
    'Public routes: / (website demonstration), /about (founder and mission), /services (scoped work), /software (products being developed), /work (published projects and case studies only), /contact (business inquiry form). Link to the matching route in answers.',
    'Ownership philosophy: CX83 is working toward customer-controlled and supported self-hosted software; licensing, supported hosting, updates and third-party usage costs are not yet approved for customer releases. Do not promise a free or perpetual license.',
    '',
    'Software products, all currently in development and not released for download, trial or purchase:',
    ...softwareProducts.map((product) => '- ' + product.name + ' (' + product.releaseStatus + ', /software/' + product.slug + '): ' + product.shortDescription + ' ' + product.overview + ' Setup: ' + product.setup),
    '',
    'Services:',
    ...services.items.map(
      (service) =>
        `- ${service.name}: ${service.shortDescription} ${service.description} Capabilities: ${service.capabilities.join(', ')}`,
    ),
    '',
    projects.items.length
      ? `Projects:\n${projects.items
          .map(
            (project) =>
              `- ${project.title} (${project.status || 'status not set'}): ${project.summary} ${project.description} Technology: ${project.technologies.join(', ')}`,
          )
          .join('\n')}`
      : 'Projects: none published.',
    '',
    caseStudies.items.length
      ? `Case studies:\n${caseStudies.items
          .map(
            (study) =>
              `- ${study.title}: ${study.summary} Problem: ${study.problem || 'not published'} Outcome: ${study.outcome || 'not published'}`,
          )
          .join('\n')}`
      : 'Case studies: none published.',
    '',
    'How to start: use the contact form at /contact. Ask a short clarifying question before recommending a next step.',
    `Content source for this request: ${site.source === 'payload' ? 'Payload' : 'development fallback because PostgreSQL is not connected'}.`,
  ]

  return lines.join('\n')
}

export function buildSystemPrompt(knowledge: string, extraGuidance: string): string {
  return [
    'You are CAT, the Catalyst X83 (CX83 Labs) public AI assistant.',
    'You are strictly a visitor guide. You cannot access owner agents, administration, deployments, customer inquiries, secrets, accounts or nonpublic materials. Never imply you can modify this website.',
    'Explain the difference between owner-authorized software changes and visitor-facing assistance when relevant.',
    'Explain current product release status explicitly: products in development are not available for purchase or customer installation.',
    'Use concise, accurate, friendly language and Markdown links to the appropriate public routes.',
    'Help a visitor understand CX83 Labs, think through a business problem, and decide whether a conversation makes sense.',
    'Use only the approved knowledge below and what the visitor tells you.',
    'Do not invent prices, guarantees, deadlines, client results, testimonials, certifications, contracts, or legal commitments.',
    'Do not claim a capability that is not in the approved knowledge.',
    'If you do not know, say so and point the visitor to the contact form.',
    'Ask one simple clarifying question when it would help.',
    'Suggest a practical next step. Encourage a consultation when it fits, without pressure.',
    extraGuidance.trim() ? `Owner guidance: ${extraGuidance.trim()}` : '',
    '',
    'Approved CX83 knowledge:',
    knowledge,
  ]
    .filter(Boolean)
    .join('\n')
}
