# CX83 interior Run 1 execution handoff

PROJECT: CX83 Labs website, `Mike-CX83/cx83_webapp`.
RUN: Interior Run 1, Services and inquiry journey.
STATUS: PARTIAL checkpoint, October 10, 2026 at 9:08 PM CDT. Implementation is committed in PR 37. Typecheck and lint passed. The full test stage in Staging run 38102465237 has remained active for nearly thirty minutes without a completed job log; screenshots, build, merge and deployment remain unverified. The cloud browser also cannot open live staging under its URL policy.
HEAD: Starting and verified baseline runtime `72f26fa1d92ce86735c874b608ba1397418f8ac0`. Run branch `chatgpt/interior-run1-2026-10-10`. Original planning documents copied at `5cd74a1c89dfd72d684007b93386558543f95cc9`. Current application and test source before this documentation checkpoint: `d62b96d366b7ae4eb99c47b6752ec5e1c4542dd9`, [PR 37](https://github.com/Mike-CX83/cx83_webapp/pull/37). This later documentation checkpoint changes no application files. No Run 1 application merge or deployment is claimed.

## COMPLETED

1. Read the authoritative Library plan and unchanged approved About companion, current staging HEAD, latest Cat header handoff, project instructions and established `chatgpt-cx83-website` inbox. Sent scoped intent to `codex-cx83-website` in `thr-3d5ad289`.
2. Saved the exact master and approved companion in `docs/`. The companion SHA256 is `9c96b68e61c664f787a5cfb6f2d2250b7da1e08efa4b0dc0fe9a94d000b75547`. The About route is not changed in Run 1.
3. Implemented compact opt-in interior components, balanced Services choices and a consistent three-service detail sequence with fit, CMS deliverables, truthful examples, scope and one contextual inquiry action.
4. Implemented Contact with a short opening, form first in document and phone order, supporting explanation beside it on desktop, optional Organization and autofill hints. Implemented all five validated context identifiers without a CMS schema migration.
5. Reconciled the unavailable-database service fallback to the three current published service identities. Preserved the separate About fallback and every populated service copy field.
6. Added the existing homepage `#showcase-title` heading to the existing 6.25rem scroll-margin selector. This fixes the new service demonstration link beneath the sticky header without changing homepage layout, copy, media or artwork.
7. Added focused integration and browser coverage, measured screenshot captures, and a minimal addition to the existing review artifact paths. No deployment permissions, infrastructure, credentials or mail configuration changed.

## CMS CHANGES

None. The connected service records were read only. CMS names, short descriptions, descriptions and capability labels render unchanged. Each original `callToAction.label` is retained as the detail page's closing invitation heading. Its existing `/contact` destination is enriched with the validated interest and existing form anchor; the visible human action is consistently Start a conversation.

| Record ID | Published slug | Previous and new CMS values |
| :--- | :--- | :--- |
| 3 | `websites-and-business-tools` | Unchanged |
| 2 | `automation-and-integrations` | Unchanged |
| 1 | `ai-setup-and-workflows` | Unchanged |

Site settings contact email `mike@cx83labs.com` remains the approved alternative. Scheduling URL was empty and no calendar action was added. No public page record, inquiry record, assistant setting, product record or global setting was changed through the connector.

## IMPLEMENTED CONTRACT FOR RUN 2

`src/forms/inquiryContext.ts` is the single canonical interest map. Its `inquiryContextHref` helper returns the Contact query plus `#contact-form`. Contact parses the server page's asynchronous `searchParams`; unknown and repeated values produce a neutral general inquiry. Client and server validate the selected token and compatible category. Selected interest is shown before submission and stored as a canonical context line in the existing message field. The visitor's message remains separate while editing.

| Context identifier | Stored inquiry category |
| :--- | :--- |
| `websites-and-business-tools` | `project` |
| `automation-and-integrations` | `services` |
| `ai-setup-and-workflows` | `services` |
| `connected-websites` | `software` |
| `client-brand-studio` | `software` |

Changing category clears an incompatible interest. Selecting or clearing an interest retains the typed visitor fields. An unchanged ambiguous retry reuses its request ID; a changed inquiry receives a different ID. Existing server locking, persistence, honeypot, field limits, rate limits and truthful saved confirmation remain. Notification delivery is a separate existing operation and has not been enabled.

### Reusable presentation

Use `InteriorHero` and `InteriorSection` from `src/components/site/InteriorPage.tsx` inside `cx83-interior-root`. The imported `interior.css` requires explicit interior or refined Contact classes. It reuses existing Geist, palette, 72rem content edges and action styles. Introductions have a 66ch measure and longer explanations use about 68 to 72ch. It does not change `Section`, `PageHero`, the root layout, Home or Cat.

Services use three equal columns from 1200px, full-width cards with two internal columns at tablet sizes, and concise stacked cards on phones. Contact places the form first and uses a side explanation from 1024px. New or changed controls target at least 44 CSS pixels. No new font, component library, asset or animation framework was added.

## VALIDATION

Baseline only: Staging workflow [38095487840](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38095487840), deploy job `114342435869`, established runtime and checkout at the starting SHA with unauthenticated 401 and authenticated page/media 200. This is not Run 1 deployment evidence.

Run 1 validation: TypeScript (`pnpm exec tsc --noEmit`) and lint (`pnpm lint`) passed in [Staging run 38102465237](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38102465237), check job `114361052856`, for source `d62b96d366b7ae4eb99c47b6752ec5e1c4542dd9`. Its `pnpm test` step began at 01:39:30 UTC and was still active at 02:08 UTC. The previous baseline test stage took 5m05s. The active job log endpoint returned 404 and the check had no diagnostic annotations. A pending test stage is not a pass. The full integration/browser results, screenshot review and production build remain pending. New browser tests use copies of current published service wording only in guarded local CI PostgreSQL, plus a neutral fallback loader test. They are not actual protected staging screenshots. Required viewports are 320x740, 390x844, 768x1024, 1440x1000, 2560x1440 and 844x390. All service detail journeys are exercised on phone and desktop.

Independent source review identified and resolved query-navigation state synchronization, pending-response timing, form-anchor continuity and narrow selected-interest layout before the current CI run. The initial check at `56cb276dfd1a6c59a9cadd61a76db3a00ceae6b7` failed on unsupported Testing Library role options in the new component tests; those options were corrected at `d62b96d366b7ae4eb99c47b6752ec5e1c4542dd9`. No confirmed source defect explains the current prolonged test stage. Actual screenshot inspection and exact test counts must be entered after a completed run. The current application tree preserves all 20 baseline asset and component hashes listed below. Both original planning copies were read back from GitHub and match the Library text exactly.

## ARTIFACTS

1. `docs/CX83_WEBSITE_INTERIOR_REFINEMENT_EXECUTION_PLAN_2026_10_10.md`.
2. `docs/CX83_ABOUT_STORY_APPROVED_2026_10_10.md`.
3. [PR 37](https://github.com/Mike-CX83/cx83_webapp/pull/37), run branch `chatgpt/interior-run1-2026-10-10`, and [current validation run 38102465237](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38102465237).
4. Existing GitHub browser review artifact will include `interior-*.png` and `interior-metrics-*.json` in addition to the preserved homepage captures.

### Preserved baseline Git blob hashes

These Git SHA1 blob identifiers come from the actual starting tree. They must compare unchanged against the final application tree.

| Path | Git blob SHA1 | Bytes |
| :--- | :--- | ---: |
| `public/brand/PROVENANCE.md` | `c2a3ed301ef4e4c55899d21ecf4c9a0fdbe57075` | 1040 |
| `public/brand/README.md` | `10179ca99c99d0b071333eafefa80e2b39aabef3` | 293 |
| `public/brand/cx83-atmosphere-wide.webp` | `28c0291196dca68cc65029af75109475ce779053` | 130792 |
| `public/brand/cx83-labs-hero.avif` | `3afb58548ceed0dab3c814991d5894ce09c16d5a` | 4767 |
| `public/brand/logo-dark.svg` | `dda8f55ffb46259dfceed4ee94f11a3496153fb7` | 4610 |
| `public/brand/logo-light.svg` | `fd036c0ae3a46d8c8a70617088e5b72646894317` | 4349 |
| `public/brand/symbol-showcase.svg` | `8d064852cc97abb0253c6038987489631414b4c5` | 680 |
| `public/connections/README.md` | `4089eaa354db0b84760f640dc42b15693773fe51` | 668 |
| `public/connections/cx83-connections-overview.webp` | `3e5c7c2e462d9542ce179858dccf3376a9407a56` | 168296 |
| `public/connections/cx83-customer-connections.webp` | `8799b988a1509b9c01aebd8d1325e6aba27eb498` | 128432 |
| `public/connections/cx83-marketing-connections.webp` | `59fcd61976ccfeaf8f716e1480b216024fd62404` | 145138 |
| `public/connections/cx83-operations-connections.webp` | `40c0b5920afb5b4371e3329226e0c474d24d958b` | 167892 |
| `public/showcase/README.md` | `94d30ee591bad195206307fa5cb13c495d97c861` | 3518 |
| `public/showcase/cx83-website-showcase-poster-v2.jpg` | `e72924405b648d6f22a8bc9f4e101b6b85dc5723` | 362476 |
| `public/showcase/cx83-website-showcase-v2.en.vtt` | `fab96a084bcf755a37e87d74ec7e3899c4403d21` | 1050 |
| `public/showcase/cx83-website-showcase-v2.mp4` | `27ea8261d137add910fc156799451f4f3bd1999d` | 2037276 |
| `src/app/(frontend)/page.tsx` | `5ad8a992f6a651e1f71904e638b979754ddbeeb7` | 6710 |
| `src/components/assistant/AssistantWidget.tsx` | `37cddef8e819808651bc0293f66dcdd747bfe413` | 8102 |
| `src/components/site/SiteFooter.tsx` | `b9aedce363fd24a46c4bd861889bb192c10345e8` | 2161 |
| `src/components/site/SiteHeader.tsx` | `45540bab3a2362faeac935798afc011d94a3ff86` | 4546 |

## BLOCKED

Validation is unresolved while the full test step remains active and its detailed log is unavailable. Saving this checkpoint uses the existing PR concurrency behavior, which supersedes an older PR run when the branch advances. Inspect that completed or canceled run for actual failure details, correct only evidenced defects, and obtain a full passing run for the eventual merge head. Do not bypass a failed or incomplete check.

The cloud browser attempt to open protected staging returned `ERR_BLOCKED_BY_CLIENT`, followed by an explicit browser URL policy rejection. No further or indirect attempt to that blocked browser action is authorized. Existing GitHub CI can validate its local application and expose screenshots, but it does not possess the live staging gate credential. The restricted deployment identity only runs the existing deployment operation and cannot be repurposed for remote commands.

The remaining specific capability is an authenticated browser walkthrough of the deployed staging commit using existing access. Obtain Mike's approval for Work only for that step if it is still required after all connected-tool work. Keep this run partial until the defined live review passes. Do not infer live rendering or model behavior from fixtures or source reads.

## DEFERRED

Run 2 and Run 3 are not started. Video audio and embedded recording graphics, server inquiry email OAuth, privacy/retention decisions, production launch, payments, client publishing permissions and customer installers retain the master's explicit holds.

## NEXT

Inspect the superseded run log as soon as it is available, resolve any concrete test failure and complete the consolidated CI. Inspect actual downloaded screenshots, then merge only the exact passing source and verify the existing protected staging push workflow and matching deployed/checkout SHA. Then finish the bounded live browser review or preserve its exact checkpoint for Mike's approved Work continuation. Record the PR, application SHA, screenshots and actual results here and update the master ledger and current pointer.

## RECOVERY

Revert only this run's application changes through the existing protected staging process. No CMS fields require restoration because none were changed. Preserve newer unrelated work. Baseline recovery reference is `72f26fa1d92ce86735c874b608ba1397418f8ac0`; do not reset the branch to it. No rollback has been performed or tested.
