import { describe, expect, it } from 'vitest'

import { checkCommerceReadiness, unreleasedCommerceEvidence } from '@/commerce/releaseReadiness'
import type { CommerceReleaseEvidence } from '@/commerce/releaseReadiness'

const completeFixture = (): CommerceReleaseEvidence => ({
  productSlug: 'synthetic-example-software',
  releaseId: 'v1.0.0-test',
  artifactSha256: 'a'.repeat(64),
  artifactDownloadVerified: true,
  humanReleaseApproved: true,
  licenseTermsApproved: true,
  refundPolicyApproved: true,
  publishedSupportPolicy: true,
  approvedStripePriceId: 'price_TEST12345678',
  stripeAccountVerified: true,
  webhookVerificationTested: true,
  fulfillmentTested: true,
  ownerEnabledSales: true,
})

describe('CX83 customer software release gate', () => {
  it('blocks both prerelease products by default', () => {
    for (const slug of ['connected-websites', 'client-brand-studio']) {
      const result = checkCommerceReadiness(unreleasedCommerceEvidence(slug))
      expect(result.readyForCheckout).toBe(false)
      expect(result.blockers).toContain('sales-not-enabled')
      expect(result.blockers).toContain('release-not-approved')
      expect(result.blockers).toContain('fulfillment-not-tested')
    }
  })

  it('requires all independent approval and verification gates', () => {
    const ready = checkCommerceReadiness(completeFixture())
    expect(ready.readyForCheckout).toBe(true)
    expect(ready.blockers).toEqual([])

    for (const field of [
      'artifactDownloadVerified',
      'humanReleaseApproved',
      'licenseTermsApproved',
      'refundPolicyApproved',
      'publishedSupportPolicy',
      'stripeAccountVerified',
      'webhookVerificationTested',
      'fulfillmentTested',
      'ownerEnabledSales',
    ] as const) {
      const result = checkCommerceReadiness({ ...completeFixture(), [field]: false })
      expect(result.readyForCheckout, 'unexpected approval: ' + field).toBe(false)
      expect(result.blockers.length).toBeGreaterThan(0)
    }
  })

  it('does not accept an empty release, invalid checksum or invented price reference', () => {
    for (const change of [
      { releaseId: ' ' },
      { artifactSha256: 'a'.repeat(63) },
      { artifactSha256: 'invalid' },
      { approvedStripePriceId: 'my-local-price' },
      { approvedStripePriceId: null },
      { productSlug: '' },
    ]) {
      const result = checkCommerceReadiness({ ...completeFixture(), ...change })
      expect(result.readyForCheckout).toBe(false)
    }
  })
})
