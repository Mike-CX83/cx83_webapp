import { describe, expect, it } from 'vitest'

import { validateInquiry } from '@/forms/inquiry'

describe('inquiry validation', () => {
  it('accepts a project inquiry', () => {
    const result = validateInquiry({
      name: 'Ada',
      email: 'ada@example.com',
      organization: 'Example',
      inquiryType: 'project',
      message: 'We need a clearer handoff between two tools.',
    })

    expect(result.errors).toEqual({})
    expect(result.data?.inquiryType).toBe('project')
  })

  it('accepts a software interest and rejects unknown categories', () => {
    const supported = validateInquiry({ name: 'Ada', email: 'ada@example.com', organization: '', inquiryType: 'software', message: 'How does Studio work?' })
    expect(supported.data?.inquiryType).toBe('software')
    const result = validateInquiry({ name: 'Ada', email: 'not-an-email', inquiryType: 'sales', message: '' })
    expect(result.data).toBeUndefined()
    expect(result.errors.email).toBeTruthy()
    expect(result.errors.inquiryType).toBeTruthy()
    expect(result.errors.message).toBeTruthy()
  })

  it('rejects a missing email and an unknown inquiry type', () => {
    const result = validateInquiry({
      name: 'Ada',
      email: 'not-an-email',
      inquiryType: 'sales',
      message: '',
    })

    expect(result.data).toBeUndefined()
    expect(result.errors.email).toBeTruthy()
    expect(result.errors.inquiryType).toBeTruthy()
    expect(result.errors.message).toBeTruthy()
  })
})
