# Internal privacy readiness facts and gaps

PROJECT: CX83 Labs website, Mike-CX83/cx83_webapp.
DATE: October 11, 2026.
STATUS: Internal technical inventory. This is not a public privacy policy, compliance determination or retention promise.

## Verified source behavior

| Area | Established behavior | Source |
| --- | --- | --- |
| Inquiry collection | Required name, email, inquiry category and message; optional organization and selected service/product context. Honeypot and request identifier support abuse and retry handling. | src/forms/inquiry.ts; src/components/site/InquiryForm.tsx; src/forms/inquiryContext.ts |
| Storage | Existing Payload form-submissions rows store the fields, selected context in the message, request ID, content digest and delivery state/attempt count. Server writes use trusted overrideAccess; visitors are not granted private collection reads by this feature. | src/forms/inquiryOutbox.ts; src/app/(frontend)/api/inquiries/route.ts |
| Abuse metadata | Incoming proxy IP is hashed with the application secret for an in-memory attempt window of 15 minutes, maximum five attempts. Old entries are cleaned when the map grows. This is not an IP retention guarantee for proxy or host logs. | src/forms/inquiryOutbox.ts |
| Notifications | Storage succeeds independently of mail. The existing optional Gmail pathway is gated by configuration and has a durable delivery state; existing Run 2 handoff records mail OAuth as unconfigured. Run 3 neither activates nor sends mail. | src/forms/inquiryMailer.ts; docs/CX83_RUN3_MAIL_DELIVERY.md; verified Run 2 handoff |
| Visitor chat | Browser session holds messages in the chat runtime. New conversation remounts that runtime. The API passes up to the last 12 UI messages and approved public site knowledge to the configured model. No chat database persistence or browser durable storage is implemented in the reviewed widget/route. | src/components/assistant/AssistantWidget.tsx; src/app/(frontend)/api/chat/route.ts |
| Public knowledge | Published services, projects and case studies are loaded with access checks; site settings and static software/route guidance are public knowledge. No inquiry records, owner credentials, private form fields or URL query context are added to Cat. New starters use exact public pathname keys and self-contained prompt text. | src/content/load.ts; src/ai/assistant.ts; src/content/assistantNavigation.ts |
| Processors | Staging is documented on DigitalOcean using PostgreSQL, Payload and Docker. The documented configured AI provider is OpenRouter. Gmail code exists for optional notifications. Confirm current processor accounts, subprocessors, regions and contractual terms before public policy wording. No provider/model/billing configuration was changed. | docs/STAGING.md; src/ai/assistant.ts; src/ai/model.ts |
| Access | Staging gate, Payload owner authentication and existing owner MCP remain separate from visitor chat. Runtime live checks are recorded in the final Run 3 handoff. | docs/STAGING.md; src/plugins/index.ts |
| Backups | Repository deployment documentation describes daily backups and removal of backup files older than 14 days. Run 3 has not inspected active cron or backup contents; this is documented configuration, not proof of actual current retention. | docs/STAGING.md; deploy/staging/backup.sh |

## Decisions still required before public launch

1. Owner must define inquiry retention, deletion/export process, authorized staff access and backup treatment. No application purge schedule was found in the reviewed inquiry code.
2. Confirm OpenRouter and upstream model provider retention, training use, logging, data region and agreements. A model response does not establish these practices.
3. Confirm proxy, application, server and hosting log retention and operational access. Error messages are redacted for common key patterns; that is not a guarantee that arbitrary visitor content never appears in any logs.
4. Verify optional Gmail activation separately, with approved recipients and truthful delivery reporting.
5. Inventory actual cookies, browser storage and third party requests in production configuration, then decide consent and notice requirements. No new analytics or cookie banner was added.
6. Review public privacy wording and contact process against these established practices. Do not promise confidentiality, legal compliance or retention limits from this source audit alone.
7. Keep client/patient records out of synthetic review questions and project coordination.

## Staging check record

Published CMS page ID 5, slug staging-check, title Staging check. It is reachable behind the existing staging gate and has an empty content layout. No primary header/footer link points to it. Keep its current publication state. Proposed prelaunch treatment: owner approves unpublishing or repurposing it before a future production launch. Draft page ID 3 and empty Notes remain untouched. No placeholder records were published on staging.
