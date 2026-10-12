# Cat repair, Run 1 investigation checkpoint

Date: October 12, 2026. Owner authorized both logical runs, staging and production release. Historical instructions forbidding production are superseded by that authorization.

## Source continuity

Repository Mike-CX83/cx83_webapp. Dedicated branch chatgpt/cat-repair-validation-2026-10-12 starts from staging-host fe89b67cc0f06ef71452fab166d756bd5ab6fa12. Production branch and launch handoff identify 6489a0b206ed2835f04e1cf281371f400ec428e7. GitHub comparison proves the five production-only differences are Dockerfile and deployment configuration; Cat source is identical between those commits. The connected website owner tool reads the staging checkout, not the production filesystem. Public site UI, contact destination and live chat API were independently exercised. Exact running production CX83_DEPLOYED_SHA and environment model still require authorized server access; no claim that these were verified.

## Confirmed findings

* Supplied Android screenshots show User Safety: safe as the complete answer, a bare contextual contact URL, and a reply ending mid sentence. These are source evidence, not assumptions about screenshots.
* October 12 live POST /api/chat emitted reasoning-start, reasoning-delta, reasoning-end and OpenRouter providerMetadata in the public response. No visitor input or private data was used. The response identified OpenRouter transport. Configured and routed model identity is not available through public assistant-status. env.example and runtime fallback use openrouter/free, but an example is not proof of live configuration.
* The source route forwards streamText.toUIMessageStreamResponse without filtering reasoning/metadata or checking final finishReason and text. No classifier code exists in the inspected chatbot. The screenshot label therefore came through provider generated content or a provider response; exact upstream routed model attribution remains unproven.
* A repeat of the exact misspelled custom website question in real Chrome returned a valid contextual Markdown link. The destination works. Rendering supports Markdown; malformed plain paths are nondeterministic model output, not a broken form route.
* maxOutputTokens is 800 by default and CMS. The screenshot partial response is consistent with truncation, but its original finishReason was not retained. The repaired route regression uses a length finish reason and confirms no partial answer is delivered.
* Input passed arbitrary client roles and parts to convertToModelMessages. There was no explicit input size limit or chat rate limit. Provider error.message was partially redacted and logged, still risking private prompt/body fragments.
* assistant-settings exposes owner guidance to anonymous read by default. Owner guidance and model fields now require authentication.

## Changes

Existing frontend, assistant-ui transport, provider selection, CMS, public knowledge and inquiry infrastructure preserved. The route buffers the same provider's answer, validates completed text, and constructs a text-only SDK stream. This changes incremental token display to a waiting indicator followed by the validated answer, a deliberate privacy tradeoff. No raw reasoning or provider metadata reaches the client. Known internal label signatures and incomplete/empty completions receive an honest useful fallback, while normal relevant safety explanations remain intact. Explicit simple contact requests receive deterministic published contact links. Bare contact routes and email are normalized. The renderer accepts only approved CX83 navigation and the hello mailbox.

Input is text only, user/assistant roles only, up to forty incoming UI messages, last twelve passed to the model, 2000 characters per visitor message and 64KB body. Origin, timeout, no-store and bounded per-process hashed-IP limits added. Provider failures log event names only. Authenticated field access added to assistant-settings. Existing provider/model/token configuration remains unchanged.

## Validation and limits

The Run 1 regression suite exercises the real route and SDK using a synthetic language-model fixture. It verifies metadata exclusion, classifier rejection, partial/empty output handling, contact formatting, body bounds, forged roles/parts, rate limits, allowed links, provider errors and conversation continuity. This is deterministic regression coverage; it is not a live repaired-model pass. Exact test result, CI, staging and deployment evidence will be added in the final report.

Protected staging remains protected. Production workflow only builds an image; server SSH deploy is a separate operation. This session has no production SSH credential, staging browser credential, or live provider secret. GitHub and owner source connectors work. Access blockers do not prevent independent Run 2 implementation. Run 1 staging acceptance is pending, not passed.
