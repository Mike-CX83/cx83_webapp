/**
 * A mandatory release-readiness predicate for future paid CX83 software.
 *
 * IMPORTANT: This module does not connect to Stripe or grant customer access.
 * Only trusted server-side configuration and verified release records may feed
 * this function. Never derive these checks from untrusted browser fields.
 */
export type CommerceReleaseEvidence = {
  productSlug: string
  releaseId: string | null
  artifactSha256: string | null
  artifactDownloadVerified: boolean
  humanReleaseApproved: boolean
  licenseTermsApproved: boolean
  refundPolicyApproved: boolean
  publishedSupportPolicy: boolean
  approvedStripePriceId: string | null
  stripeAccountVerified: boolean
  webhookVerificationTested: boolean
  fulfillmentTested: boolean
  ownerEnabledSales: boolean
}

export type CommerceBlocker =
  | 'product-missing'
  | 'release-missing'
  | 'artifact-checksum-missing-or-invalid'
  | 'download-not-verified'
  | 'release-not-approved'
  | 'license-not-approved'
  | 'refund-policy-not-approved'
  | 'support-policy-not-published'
  | 'price-not-approved'
  | 'stripe-account-not-verified'
  | 'webhook-not-tested'
  | 'fulfillment-not-tested'
  | 'sales-not-enabled'

export type CommerceReadiness = {
  readyForCheckout: boolean
  blockers: CommerceBlocker[]
}

const validSha256 = (sha: string | null): boolean => Boolean(sha && /^[0-9a-f]{64}$/i.test(sha))
const validStripePrice = (priceId: string | null): boolean => Boolean(priceId && /^price_[A-Za-z0-9]{8,}$/.test(priceId))

/**
 * Checkout must refuse an offer until every readiness gate passes.
 *
 * The payment provider's redirect is never evidence of payment or entitlement.
 * Future fulfillment requires a verified signed webhook, payment confirmation,
 * an idempotent persisted order, and a valid release access grant.
 */
export function checkCommerceReadiness(evidence: CommerceReleaseEvidence): CommerceReadiness {
  const blockers: CommerceBlocker[] = []

  if (!evidence.productSlug.trim()) blockers.push('product-missing')
  if (!evidence.releaseId?.trim()) blockers.push('release-missing')
  if (!validSha256(evidence.artifactSha256)) blockers.push('artifact-checksum-missing-or-invalid')
  if (!evidence.artifactDownloadVerified) blockers.push('download-not-verified')
  if (!evidence.humanReleaseApproved) blockers.push('release-not-approved')
  if (!evidence.licenseTermsApproved) blockers.push('license-not-approved')
  if (!evidence.refundPolicyApproved) blockers.push('refund-policy-not-approved')
  if (!evidence.publishedSupportPolicy) blockers.push('support-policy-not-published')
  if (!validStripePrice(evidence.approvedStripePriceId)) blockers.push('price-not-approved')
  if (!evidence.stripeAccountVerified) blockers.push('stripe-account-not-verified')
  if (!evidence.webhookVerificationTested) blockers.push('webhook-not-tested')
  if (!evidence.fulfillmentTested) blockers.push('fulfillment-not-tested')
  if (!evidence.ownerEnabledSales) blockers.push('sales-not-enabled')

  return { readyForCheckout: blockers.length === 0, blockers }
}

/**
 * Default for ALL publicly described prerelease products.
 * No price, package, entitlement or customer payment is created by this record.
 */
export function unreleasedCommerceEvidence(productSlug: string): CommerceReleaseEvidence {
  return {
    productSlug,
    releaseId: null,
    artifactSha256: null,
    artifactDownloadVerified: false,
    humanReleaseApproved: false,
    licenseTermsApproved: false,
    refundPolicyApproved: false,
    publishedSupportPolicy: false,
    approvedStripePriceId: null,
    stripeAccountVerified: false,
    webhookVerificationTested: false,
    fulfillmentTested: false,
    ownerEnabledSales: false,
  }
}
