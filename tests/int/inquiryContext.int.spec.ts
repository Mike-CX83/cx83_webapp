import { describe, expect, it } from 'vitest'

import { inquiryContextHref, parseInquiryContext } from '@/forms/inquiryContext'

const approved = [
  { token: 'websites-and-business-tools', label: 'Custom websites and business tools', inquiryType: 'project' },
  { token: 'automation-and-integrations', label: 'Business automation and integrations', inquiryType: 'services' },
  { token: 'ai-setup-and-workflows', label: 'AI setup and reusable workflows', inquiryType: 'services' },
  { token: 'connected-websites', label: 'Connected Website Platform', inquiryType: 'software' },
  { token: 'client-brand-studio', label: 'Client Brand Studio', inquiryType: 'software' },
] as const

describe('approved inquiry context', () => {
  it.each(approved)('maps $token to its approved category and canonical label', (context) => {
    expect(parseInquiryContext(context.token)).toEqual(context)
    expect(inquiryContextHref(context.token)).toBe('/contact?context=' + context.token + '#contact-form')
  })

  const neutralQueries: { label: string; value: string | string[] | undefined }[] = [
    { label: 'direct contact', value: undefined },
    { label: 'empty value', value: '' },
    { label: 'unknown value', value: 'unlisted-service' },
    { label: 'free text', value: 'Please call Ada at ada@example.invalid' },
    { label: 'single array value', value: ['connected-websites'] },
    { label: 'repeated identical values', value: ['connected-websites', 'connected-websites'] },
    { label: 'conflicting values', value: ['connected-websites', 'client-brand-studio'] },
  ]

  it.each(neutralQueries)('keeps $label neutral', ({ value }) => {
    expect(parseInquiryContext(value)).toBeNull()
  })
})
