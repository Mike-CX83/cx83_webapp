import { inquiryContextHref, type InquiryContextToken } from '@/forms/inquiryContext'

type ServicePresentation = {
  context: InquiryContextToken
  problem: string
  linkLabel: string
  fit: string
  example: string
  exampleLabel?: string
  exampleHref?: string
  exampleSteps?: string[]
  scope: string
}

// Page-specific fit, examples and boundaries supplement the CMS-owned service
// name, summary, description, capabilities and invitation. They are not claims
// about a customer's deployment or new product availability.
export const servicePresentation: Record<string, ServicePresentation> = {
  'websites-and-business-tools': {
    context: 'websites-and-business-tools',
    problem: 'Your website is hard to manage, or the tool your team needs does not exist yet.',
    linkLabel: 'Explore websites and tools',
    fit: 'For a business that needs a clearer website, manageable content and forms, or a focused application for a specific task.',
    example: 'On CX83’s own website, an authorized owner request made through ChatGPT becomes a reviewed website change. The real demonstration shows that configured workflow. Visitor questions go to Cat, which cannot edit the site. Customer installation packaging and supported setup options are still in development.',
    exampleLabel: 'Watch the website demonstration',
    exampleHref: '/#showcase-title',
    scope: 'Agree on the pages, functions, supported connections and acceptance checks before building. The handoff explains content updates, access and everyday use. AI assistance is configured for the agreed tools and permissions.',
  },
  'automation-and-integrations': {
    context: 'automation-and-integrations',
    problem: 'The same information gets copied between tools, and follow through depends on someone remembering.',
    linkLabel: 'Explore automation',
    fit: 'For teams repeating the same handoffs between forms, records and business tools, with people still responsible for decisions.',
    example: 'An inquiry can become an organized record for a person to review before the next action. The customer process example illustrates how the steps can connect. It is an explanation, not a claim that this workflow or automatic email delivery is running for a customer.',
    exampleLabel: 'See the customer process example',
    exampleHref: '/how-it-works#customers',
    scope: 'Start with one process, its allowed data and the points that need human review. Agree on the connections, exception handling and acceptance checks. The handoff explains how to follow the process and what to do when a step needs attention.',
  },
  'ai-setup-and-workflows': {
    context: 'ai-setup-and-workflows',
    problem: 'You use AI, but getting a useful, repeatable result takes too much trial and error.',
    linkLabel: 'Explore AI setup',
    fit: 'For people who want a supported AI tool to help with a specific everyday task and a clear way to repeat what works.',
    example: 'For example, turn approved notes into a draft project brief. Use a reusable instruction, check the draft against the source, then have a person decide what to use. Your handoff includes a tested example and understandable guidance.',
    exampleSteps: ['Approved notes', 'Reusable instruction', 'Draft for human review'],
    scope: 'Choose the task and supported tool first. Configure the agreed access, reusable instructions and a test example together. Document how to repeat the work, review the result and recognize when human judgment is needed.',
  },
}

export function serviceInquiryHref(slug: string, currentUrl?: string | null): string {
  const presentation = servicePresentation[slug]
  const destination = currentUrl || '/contact'
  if (presentation && (destination === '/contact' || destination === '/contact#contact-form')) {
    return inquiryContextHref(presentation.context)
  }
  return destination
}

