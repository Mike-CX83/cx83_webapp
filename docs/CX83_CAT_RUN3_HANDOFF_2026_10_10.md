# CX83 Labs website | Run 3 final completion handoff

Prepared October 10, 2026, Tulsa. **Status: Run 3 source and protected staging delivered; corrected Gmail scope deployment PENDING_CORRECTED_STAGE_PROOF; site-originated outbound notification remains blocked on missing authorized server OAuth.** No public release.

PROJECT: CX83 Labs website, Catalyst X83, `Mike-CX83/cx83_webapp`, branch `staging-host`.

RUN: 3 of 3. Contact capture, saved notification outbox, launch trust polish, comprehensive responsive/accessible route pass.

HEAD: Run 3 first tested and deployed implementation `eec1a5335f636dc568a861a7bef02219bfc992ad`; final corrected tested application source merge `5c04e4092b7ed5d757ef058ceb46588dfaf5a2fd`. Final corrected staging deployed SHA: PENDING_CORRECTED_DEPLOYED_SHA. Docs-only receipt commit, if later, must not be mistaken for this application deploy.

COMPLETED:
1. Retained Next.js, React, Payload, PostgreSQL, owner website MCP connection and password-protected DigitalOcean staging workflow; no new stack, tunnel, mail server or database.
2. `POST /api/inquiries` now validates input and JSON size, checks spam honeypot, enforces bounded per-process submission limits and stable retry IDs. The UI shows immediate accessible errors and confirms only genuinely saved data. The earlier asynchronous disabled-Name Playwright flake was repaired.
3. Existing `form-submissions` records hold the inquiry, opaque idempotency token, content digest and durable notification states. A server-owned Gmail adapter addresses only the verified `mike@cx83labs.com` mailbox with the minimum Gmail send-only scope and records provider acceptance separately from independent inbox receipt. An authenticated manual dispatch route excludes in-flight and uncertain rows.
4. Contact visual polish, project/service/software inquiry choices in code and the real Payload form, honest privacy language, consistent CX83 dark surfaces, real logo, FAQ, Working How it works page, Work proof fallback, branded 404, navigational links, mobile focus/touch and staging noindex.
5. Stronger 5xx and unknown provider outcomes remain uncertain rather than being retried blindly. CAT still reads approved public content only and cannot deploy, edit code, access owner tools or read inquiry records.
6. [Merged PR #29](https://github.com/Mike-CX83/cx83_webapp/pull/29) and [merged PR #30](https://github.com/Mike-CX83/cx83_webapp/pull/30) completed verification. Final mail correction [workflow 38026253840](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026253840) passed TypeScript, lint, 38 integration tests, 64 browser tests and production build, without the earlier validation flake. Contact desktop/mobile and How it works mobile screenshot files are available in artifact `homepage-review-38026253840`.
7. First protected staging deploy at [workflow 38025874771](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38025874771) reported `gate_without_password=401`, `site_with_password=200`, both original and optimized hero assets 200, `checkout_sync=ok`, and identical `checkoutSha=deployedSha=eec1a5335f636dc568a861a7bef02219bfc992ad`, followed by `STAGING DEPLOY SUCCESS`. Corrected deploy proof: PENDING_CORRECTED_STAGE_PROOF.
8. First `cx83-home-hero` section, original banner `/brand/cx83-labs-hero.avif`, authentic CX83 logos and original styling stayed untouched; AVIF Git blob `3afb58548ceed0dab3c814991d5894ce09c16d5a`.

BLOCKED:
* **Website email notification is not live**. The connected CX83 Workspace Gmail account's synthetic self-message is confirmed as SENT and INBOX, but the website runtime has not been granted its own scoped OAuth credential, so `form-submissions` currently save with a distinct `needs-configuration` notification state. Setting up and verifying the exact send-only server authorization is a separate owner/administrator action. No guessed alias or personal destination was published.
* New public multi-replica or high-volume intake needs shared rate limiting, a database uniqueness constraint and a provider-backed delivery reconciliation scheme. Current implementation is explicitly bounded to the protected single-replica staging.
* Original showcase v2 video/poster/captions unavailable as verified playable sources. Studio 0.8.4 remains in development without customer release, license, checkout or download approval. A live third-party CAT model response was not independently established by these tests.

NEXT:
1. Set up only the dedicated server OAuth client, secret and refresh grant for Gmail send on verified `mike@cx83labs.com`; preserve credentials in `/opt/cx83-webapp/.env` mode 600, not Git. See `docs/CX83_RUN3_MAIL_DELIVERY.md`.
2. Submit one clearly synthetic inquiry through the **actual staging contact endpoint**, verify stored form-submission status and Gmail provider ID and the actual message in the exact authorized inbox. Reconcile uncertain sends against Sent before manual retry.
3. Keep public production, payment activation, customer installer, licenses and media publication behind separate owner approval.

ARTIFACTS: PR #29, PR #30, full CI [workflow 38026253840](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026253840), first Staging [workflow 38025874771](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38025874771), final corrected staging PENDING_CORRECTED_WORKFLOW, `docs/CX83_CAT_WEBSITE_BUILD_BLUEPRINT_2026_10_09.md`, `docs/CX83_RUN3_VISUAL_EVIDENCE_MANIFEST.md`, `docs/CX83_RUN3_MAIL_DELIVERY.md`, `tests/e2e/catRun3.e2e.spec.ts`, `tests/e2e/contact.e2e.spec.ts`, `tests/int/inquiryMailer.int.spec.ts`, and preserved `tests/e2e/homeBanner.e2e.spec.ts`.

This draft MUST be patched with exact final staging deployment proof before merging into `staging-host`. Do not claim it is the final deployed receipt until that check is complete.
