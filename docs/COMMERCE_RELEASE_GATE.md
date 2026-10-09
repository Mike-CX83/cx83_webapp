# CX83 Phase 4 commerce and licensed download architecture

Status: foundation and release constraints, no customer checkout active.
Owner direction: continuous safe progression, not permission to start collecting payments before verified releases, pricing and terms exist.

## What exists on October 9, 2026

- Website: Next.js 16, Payload CMS and PostgreSQL, protected staging environment.
- CX83 Connected Website Platform: customer installer, release scope and supported environments are not qualified.
- Client Brand Studio: 0.8.4 automated development build, not a customer-approved release.
- A Stripe app connection was made available during this project session. A test-mode account labeled `New business` appeared. This name does **not** establish that the account belongs to CX83 Labs or that a live account is available. Do not create prices, products or production payment destinations without confirming the intended account.
- Phase 3 product pages intentionally show **In development**; there are no Buy or Download buttons.

## Safeguarded release readiness

Pure TypeScript gate in `src/commerce/releaseReadiness.ts` with unit tests in `tests/int/commerceReadiness.int.spec.ts`. All public products begin blocked. A future authenticated, server-only Checkout Session endpoint must call this gate using **trusted stored release records**, never client-submitted flags.

Before enabling an offer, require:

1. Named approved product and exact release version.
2. Verified immutable binary in controlled delivery storage, with SHA256 and a successful test download.
3. Human-approved actual package, ownership and rights.
4. Approved license, refund policy and support terms for the edition.
5. Approved Stripe Price ID in the confirmed merchant account, plus validated payment method and taxation decisions.
6. Verified endpoint signing key, webhook integration and successful end-to-end fulfillment in Stripe test mode.
7. Owner's explicit enable-sales decision.

Fail closed when any gate is missing. Pure fixture tests are not evidence that the integration has passed those checks.

## Checkout design (to implement only with account and release prerequisites)

Recommended first release: Stripe-hosted Checkout, one-time `mode=payment` where the approved edition is a one-time purchase. Add subscriptions only if edition policy specifically requires them.

Server-only route (future) receives an approved product/edition identifier, verifies an authorized price and release, creates a persisted pending order, then creates a Checkout Session with server-selected price and merchant account. Never take raw card data or trust browser-supplied amount, currency, release status, customer permissions or checkout success flags.

Stripe redirects a buyer to a neutral order-status page. **Redirect does not grant entitlement.**

Webhook route (future) reads original raw body and Stripe-Signature header, verifies the signature against the configured secret, checks expected account and mode, and records provider event IDs with a unique database constraint. It must handle retries and duplicate/out-of-order events idempotently. Payment is final only when provider reports paid state. Handle async payment success/failure, expiry, refunds/disputes and revocation according to confirmed license terms. Separate monetary state from entitlement state; do not equate a customer record with a license.

After verified payment, a transactional fulfillment worker grants only the purchased edition/release rights and issues branded confirmation through a tested sender. No sending from unconfigured personal email or leaking order data to a model. Use expiring, scoped download URLs or authenticated streaming. Never accept client file paths. Bind downloads to the exact artifact checksum and entitlement; track deliveries without exposing secrets.

## Acceptance checks

- No public Buy or Download control appears before release readiness.
- Stripe test cards verify successful payment, declined card, abandoned and expired session.
- Webhook signature failure and duplicate/out-of-order delivery never create access.
- Delayed payment never grants early access; paid final state grants exactly one idempotent entitlement.
- Partial/full refunds, disputes and entitlement revocation act according to approved terms.
- Authenticated buyer cannot download another buyer's artifact; expired grants fail.
- Server can recover an interrupted fulfillment job and give the buyer a correct status.
- Product metadata, approved terms, policy link and license match actual release.
- Correct merchant account, tax configuration, payment receipts, webhook delivery and sandbox/live separation are confirmed.
- Staging and production secrets stay outside GitHub, browser builds and the agent mailbox.

## Dependency receipts

Stripe documentation reviewed: https://docs.stripe.com/checkout/quickstart, https://docs.stripe.com/payments/accept-a-payment?payment-ui=checkout&ui=stripe-hosted, https://docs.stripe.com/webhooks.
The first-party Stripe integration planner was consulted in test context only. No Stripe account mutation, customer, price, payment link, checkout session or charge was created by this work.

PROJECT: CX83 website
COMPLETED: release readiness predicate, fixture tests and backend purchase design
BLOCKED: first approved release and binary, approved licensing/pricing/terms and merchant account verification
NEXT: wire verified release records and owner approvals into server-only infrastructure, then sandbox Checkout and webhook tests, then explicit activation for customer sales
ARTIFACTS: `src/commerce/releaseReadiness.ts`, `tests/int/commerceReadiness.int.spec.ts`, this document, issue #13
