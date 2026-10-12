import type { InquiryType } from '@/forms/inquiry'

export const INQUIRY_CONTEXTS = [
  { token: 'websites-and-business-tools', label: 'Custom websites and business tools', inquiryType: 'project' },
  { token: 'automation-and-integrations', label: 'Business automation and integrations', inquiryType: 'services' },
  { token: 'ai-setup-and-workflows', label: 'AI setup and reusable workflows', inquiryType: 'services' },
  { token: 'connected-websites', label: 'Connected Website Platform', inquiryType: 'software' },
  { token: 'client-brand-studio', label: 'Client Brand Studio', inquiryType: 'software' },
] as const satisfies readonly { token: string; label: string; inquiryType: InquiryType }[]

export type InquiryContext = (typeof INQUIRY_CONTEXTS)[number]
export type InquiryContextToken = InquiryContext['token']

// Next supplies arrays for repeated query parameters. A repeated or unknown
// value is never an instruction to select an interest.
export function parseInquiryContext(value: string | string[] | undefined): InquiryContext | null {
  if (typeof value !== 'string') return null
  return INQUIRY_CONTEXTS.find((context) => context.token === value) || null
}

export function inquiryContextHref(token: InquiryContextToken): string {
  return '/contact?context=' + encodeURIComponent(token) + '#contact-form'
}

// Only call after validateInquiry has accepted the token and category pair.
// The visitor's message stays untouched in the form and is preserved here.
export function inquiryMessageWithContext(message: string, token?: InquiryContextToken): string {
  const context = parseInquiryContext(token)
  return context ? 'Selected interest: ' + context.label + '\n\n' + message : message
}
