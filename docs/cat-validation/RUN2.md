# Cat repair, Run 2 implementation and validation

Run 1 checkpoint commit: 9ab58601b8d31cdfcfdab558344768ff917e5c65. Continued on the same dedicated branch and PR 45. Protected staging acceptance of Run 1 is carried forward as pending.

## Visitor functions

Report a problem appears below an answer. The visitor can leave a note, optionally attach the selected question and answer, preview common identifier redaction, and explicitly confirm submission. A general chat archive, earlier turns, raw provider reasoning, credentials and raw IP are not stored. Full redaction of arbitrary prose cannot be guaranteed; clear instructions ask visitors to remove sensitive details, and obvious credentials/identifiers are rejected server side.

Reports use the existing Payload form-submissions collection and a dedicated Cat problem reports form. Existing logged-in CX83 admin users are the authorized destination. There is also an authenticated GET /api/cat-reports review endpoint. It enforces normal Payload read access; anonymous readers receive 404. Reports do not claim email delivery. Report metadata explicitly describes configuration at report time, not the historical routed model behind the selected answer. Retried identical reports are deduplicated.

Review and send a plan offers an editable draft from the most recent reply, an option to ask Cat to draft a preliminary plan, optional name/email/organization, explicit confirmation, cancellation and retry handling. Nothing is saved merely because Cat says a plan exists or a visitor asks to send it. Confirmed plans use the existing CX83 inquiry form and durable outbox. Stored plans label budgets and desired dates as visitor preferences, never CX83 commitments. Optional contact is truly optional; omitted contact does not prevent owner review or notification processing, but CX83 cannot directly reply to that visitor.

## Privacy, retention and security

An upfront composer disclosure and Chat privacy view explain provider processing, voluntary storage, sensitive-information avoidance, operator access and retention. Active application report contents expire after 30 days; Cat plans/contact details expire after 90 days. A collection beforeRead hook hides expired contents and a bounded cleanup runs during status/review requests. Cleanup is on-demand, not an independently configured daily scheduler. Idle service data and server backup rotation remain operational limitations; no identical provider/backup retention promise is made. Ordinary preexisting inquiries are not affected.

Bodies are bounded during reading, origins checked, JSON and input types validated, source fields rebuilt server side and request limits use bounded hashed identifiers in memory. Existing single-replica architecture is retained. Distributed deployments require database uniqueness and a shared rate limiter before scaling. Raw form-submission creates for the CX83 inquiry and Cat report forms now require an authenticated user, preventing bypass of the custom public route; unrelated generic public forms retain their existing behavior.

Inquiry deduplication now queries the exact request identifier instead of relying on the last 200 submissions. No new collection schema, external service, API provider or access grant was added. Model and server failures log event names without private details.

## Tests

Local TypeScript and lint pass. Full integration checks: 188 passed, no failures, 30 live tests intentionally skipped outside the protected staging owner runtime. Tests cover actual route behavior with a synthetic SDK language model, consent, access control, expiry, storage/readback, retry conflicts and existing inquiry mail/outbox behavior. This is not a substitute for live provider quality testing.

Thirty unique representative scenario inputs and per-scenario keyword criteria are retained in tests/fixtures/catScenarios.json. Contract tests execute every input; a separate protected-staging-only suite executes the real route and configured live provider, stores synthetic results in .cx83-checks/cat-live-validation.json and evaluates correctness/relevance support, clarity, tone, formatting, next action, privacy and security. Human review is required for semantic correctness and practical usefulness. Until that suite actually runs, model quality outcomes remain pending.

Browser tests exercise contact navigation, safe links, consented reports, redacted previews, plan review/confirmation, editing/cancel behavior, stable retry identifiers, privacy, reset, failures, long replies/scrolling and measured viewports 320x720, 390x844, 430x932, 844x390 and 1440x1000. CI adds Android Chromium and iPhone WebKit device emulation. This does not claim testing on physical Android/iPhone devices or the native Safari app. The local Playwright browser download was corrupt/blocked, so browser execution is assigned to the established GitHub workflow, not called passed locally.

## Release gate and rollback

PR 45 targets staging-host only. After CI/browser verification and screenshot review, normal staging merge/build/deploy should run. Previous staging image and exact staging base fe89b67 are the rollback reference. No database schema migration is required. Created Cat records/forms remain ordinary private CMS objects.

Public production still needs exact runtime SHA/model verification, authorized production SSH deployment using the existing production image workflow and rollback image, public postdeployment behavioral checks, synthetic report/plan destination readback and final live criteria review. No production deployment or recipient email delivery is claimed in this checkpoint.
