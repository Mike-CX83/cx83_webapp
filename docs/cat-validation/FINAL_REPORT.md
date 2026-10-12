# Cat repair and validation report

Status: implementation and final automated checks passed. PR 45 merged to staging-host at 5048fce34c44dab6c6ce65c414aa4cceed49b1eb. Protected staging workflow 38225103031 is running; repaired live provider validation remains pending. Public production release is blocked by unavailable production SSH access. This is not a completed production repair.

## Confirmed root causes

The default GitHub main branch contains the older Ask CX83 widget. Production launch source 6489a0b and staging base fe89b67 share the current Cat frontend/backend. The exact running production SHA and configured/routed model have not been inspected on the server.

Thirty synthetic requests to the public chat API all returned HTTP 200, but 26 exposed reasoning/provider metadata, six exhausted the output limit with no visitor answer, and two rendered internal classifier answers. Raw contact paths, a malformed email URL, excessive explanations and unsupported business/workflow claims were also reproduced. The source forwarded the provider stream without a final output check. The live provider transport identified OpenRouter; exact model routing remains unverified.

## Corrective changes

The existing assistant-ui transport, brand, public content, provider selection and configured token cap remain intact. The server validates text-only user/assistant messages, limits recent context, buffers the model response and emits a text-only SDK stream. Known classifier/prompt envelopes, empty and unfinished output are rejected. One recovery attempt uses the same configured provider/model/cap and shared timeout, then gives an honest contact fallback. Completed ordinary safety explanations remain available.

Published contact/email links are normalized, including inline-code paths and malformed email URLs. The renderer permits approved CX83 navigation and the hello mailbox. System instructions clarify offered services versus development-stage products, discourage irrelevant implementation detail and prohibit invented team members, pricing, dates or guarantees.

Report a problem supports optional notes, an opt-in selected exchange, a redacted preview and explicit confirmation. Reports are stored in the existing private Payload admin review destination. Editable preliminary plans require review/confirmation and use the existing inquiry/outbox, with optional contact details and explicit noncommitment wording. Ordinary chat is not archived.

Privacy disclosure, 30-day report and 90-day plan expiry, origin/body/rate limits, credential/identifier rejection, safe logs, exact retry matching and direct-create protection are implemented. Expired contents are hidden on read and removed during bounded on-demand cleanup. Backup/provider retention and an idle service remain separate operational limits. Single-replica locking/rate limits need a database unique key and shared limiter before horizontal scaling.

## Test evidence

* Production baseline: 30 real HTTP scenarios, all documented with eight evaluation criteria and manual observations in BASELINE_REVIEW.md and production-baseline.json. These are old-production results, not repaired-release passes.
* Checkpoint 9a357d1: successful workflow 38218899032, 198 integration tests including five real PostgreSQL checks, 184 browser tests, TypeScript, lint and build. An earlier footer preservation failure was corrected before release.
* Final application source a8ab09a69f9a12b9f985f5e8236a342dff633f1d: exact CI workflow 38222591686 passed 203 integration tests, 184 browser tests, TypeScript, lint and build. Thirty-one live/destination tests were intentionally skipped. Local output regressions: 56 passed. Full local suite: 198 passed, 36 intentionally skipped (31 live/destination and five CI-only database tests).
* Browser checks cover desktop, Android Chromium and iPhone WebKit emulation, measured 320x720, 390x844, 430x932, 844x390 and 1440x1000 viewports, long replies/scrolling, links, reset, errors, confirmation, cancel and retry. Representative captures were visually reviewed. No physical device/native Safari or actual mobile keyboard pass is claimed.
* Real CI database tests proved saved report/plan rows, deduplication, blocked anonymous reads/creates and expiry masking. Live staging/production destination readback and recipient inbox delivery remain separate checks.

## Changed files

* `.github/workflows/staging-image.yml`
* `docs/cat-validation/BASELINE_REVIEW.md`
* `docs/cat-validation/RUN1.md`
* `docs/cat-validation/RUN2.md`
* `docs/cat-validation/production-baseline.json`
* `playwright.config.ts`
* `scripts/cat-baseline-check.py`
* `src/ai/assistant.ts`
* `src/ai/catDiagnostics.ts`
* `src/ai/catPrivacy.ts`
* `src/ai/catSubmissions.ts`
* `src/ai/chatProtocol.ts`
* `src/ai/publicRequest.ts`
* `src/ai/visitorAnswer.ts`
* `src/app/(frontend)/api/assistant-status/route.ts`
* `src/app/(frontend)/api/cat-plans/route.ts`
* `src/app/(frontend)/api/cat-reports/route.ts`
* `src/app/(frontend)/api/chat/route.ts`
* `src/app/(frontend)/cx83-brand.css`
* `src/components/assistant/AssistantWidget.tsx`
* `src/components/assistant/CatSubmissionReview.tsx`
* `src/forms/ensure-inquiry-form.ts`
* `src/forms/inquiry.ts`
* `src/forms/inquiryOutbox.ts`
* `src/globals/AssistantSettings.ts`
* `src/lib/payload.ts`
* `src/plugins/index.ts`
* `tests/e2e/catRepair.e2e.spec.ts`
* `tests/fixtures/catScenarios.json`
* `tests/int/catLiveValidation.int.spec.ts`
* `tests/int/catRepair.int.spec.ts`
* `tests/int/catScenarioContracts.int.spec.ts`
* `tests/int/catStorageCI.int.spec.ts`
* `tests/int/catSubmissions.int.spec.ts`


## Repository and release

Repository: Mike-CX83/cx83_webapp.
Branch: chatgpt/cat-repair-validation-2026-10-12.
Staging PR: https://github.com/Mike-CX83/cx83_webapp/pull/45, merged into staging-host at 5048fce34c44dab6c6ce65c414aa4cceed49b1eb.
Draft production promotion: https://github.com/Mike-CX83/cx83_webapp/pull/46. GitHub reports a clean merge. The proposed merge was checked to preserve all five production-only configuration files exactly.
Run 1: 9ab58601b8d31cdfcfdab558344768ff917e5c65.
Run 2 feature checkpoint: 84794b20a58125a5146f1b815b575bad760fffff.
Validated recovery/storage checkpoint: 9a357d11929985abe68deb9322516efff4308166.
Final formatting/guard source: a8ab09a69f9a12b9f985f5e8236a342dff633f1d.

No production deployment has occurred. The established production workflow builds an image and requires a separate existing SSH operation. This execution environment has no production SSH key; the 1Password server tools are unavailable. Staging rollback is the existing previous-image mechanism and base fe89b67. Production rollback must tag/verify the actual running image before replacing it; the launch branch commit is a reference, not proof of the currently running image.

## Remaining completion work

1. Finish the exact-source CI gate and protected staging deployment, then record deployed/checkout SHAs and gate/health results.
2. Execute the protected staging live suite and review all thirty repaired answers, private model diagnostics and synthetic report/plan destination receipts. The suite is guarded to the exact staging database name and does not run against production or spend provider tokens in CI.
3. In the existing authorized deployment environment, inspect production runtime SHA, provider, model and output cap without exposing keys. If diagnostics identify an unsuitable routed model or persistent token exhaustion, correct that configuration within the existing provider and rerun behavioral validation.
4. Promote the validated application using the existing production image/SSH workflow, preserve rollback and test public Cat, links, submitted plans, reports and owner readback. Never equate provider acceptance with inbox delivery.

## Future improvements

Use the private model/rejection counters to monitor regressions. Establish an explicit owner report-review routine and a separately verified backup/retention policy. Adopt database uniqueness and a shared limiter only when adding replicas. Physical phone keyboard and accessibility walkthroughs remain useful acceptance follow ups.
