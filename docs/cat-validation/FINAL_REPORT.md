# Cat repair and validation report

Status: the repaired Cat is live on public production. Protected staging and production use OpenRouter with `google/gemini-2.5-flash` because the free-model daily quota was exhausted. Website inquiry mail for `hello@cx83labs.com` is authorized, provider-accepted, and present in the CX83 inbox. One continuity scenario still misses an approval constraint. The staging checkout has one preserved uncommitted type edit, so it does not match the deployed image.

## Confirmed root causes

| Completion requirement | Result |
| :--- | :--- |
| Screenshot failures diagnosed and regression tested | Passed; actual baseline reproduced classifiers, blank completions and contact defects. |
| Contact responses and approved links | Passed in three staging scenarios and browser regression tests. |
| Internal metadata excluded from normal answers | Passed automated real SDK route checks; unavailable staging inference cannot prove model quality. |
| Problem reports reach authorized review | Passed staging save and private owner readback. |
| Explicit plans reach existing inquiry workflow | Passed staging save/readback; email notification authorization remains missing. |
| At least thirty documented scenarios | Executed and documented; repaired acceptance is three passed, twenty-seven blocked. |
| Mobile usability and relevant security checks | Automated desktop/Android/iPhone emulation, database access, limits and consent passed. Physical devices untested. |
| Production deployment and postdeployment checks | Blocked; existing SSH access unavailable, live provider acceptance and mail verification outstanding. |

The default GitHub main branch contains the older Ask CX83 widget. Production launch source 6489a0b and staging base fe89b67 share the current Cat frontend/backend. Cat uses the existing Next.js/assistant-ui frontend, Next API route, Payload knowledge/settings and AI SDK provider adapter. The exact running production SHA and configured/routed model have not been inspected on the server.

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
* Staging release workflow 38225103031 repeated 203 integration and 184 browser passes, TypeScript, lint and build, then successfully deployed. Source and owner checkout match 5048fce, whose file tree exactly matches tested a8ab09a.
* Thirty repaired staging scenarios executed: S10, S11 and S12 passed contact answer review; 27 model scenarios returned 503 before a completion. The owner suite recorded 202 passes, 27 failures and five CI-only skips. No model answer quality pass is claimed for unavailable responses. A separate probe confirmed AI_APICallError with provider HTTP 429. Read only key quota check: HTTP 200, free requests used 51, daily ceiling 50, remaining 0. Provider/model configuration was OpenRouter/openrouter/free; routed model remains unknown. Full results and manual assessments are in STAGING_REVIEW.md and staging-validation.json.
* Real CI database tests proved saved report/plan rows, deduplication, blocked anonymous reads/creates and expiry masking. Live staging synthetic report and confirmed plan both saved and were read back from private owner form submissions, record IDs 5 and 6. Plan notification was needs-configuration. Gmail provider acceptance and recipient inbox delivery were not verified.
* The staging owner runner initially referenced missing pnpm 12.11.2, then inherited production React/Vite mode. Temporary pnpm 11.28.5 and NODE_ENV=test settings allowed the real guarded suite to run. All temporary package, route diagnostic and test edits were restored and compared with original source. No production credentials or private visitor data were accessed.

## Changed files

* `.github/workflows/staging-image.yml`
* `docs/cat-validation/BASELINE_REVIEW.md`
* `docs/cat-validation/RUN1.md`
* `docs/cat-validation/RUN2.md`
* `docs/cat-validation/production-baseline.json`
* `docs/cat-validation/FINAL_REPORT.md`
* `docs/cat-validation/STAGING_REVIEW.md`
* `docs/cat-validation/staging-validation.json`
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

Protected staging deployment succeeded at 2026-10-12 09:09 UTC. Receipt: gate_without_password=401, site_with_password=200, static_image=200, optimized_image=200, checkout_sync=ok, deployedSha=checkoutSha=5048fce34c44dab6c6ce65c414aa4cceed49b1eb, previous_image=present. Rollback uses cx83-webapp:staging-previous, preserved by the established deployment script. No unrelated container change was reported.

That paragraph described the state before this release. The production deployment and its rollback image are recorded below.

## Release completion, October 12

Cursor took mailbox task task-67525552 once. The local webapp checkout was left on its dirty `staging-host` work. Release commands used an isolated copy and the existing server.

### CI and staging

PR 47 remains merged at `ab53e2a12aec523f316168e7adf825ea9ec81d82`. PR 48 merged at `52c989c62c401fc2be2e8b75fd37afb492e78f98`. Main CI run [38278011679](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38278011679) installed Chromium and WebKit, then passed 203 integration tests and 184 browser tests. Staging workflow [38278007231](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38278007231) passed the same check, built the image, and deployed. Receipt: `gate_without_password=401`, public image checks passed, `deployedSha=52c989c62c401fc2be2e8b75fd37afb492e78f98`, `previous_image=present`. The server checkout stayed at `5048fce34c44dab6c6ce65c414aa4cceed49b1eb` because `src/payload-types.ts` has a preserved uncommitted 10-line addition for the repository status tools. That file was not reset.

### Provider

The shared OpenRouter key still had `free_model_daily_requests` at 51 used, limit 50, remaining 0, and zero prepaid credits. The key spending cap had $100 remaining and $0 spent. A paid completion on the same provider succeeded, so staging and production `OPENROUTER_MODEL` is now `google/gemini-2.5-flash`. `AI_PROVIDER` remains `openrouter`. Output cap remains 800. After the live runs, key usage was about $0.024 and about $99.98 of the cap remained. The free daily counter was unchanged.

### Mail

A dedicated desktop OAuth client in the existing internal Google Cloud project `cx83-labs-pilot` was granted only `https://www.googleapis.com/auth/gmail.send` for `mike@cx83labs.com`. The refresh token issues an access token. ChatGPT and the student Gmail connector were not used. Staging and production env files now set `CX83_INQUIRY_TO=hello@cx83labs.com` and the website grant. Values stay in the mode 600 env files.

Staging synthetic plan record 8 returned `provider-accepted`, provider id `1a13115acd5a4509`. The message `[CX83 website] project inquiry #8` was unread in the `mike@cx83labs.com` inbox. Staging report record 7 saved with source `cat-report` and does not send mail. Production plan record 10 returned `provider-accepted`, provider id `1a13127d0b8fa7d5`. `[CX83 website] project inquiry #10` was unread in the same inbox at 12:27 PM. Production report record 9 saved with source `cat-report`.

### Thirty live staging scenarios

Executed against the deployed container at `52c989c`, model `google/gemini-2.5-flash`, through the real `/api/chat` route. All 30 returned HTTP 200. Automated keyword checks passed 24. Manual review of the actual answers accepts 29. S21 is not accepted: the follow-up asked to keep the owner approval step, and the reply asked about the inquiry process without restating that constraint. S07, S16, S22, S23, and S24 failed a narrow keyword rule but the answers were correct: development status, a clarifying question, a one-sentence intake summary, a medical refusal, and a private-conversation refusal. Contact scenarios S10 through S12 returned the approved contact form and `mailto:hello@cx83labs.com`. No internal metadata or unapproved links appeared.

A phone-sized browser session on protected staging opened Cat, showed `Assistant configured`, rendered the email answer with the mailto and contact links, opened Report a problem with confirmation and optional attachment, reset back to the welcome state, and followed the contact link to `/contact#contact-form` with the inquiry form present. The mobile menu stayed collapsed. Public production then returned the same mailto answer and a real services answer, and the homepage plus three images returned HTTP 200.

### Production

The pre-repair production runtime was image `cx83-webapp:production` `9819d080f3cc`, SHA `6489a0b206ed2835f04e1cf281371f400ec428e7`, OpenRouter `openrouter/free`, output cap 800. That image was tagged `cx83-webapp:production-previous` before replacement and is still present. PR 46 merged at `1dbc4454ee2df9719551332145698fe3535774e3`. Its tree matches staging `52c989c`. Production image workflow [38283425894](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38283425894) succeeded. The loaded image is `8f712d4d16c98daca8ababc7ac59b265670037acb0611391b572507783a6b4da`. The running container reports SHA `1dbc4454ee2df9719551332145698fe3535774e3`, provider `openrouter`, model `google/gemini-2.5-flash`, output cap 800, and `CX83_PUBLIC_LAUNCH_APPROVED=true`. Public homepage returned HTTP 200.

## Remaining limitations

1. S21 did not keep the stated owner-approval constraint. The provider was not changed for that answer.
2. The staging git checkout is still `5048fce` because of the preserved `src/payload-types.ts` edit. The running staging image is `52c989c`.
3. No physical phone or native Safari pass was performed. Browser coverage is the automated suite plus one phone-sized staging session.
4. This report commit is documentation on the repair branch. It is not a second production image.

## Resumed execution, October 12

The release completion section above is the current record. The notes below are the earlier checkpoint.

Mike reaffirmed execution authority. The repair branch now pins pnpm 11.28.5, matching existing CI/Docker configuration, and sets NODE_ENV=test for the integration check subprocess. Running the check from NODE_ENV=production passed 198 local tests; 31 live/destination and five CI database cases remained intentionally skipped. This removes the two check runner defects without changing the web server runtime, dependencies, provider, or model.

A bounded remaining production work order was submitted to the existing cursor-client-brand-studio operator through CX83 Agent Mailbox, task task-67525552. Submitted does not mean accepted or running; independent production verification remains required. The operator is instructed to use existing authorized local/server access, preserve rollback, resolve legitimate provider/mail configuration, rerun actual behavior, and use the established production deployment workflow without routine approval prompts.

The check configuration update will use the existing protected staging workflow. Previously completed application tests remain evidence for that source; the new check configuration needs its own release receipt.

A fresh read only capacity probe on the existing staging credential returned HTTP 200 for both account credits and quota. It reported no prepaid capacity and zero free requests remaining. Only those booleans/counters were logged; no credentials, financial balances or key labels were retained. The generated thirty-scenario evidence was restored after the probe. The local operator task remains submitted, with no acceptance/execution receipt observed at this checkpoint.

Runner repair PR 47 passed CI workflow 38255383381: 203 integration tests, 183 browser tests passed, one existing Interior Run 3 utility navigation test passed on retry after a five second URL timeout, plus TypeScript, lint and build. It merged at ab53e2a12aec523f316168e7adf825ea9ec81d82 and its staging release workflow is 38258040734. The separate existing main promotion PR 2 also runs CI; that workflow still installed only Chromium, causing missing WebKit executable failures for Cat's iPhone project. Its browser installation is corrected to the same chromium webkit command already verified in the successful staging workflow. This is a CI configuration change, with no application or test assertion change.

This cloud browser could not open protected staging, returning ERR_BLOCKED_BY_CLIENT before page load. The password gate was preserved; no live browser pass is claimed. Provider aggregate activity covers completed UTC days and cannot establish today's per-conversation routed model. Routed model identity remains unverified until a completion or a valid runtime receipt is available.

## Future improvements

Monitor provider request capacity and private model/rejection counters. Establish an explicit owner report review routine and separately verify backups/retention. Adopt database uniqueness and a shared limiter when adding replicas. Physical phone keyboard and accessibility walkthroughs remain useful acceptance follow ups.

Operational reference: OpenRouter documents the read only quota endpoint and handling of 429 platform/upstream limits at https://openrouter.ai/docs/api_reference/limits. The exhausted quota stated here was directly measured, not inferred from that documentation.
