# STOP CHECKPOINT, October 10, 2026, 11:53 PM CDT

PROJECT: CX83 Labs website, `Mike-CX83/cx83_webapp`.
RUN: Interior Run 2.
STATUS: PARTIAL, implementation saved, verification FAILED, NOT MERGED, NOT DEPLOYED. OWNER REQUESTED STOP. Resume only on Mike's explicit instruction.
HEAD: Isolated implementation branch `chatgpt/interior-run2-2026-10-10`, current precheckpoint head `ac7664505242f5ebacd345e7d8fb81f60aa06eb9`. PR 38 remains open against `staging-host`. The documentation commit carrying this checkpoint is a later receipt, not a tested application SHA.

## COMPLETED AND SAVED

The full Run 2 source work is preserved on this branch: Software catalog, both product details, Work and existing project/case detail templates, How it works, scoped responsive styling, reuse of Run 1 validated inquiry contexts, authentic original artwork and showcase poster, and new browser/integration tests. Run 1 COMPLETE base is `dd12c886d4ff183a29c447d19fa70cd7869b7669`. Published Work CMS Projects and Case Studies were read only and each returned zero records at initiation. First party website evidence was used; no client case was invented. Approved Studio product status was cross-checked against the owning repository `plugins/client-brand-studio/STATUS.md` on branch `client-brand-studio-completion`: 0.8.4 is an unreleased, unapproved internal draft, not a commercial release.

Independent before/after Git blob comparisons established that Home, Cat, SiteHeader, SiteFooter, authentic symbol/logo, original banner, showcase video/captions/poster and all three connection visuals remained unchanged. No CMS, production, product, schema, credentials, outbound email or billing changes were made.

## VERIFICATION TRUTH AND WHY EXECUTION STALLED

The isolated GitHub PR workflow has passed TypeScript and lint repeatedly, but the full suite has NOT passed. Earlier run `38108991003` failed with 96 browser tests passing and 26 failing. Its captured job logs demonstrated a concrete application defect introduced by Run 2: use of the real `/showcase/cx83-website-showcase-poster-v2.jpg` in `next/image` was rejected by `images.localPatterns`, causing HTTP 500 on affected pages. That exact path was added to `next.config.ts` without modifying the image itself. Another failure showed a 320px viewport measuring 322px on How it works; the new proof link was adjusted for reflow. Screenshot artifact naming, lazy image capture handling, and one stale test expectation were also repaired.

After those fixes, another commit amended image inspection to consider visible artwork only. The latest full PR check is [workflow 38112151727](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38112151727). Its check job reports **failure** at the automated test step, with TypeScript and lint successful and production build skipped. Its final failure causes and exact test list have **NOT** been inspected or resolved. Do not assume the image fix or 2px overflow fix was sufficient. No green PR gate exists; no merge, staging deployment, screenshot acceptance or live staging verification has occurred. Earlier PR checks were canceled when newer branch commits superseded them, which repeatedly restarted the full CI suite and increased elapsed time. The long suite and iterative failures are demonstrated obstacles; no evidence establishes a ChatGPT context window failure.

## ARTIFACTS AND EXACT RESUME POINT

PR: https://github.com/Mike-CX83/cx83_webapp/pull/38
Branch: `chatgpt/interior-run2-2026-10-10`
Application head before this documentation checkpoint: `ac7664505242f5ebacd345e7d8fb81f60aa06eb9`
Latest failing workflow: https://github.com/Mike-CX83/cx83_webapp/actions/runs/38112151727
Prior inspected error workflow: https://github.com/Mike-CX83/cx83_webapp/actions/runs/38108991003
Earlier failed run 38108991003 visual artifact ID 11690827596 (failed CI evidence, not approved visual review). Do not treat it as a successful screenshot pass.

## BLOCKED

1. Exact latest CI failure must be diagnosed from completed job logs, without guessing.
2. Passing full browser/integration suite, production build and visual comparison still required.
3. Protected staging deploy and exact running application SHA verification, then authenticated live page review still required. Ask Mike for a *specific bounded* Work continuation only if the authenticated browser capability is the actual remaining blocker, rather than restarting Run 2.

## NEXT, WHEN MIKE EXPLICITLY RESUMES

Inspect completed workflow 38112151727 test failure log first, make focused repairs on the same Run 2 branch, and avoid repeated full CI triggers while edits are incomplete. Run complete verification once changes stabilize. Inspect the actual screenshots including 320, 390, 768, 1440, 2560 and 844 by 390, check media and anchors, then follow the existing PR merge and protected staging process only after all gates pass. Update this handoff and the master ledger with exact verified results. Preserve Run 1 and all unrelated work. **No actions are authorized after saving this checkpoint until Mike gives another instruction.**

---

PROJECT: CX83 Labs website, `Mike-CX83/cx83_webapp`.
RUN: Interior Run 2, Software, Work and How it works.
STATUS: IMPLEMENTED ON ISOLATED BRANCH. Tests, visual review, merge and protected staging verification PENDING.
HEAD: Started from verified Run 1 documentation `dd12c886d4ff183a29c447d19fa70cd7869b7669`. Implementation branch `chatgpt/interior-run2-2026-10-10`. Final tested head, merged application SHA, deployed runtime and documentation receipt must be recorded only after observation.

# Interior Run 2 execution record

## COMPLETED

1. Read the repository master, COMPLETE Run 1 handoff, starting staging HEAD, authorized personal CX83 website inbox, software source and published Work CMS counts. Sent implementation intent to the existing `codex-cx83-website` thread `thr-3d5ad289`.
2. Built two balanced Software cards using the real website poster and authentic CX83 brand symbol. Status remains In development, with exactly one detail action each, a shortened authentic Studio editorial note and one general closing Contact action. No purchase, trial, installer or checkout.
3. Reworked both product details with the Run 1 compact `InteriorHero` and `InteriorSection`, return links, workflow or source-artwork illustration, clear requirements and separate costs. Both product Contact actions reuse `src/forms/inquiryContext.ts` and point to the canonical validated interest and form anchor. Neither page claims a customer release.
4. The Connected Website Platform leads from an owner request to review and configured publication. It links to the authentic Homepage video and the dated first party Work evidence. No duplicated autoplay player.
5. The Client Brand Studio source artwork is explicitly an editorial illustration, not an approved output or screenshot. The catalog spotlight opens the Studio detail; the detail variant opens `#studio-review` and never links to itself. Retail version detail was deliberately omitted pending independently qualified release evidence.
6. Work now features one actual CX83 website first party implementation anchored at `#cx83-connected-website`, with genuine poster, request, implementation, review, tests and dated staging proof. Existing CMS projects and case studies still render when published; empty CMS does not generate fictional customer records. Real published detail templates use the same compact layout and Work return.
7. How it works preserves the three original provider logo workflow illustrations, their text, the optional technical map and its controls. Adds a compact Customers/Marketing/Operations anchor guide; compresses ownership and keeps all historical public anchors including `#real-proof`. The short proof pointer now leads to the substantial Work case.
8. Only scoped new CSS and in scope source/test files were changed. Homepage, Cat, SiteHeader, SiteFooter, original media and provider logos were not edited.

## SOURCE EVIDENCE AND PUBLIC CLAIMS

* Run 1's passing application from October 10, 2026: `f67a118cb9c3438d1b8877276d5506b42dab9210`; PR 37; protected Staging workflow `38105293745` with 77 integration tests, 111 browser tests and successful deployed runtime verification. Separate authenticated live review at 10:06 PM CDT established Run 1 COMPLETE. The exact current Run 2 build will need its own validation and release evidence.
* Homepage video and poster: `/showcase/cx83-website-showcase-v2.mp4`, `/showcase/cx83-website-showcase-poster-v2.jpg`, English optional `/showcase/cx83-website-showcase-v2.en.vtt` are already established media. Run 2 does not edit their bytes or reproduce the player.
* Original Studio symbol `/brand/symbol-showcase.svg` and logo `/brand/logo-dark.svg` remain original brand art, not Studio generated output. The current repository's earlier `docs/CX83_RUN2_MEDIA_EVIDENCE.md` recorded 0.8.4 as an October 9 development draft, not approved for retail. No independently approved output was found, so the honest source-artwork illustration is retained and the product stays In development.
* The connected CMS read at Run 2 initiation returned zero published Project records and zero Case Study records. No identifiable client, customer outcome, logo or private project data has been published.
* Verified links: `/contact?context=connected-websites#contact-form`, `/contact?context=client-brand-studio#contact-form`, `/#showcase-title`, `/work#cx83-connected-website`, and historical `/how-it-works#real-proof`. Automated and live checks remain pending.

## CMS CHANGES

None. CMS Projects and Case Studies were read only, 0 records each at start. No software catalog, site settings, service, inquiry, assistant, global, credentials, schema, notification or client record was mutated. Isolated CI fixtures are designed to be guarded and cleaned up, never run against staging.

## VALIDATION

PENDING: TypeScript, lint, full Vitest, full Playwright suite including six viewport screenshot matrix, production build, rendering review, preservation source comparison, protected staging push release and authenticated current CMS behavior. New Playwright tests cover product context paths, both Studio variants, the real video and dated Work proof, old anchors, optional map and FAQ keyboard disclosure, empty CMS and published synthetic CMS fixture paths, missing slug 404 and responsive captures. CI evidence is not a substitute for current live staging validation.

## ARTIFACTS

Implementation branch `chatgpt/interior-run2-2026-10-10`. Scoped source `src/app/(frontend)/interior-run2.css`; automated tests `tests/e2e/interiorRun2.e2e.spec.ts`, `tests/e2e/interiorRun2WorkCMS.e2e.spec.ts`, `tests/int/interiorRun2.int.spec.ts`. The future PR, workflow, screenshots, exact hashes and deployed runtime need insertion once verified.

## BLOCKED

No coding blocker identified. Authenticated current staging browser review and workflow evidence still need capability checks.

## DEFERRED

Approved Studio output or interface screenshots await an actual authorized and visually accepted export. Product installer, download, pricing, checkout, customer production and outgoing inquiry email remain separate release decisions. About and Cat public knowledge updates remain Run 3.

## NEXT

Complete branch validation and visual evidence review. Merge only after checks and preservation inspection. Deploy solely to existing protected staging, independently verify running release and capture live current CMS behavior. Save the exact result and update the interior master ledger and historical continuity pointer. If authenticated live browser access proves unavailable here, preserve all work and record a narrowly scoped Work continuation rather than declaring Run 2 complete.

## RECOVERY

If a scoped defect requires rollback, revert only this Run 2 application change through the existing protected staging process. There were no CMS mutations or schema migrations to undo. Preserve Run 1 and all unrelated later work.
