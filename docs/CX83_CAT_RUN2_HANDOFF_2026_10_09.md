# CX83 Labs website | Run 2 to Run 3 handoff

Prepared October 9, 2026, Tulsa. This is the working Run 2 continuity receipt. **Latest mobile QA deployment is still pending; do not treat this draft as final staging signoff.**

PROJECT: CX83 Labs website, Catalyst X83; repository `Mike-CX83/cx83_webapp`, staging branch `staging-host`.

RUN: 2 of 3, real first-party showcase, interactive system map, ownership and product narratives.

HEAD: Merged Run 2 PR #24 and stage commit `fad102a367e1e1f44b31b3f4580f38854e3efaca`; authentic on-dark CX83 logo correction `99b44a5be0989a015a8ddfa93f8e96a0bed6ceb7` was separately deployed with checkout sync and stage health success. Visual mobile QA PR #26 merged at `4effd65ff256191f8ef9587a96a0a6b1ae6cb329`, with final staging deployment pending the serialized Actions pipeline.

COMPLETED:

1. Preserve the entire original first home hero and exact AVIF. Original source markup remained identical to verified Run 1 (1,387-character section), and the hero asset still has blob SHA `3afb58548ceed0dab3c814991d5894ce09c16d5a`.
2. Upgrade the secondary homepage proof to a factual Before / Request / After record with actual first-party Run 1 verification (29 integration tests, 46 browser tests, protected staging), not an invented clip or outside customer case study.
3. Create the responsive seven-layer interactive CX83 architecture map on Home and a new `/how-it-works` page, separating privileged owner AI from public CAT. Native interactive buttons support pointer, touch and keyboard. Layer detail shows examples, allowed access and security boundaries; technical details expand on request.
4. Explain intended software control, hosted responsibilities, licensed rights, third-party costs and optional managed services. No perpetual license or free hosting promise.
5. Improve the Connected Website Platform and Client Brand Studio product narratives, including a real-source-artwork Brand Studio feature and truthful 0.8.4 development status. Neither product is a released customer download or payment flow.
6. Inspect desktop and 390px browser screenshots. Correct the Studio showcase to use the original on-dark CX83 logo; fix vertically wrapping mobile workflow numbers and test logo image loading.
7. Run the consolidated test gate. After the mobile QA correction, TypeScript, ESLint, 29 Vitest integration tests, 54 Playwright browser tests and Next.js production build passed (PR #26 staging check 38018037788). Screenshot review archive available in GitHub Actions.

BLOCKED / OPEN:

* Original showcase video, poster and pack were not available as inspectable raw bytes in the connected CX83 Library. `showcaseMediaReady` remains false and source-backed proof remains live. See `docs/CX83_RUN2_MEDIA_EVIDENCE.md`. Follow-up: obtain source MP4, poster, rights and caption file, inspect real media, then verify browser playback.
* Studio 0.8.4 has not passed final customer visual and Office-file acceptance. Do not activate a download or present product licensing as approved.
* Run 3 inquiry form delivery, proven business inbox recipient, spam protection, idempotency and complete launch/site trust checks remain outstanding. Existing contact data persists to Payload; outbound email has not been independently proven.
* No public production, checkout, customer sale, or real-provider CAT conversation has been independently authorized or proven in this run.
* The exact final deployed Run 2 QA source SHA must be appended after Actions confirms the deployment.

NEXT: Verify the pending final Run 2 staging workflow for `4effd65ff256191f8ef9587a96a0a6b1ae6cb329`, including password gate 401, authenticated site 200, static and optimized image 200, `checkout_sync=ok` and matching `checkoutSha` / `deployedSha`. Then update this receipt and the owner blueprint. Start RUN 3 from Sections 7 and 8 of `docs/CX83_CAT_WEBSITE_BUILD_BLUEPRINT_2026_10_09.md`, rechecking actual HEAD and authorized inbox first. Do not attempt Run 3 mail delivery without verifying the exact company destination and provider.

ARTIFACTS: [Run 2 merged PR #24](https://github.com/Mike-CX83/cx83_webapp/pull/24), [Run 2 mobile visual QA PR #26](https://github.com/Mike-CX83/cx83_webapp/pull/26), [PR #26 full gate](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38018037788), [first Run 2 staging verification](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38017311073), [logo staging verification](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38017456787), `tests/e2e/catRun2.e2e.spec.ts`, `src/components/site/SystemsMap.tsx`, `src/components/site/BrandStudioSpotlight.tsx`, `src/app/(frontend)/how-it-works/page.tsx`, and `docs/CX83_RUN2_MEDIA_EVIDENCE.md`.

Preserve current site, CMS, services, protected stage and existing owner connections. No infrastructure rebuild, new tunnel or second mailbox.
