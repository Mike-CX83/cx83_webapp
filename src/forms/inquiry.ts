import { parseInquiryContext, type InquiryContextToken } from '@/forms/inquiryContext'

export type InquiryType = 'general' | 'project' | 'services' | 'software'

export type InquiryInput = {
  name: string
  email: string
  organization: string
  inquiryType: InquiryType
  message: string
  context?: InquiryContextToken
  source?: 'cat-plan'
}

export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const validTypes: InquiryType[] = ['general', 'project', 'services', 'software']

export function validateInquiry(value: unknown): { data?: InquiryInput; errors: InquiryErrors } {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const name = typeof source.name === 'string' ? source.name.trim() : ''
  const email = typeof source.email === 'string' ? source.email.trim() : ''
  const organization = typeof source.organization === 'string' ? source.organization.trim() : ''
  const inquiryType = source.inquiryType
  const message = typeof source.message === 'string' ? source.message.trim() : ''
  const context = typeof source.context === 'string' ? parseInquiryContext(source.context) : null
  const errors: InquiryErrors = {}

  if (!name) errors.name = 'Name is required.'
  else if (name.length > 120) errors.name = 'Name must be 120 characters or fewer.'

  if (!email) errors.email = 'Email is required.'
  else if (!emailPattern.test(email) || email.length > 200) errors.email = 'Enter a valid email address.'

  if (organization.length > 160) errors.organization = 'Organization must be 160 characters or fewer.'

  if (!validTypes.includes(inquiryType as InquiryType)) errors.inquiryType = 'Choose a valid inquiry category.'

  if (source.context !== undefined) {
    if (!context) errors.context = 'Choose a listed interest or remove the selection.'
    else if (context.inquiryType !== inquiryType) errors.context = 'Choose an interest that matches your inquiry category.'
  }

  if (!message) errors.message = 'Message is required.'
  else if (message.length > 5000) errors.message = 'Message must be 5000 characters or fewer.'

  if (Object.keys(errors).length) return { errors }
  return {
    data: {
      name,
      email,
      organization,
      inquiryType: inquiryType as InquiryType,
      message,
      ...(context ? { context: context.token } : {}),
    },
    errors,
  }
}

