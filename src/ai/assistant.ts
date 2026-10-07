import { loadCaseStudies, loadProjects, loadServices, loadSiteCopy } from '@/content/load'
import { getPayloadClient } from '@/lib/payload'

const defaultModel = 'gpt-6-luna'
const defaultMaxOutputTokens = 800

export type AssistantRuntimeConfig = {
  enabled: boolean
  provider: string
  model: string
  maxOutputTokens: number
  configured: boolean
  mock: boolean
  extraGuidance: string
}

export async function getAssistantRuntimeConfig(): Promise<AssistantRuntimeConfig> {
  const provider = process.env.AI_PROVIDER?.trim() || 'openai'
  const envModel = process.env.OPENAI_MODEL?.trim()
  const envMax = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS)
  let model = envModel || defaultModel
  let maxOutputTokens = Number.isFinite(envMax) && envMax > 0 ? envMax : defaultMaxOutputTokens
  let extraGuidance = ''
  let enabled = process.env.CHATBOT_ENABLED !== 'false'

  const payload = await getPayloadClient()
  if (payload) {
    const settings = await payload.findGlobal({ slug: 'assistant-settings' })
    if (typeof settings.enabled === 'boolean' && process.env.CHATBOT_ENABLED == null) {
      enabled = settings.enabled
    }
    if (!envModel && settings.model) model = settings.model
    if (!process.env.OPENAI_MAX_OUTPUT_TOKENS && settings.maxOutputTokens) {
      maxOutputTokens = settings.maxOutputTokens
    }
    extraGuidance = settings.extraGuidance || ''
  }

  const configured = provider === 'openai' && Boolean(process.env.OPENAI_API_KEY?.trim())

  return {
    enabled,
    provider,
    model,
    maxOutputTokens: Math.min(Math.max(maxOutputTokens, 100), 4000),
    configured,
    mock: !configured,
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
    'You are the CX83 Labs website assistant.',
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
