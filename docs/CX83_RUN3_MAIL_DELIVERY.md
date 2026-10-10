# CX83 Website Run 3 | Inquiry storage and notification evidence

Prepared October 9, 2026. Scope: protected staging only. No customer launch, checkout, test message to an outside customer, or public production.

## Verified business mailbox

The connected Google Workspace Gmail profile confirms ownership of `mike@cx83labs.com`. The CX83 staging CMS Site Settings publishes the same verified email. `hello@cx83labs.com` was not found as a verified mailbox and is not published or used. Agent-to-agent mailbox messaging is not an external customer inbox.

## Server implementation

The public `POST /api/inquiries` route validates name, email, interest and message, enforces JSON size and rate limits, and has a hidden bot field. The frontend validates before any network submission so empty fields remain enabled and errors appear immediately. Every successful submission goes into the existing Payload `form-submissions` collection; no new table, separate mailbox infrastructure or Payload schema migration is required.

The same saved record includes an opaque request ID, a content digest, and durable delivery state:
* `pending`: saved locally, no attempt yet.
* `unconfigured`: saved; website runtime lacks verified mailbox OAuth variables.
* `sending`: claim persisted before the Google API request.
* `accepted`: Google Gmail API supplied a message ID. Provider acceptance is NOT independent inbox delivery.
* `failed`: provider returned a definite failure.
* `uncertain`: a network interruption, ambiguous provider server failure, or missing acceptance identifier means the provider might already have received the message. Requires human reconciliation against Gmail Sent before retry.

Client retries with the same request ID are deduplicated among the latest 200 submissions in the single staging web replica. This is a bounded, not globally transactionally unique guarantee. Do not scale to multiple replicas or portray this as strict exactly-once delivery without a database unique constraint and a provider-backed delivery reconciliation design.

## Required server secret setup before outbound email can be verified

1. An authorized Google Workspace app must have the Gmail **send-only** OAuth scope (`https://www.googleapis.com/auth/gmail.send`) for `mike@cx83labs.com`. The adapter calls the explicitly named `users/mike@cx83labs.com/messages/send` endpoint, which rejects access that the OAuth principal does not have; no extra Gmail profile/read permissions are needed. See Google's [Gmail users.messages.send reference](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/send). ChatGPT's connected Gmail account **does not** expose or authorize reusable server OAuth credentials.
2. A server administrator must add only to `/opt/cx83-webapp/.env`:
   ```
CX83_INQUIRY_TO=mike@cx83labs.com
CX83_GMAIL_CLIENT_ID=
CX83_GMAIL_CLIENT_SECRET=
CX83_GMAIL_REFRESH_TOKEN=
CX83_INQUIRY_DISPATCH_SECRET=
```
   The dispatch secret must be random and at least 32 characters. Never place these secret values in Git, messages, screenshots or agent handoffs.
3. Deploy the configuration without recreating other CX83, VaultStorage, Coolify, tunnel or database services. Run an authorized synthetic inquiry and inspect its exact `form-submissions` record, Gmail provider acceptance ID and the actual recipient inbox.
4. Only then mark full storage-to-mailbox delivery as verified. No live recipient delivery is claimed merely because unit tests mock Gmail successfully.

An authenticated recovery endpoint, `POST /api/inquiries/dispatch`, uses ONLY the dedicated dispatch bearer. It processes at most ten unresolved submissions per invocation, excluding in-flight and uncertain records. No cron or automatic retry scheduler is installed. Operators inspect uncertain records and Google Sent before manually intervening.

## Controlled mailbox proof, October 9

The verified business Gmail account sent a synthetic message to itself, and the same account displayed matching SENT and INBOX identifiers. Subject: CX83 Run 3 synthetic mailbox verification | October 9, 2026. Gmail message ID: 1a1240ebc0536235. This proves the owner-managed mailbox and does not prove that the website backend has Gmail authorization.

## Safety and test constraints

* Requests, answers, customer submissions and API keys are not passed to public CAT.
* Mail body includes only the visitor-supplied inquiry and stored submission ID; sender and recipient are both the verified business mailbox.
* The site's success message means saved, not inbox-delivered.
* The single-instance rate limiter is a staging-level control. Future public production requires shared abuse defenses and a stronger persistent unique index.
* The protected original CX83 homepage banner, authentic logo, media gating, unreleased products and existing staging pipeline remain unchanged.

## Implementation and staging verification

PR #29 merged its tested source as `eec1a5335f636dc568a861a7bef02219bfc992ad`. Protected staging workflow [38025874771](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38025874771) passed CI, built and deployed the image, confirmed unauthenticated 401, authenticated 200, original and optimized hero images 200, `checkout_sync=ok`, and equal deployed/checkout SHA. The CX83 Website owner connection subsequently read the new outbox source and live CMS form options. PR #30 follow-up [workflow 38026253840](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026253840) passed 38 integration tests, 64 browser tests, TypeScript, lint and production build. Its corrected staging deployment is PENDING_CORRECTED_STAGE_PROOF. No website-originated Gmail mail acceptance or recipient delivery has been proven; this is an explicit operational blocker, not a failed saved submission.
