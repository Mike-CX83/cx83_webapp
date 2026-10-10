import { describe, expect, it } from 'vitest'
import { allowInquiryAttempt, fingerprintInquiry, isSafeRequestId } from '@/forms/inquiryOutbox'

describe('CX83 inquiry request defense', () => {
  const data = {
    name: 'Synthetic',
    email: 'synthetic@example.invalid',
    organization: '',
    inquiryType: 'services' as const,
    message: 'We would like to connect two systems.',
  }

  it('detects matching submissions without storing message content in its digest', () => {
    const digest = fingerprintInquiry(data)
    expect(digest).toMatch(/^[a-f0-9]{64}$/)
    expect(fingerprintInquiry(data)).toBe(digest)
    expect(fingerprintInquiry({ ...data, message: 'Changed' })).not.toBe(digest)
  })

  it('rejects missing or unsafe idempotency keys', () => {
    expect(isSafeRequestId('cca82d81-4a8f-458c-a2c5-e2ff33d474e1')).toBe(true)
    expect(isSafeRequestId('../injection')).toBe(false)
    expect(isSafeRequestId(undefined)).toBe(false)
  })

  it('limits repeated submissions by source in a sliding window', () => {
    const ip = 'synthetic-rate-limit-' + Math.random()
    const now = Date.now()
    for (let i = 0; i < 5; i++) expect(allowInquiryAttempt(ip, now + i)).toBe(true)
    expect(allowInquiryAttempt(ip, now + 5)).toBe(false)
    expect(allowInquiryAttempt(ip, now + 15 * 60_000 + 10)).toBe(true)
  })
})
