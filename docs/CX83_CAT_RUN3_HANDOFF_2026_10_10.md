# Homepage refinement checkpoint, October 10, 2026

PROJECT: CX83 Labs website, Mike-CX83/cx83_webapp. Protected staging only.
STARTING HEAD: 8fbd1c4de940e49a3499ba2b5fafc3956cf5ff52, independently checked through GitHub and isolated clone. Older Mac checkout 17b40c3 and its unrelated changes preserved.
STATUS: Completed and independently verified on protected staging. The Run 3 record below is historical.

COMPLETED:
* Read the saved homepage refinement plan and written assessment. Connected Library Page search did not expose the requested files; local deliverables copies provided the complete source. Supplementary audio not transcribed.
* Five homepage sections: opening, actual video, three service summaries, one practical process, closing invitation. Two Start a conversation links to /contact, one Services link, one How it works link and one evidence link inside the expandable transcript.
* Full width visual banner band with proportional original artwork, desktop artwork height about 239px. Original AVIF blob remains 3afb58548ceed0dab3c814991d5894ce09c16d5a. No media or logo bytes changed.
* Optional video captions, native controls, inline playback, existing poster/source and explanation below footage retained. Audio untouched.
* Cat casing across UI, public pages, accessibility names, prompt and error messages. Internal identifiers and visitor permission restrictions preserved.
* Compact footer navigation, verified email and copyright; no repeated sales invitation or company origin label.
* About metadata/headings identify CX83 Labs. Single origin mention in published site-settings and fallback founder paragraph includes meaningful practical change; nursing, hospice, software transition and 2025 founding preserved.
* Dedicated Software retains both products and Studio spotlight. How it works retains map, authority boundaries, ownership costs and real proof. Work retains published records. No dedicated page redesign.
* Existing banner, frontend, catalog, naming and showcase tests adapted to superseded expectations. Active blueprint and brand context now declare the latest direction first.

FINAL VALIDATION:
* Starting staging baseline: 2560x1000, 7834px page height; 390x844, 12066px. Baseline body contains 23 links, including hidden transcript evidence.
* Local TypeScript and lint passed; 43 integration tests passed (local API database test follows its unconfigured database branch). Production build passed. Final GitHub validation supplies configured Postgres and full browser coverage.
* Merged PR #34: https://github.com/Mike-CX83/cx83_webapp/pull/34. Application deployment 1d6d21b4594e81d1b1cce554c2a5b7f009ebdd42 verified by Staging workflow 38084452566 and independent live container and server checkout reads. Workflow passed TypeScript, lint, 43 integration tests, 73 browser tests and production build.
* Independent gate checks: unauthenticated 401, authenticated homepage 200, original and optimized hero 200, video, poster and caption files 200. Workflow: https://github.com/Mike-CX83/cx83_webapp/actions/runs/38084452566.
* Real Chrome measured viewport widths 320, 390, 768, 1440, 2560 and 3440. Each has scrollWidth equal to clientWidth, no horizontal overflow, five homepage sections and proportional full width banner band. At 390x844 the page fell from 12066px to 4299px (64.4% shorter); at 2560x1000 it fell from 7834px to 3587px (54.2% shorter). Full page screenshots inspected at every width.
* Live mobile menu opens/closes, Cat opens/closes and its input/close controls fit 320px. A real public Cat question returned the three approved service areas. Live links reached Contact, Services and How it works. Software retains both products and Studio spotlight. About has exactly one Catalyst X83 mention with preserved founder facts.
* Staging video played and advanced, duration 49.411995 seconds, English text track disabled by default. Transcript disclosure opens/closes with existing evidence link. Baked-in video graphics around 17 seconds are separate from optional caption overlays.
* Published assistant-settings welcomeMessage and extraGuidance corrected to Cat casing; existing model and visitor permissions unchanged. Readback confirmed.
* Evidence saved in Mike's local CX83 project deliverables/CX83_Homepage_Refinement_20261010: before/after screenshots, responsive-metrics.json and verification report. Local Playwright could not launch because browser installation was incomplete; these attempts are not counted as passing tests. Configured GitHub browser suite passed.

BLOCKED / EXISTING LIMITATIONS:
* Separate media follow-up: improve existing video audio and revise baked-in footage graphics (observed around 17 seconds). Original media bytes were preserved; this scoped website refinement does not regenerate the recording.
* Inquiry outbound server OAuth remains the prior Run 3 limitation; this refinement does not activate mail.

NEXT: Mike reviews protected staging. Homepage scope is complete. Media audio/embedded graphics and the prior server mail OAuth limitation remain separate follow-ups. This documentation-only receipt may advance repository HEAD; application deployment above is independently verified and must not be confused with a later receipt SHA.
RECOVERY: Revert scoped implementation commit through staging workflow; restore founder wording from the historical record below if reverting this copy correction. Never reset unrelated changes.

---

# CX83 Labs website | Run 3 final completion handoff

Prepared October 10, 2026, Tulsa. **Status: Run 3 source and protected staging delivery verified; final corrected Gmail scope deployment confirmed by [successful protected Staging workflow 38026834617](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026834617) with unauthenticated HTTP 401, authenticated HTTP 200, original and optimized hero images HTTP 200, `checkout_sync=ok`, matching `checkoutSha=deployedSha=5c04e4092b7ed5d757ef058ceb46588dfaf5a2fd`, and `STAGING DEPLOY SUCCESS`; site-originated outbound notification remains blocked on missing authorized server OAuth.** No public release.

PROJECT: CX83 Labs website, Catalyst X83, `Mike-CX83/cx83_webapp`, branch `staging-host`.

RUN: 3 of 3. Contact capture, saved notification outbox, launch trust polish, comprehensive responsive/accessible route pass.

HEAD: Run 3 first tested and deployed implementation `eec1a5335f636dc568a861a7bef02219bfc992ad`; final corrected tested application source merge `5c04e4092b7ed5d757ef058ceb46588dfaf5a2fd`. Final corrected staging deployed SHA: 5c04e4092b7ed5d757ef058ceb46588dfaf5a2fd. Docs-only receipt commit, if later, must not be mistaken for this application deploy.

COMPLETED:
1. Retained Next.js, React, Payload, PostgreSQL, owner website MCP connection and password-protected DigitalOcean staging workflow; no new stack, tunnel, mail server or database.
2. `POST /api/inquiries` now validates input and JSON size, checks spam honeypot, enforces bounded per-process submission limits and stable retry IDs. The UI shows immediate accessible errors and confirms only genuinely saved data. The earlier asynchronous disabled-Name Playwright flake was repaired.
3. Existing `form-submissions` records hold the inquiry, opaque idempotency token, content digest and durable notification states. A server-owned Gmail adapter addresses only the verified `mike@cx83labs.com` mailbox with the minimum Gmail send-only scope and records provider acceptance separately from independent inbox receipt. An authenticated manual dispatch route excludes in-flight and uncertain rows.
4. Contact visual polish, project/service/software inquiry choices in code and the real Payload form, honest privacy language, consistent CX83 dark surfaces, real logo, FAQ, Working How it works page, Work proof fallback, branded 404, navigational links, mobile focus/touch and staging noindex.
5. Stronger 5xx and unknown provider outcomes remain uncertain rather than being retried blindly. CAT still reads approved public content only and cannot deploy, edit code, access owner tools or read inquiry records.
6. [Merged PR #29](https://github.com/Mike-CX83/cx83_webapp/pull/29) and [merged PR #30](https://github.com/Mike-CX83/cx83_webapp/pull/30) completed verification. Final mail correction [workflow 38026253840](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026253840) passed TypeScript, lint, 38 integration tests, 64 browser tests and production build, without the earlier validation flake. Contact desktop/mobile and How it works mobile screenshot files are available in artifact `homepage-review-38026253840`.
7. First protected staging deploy at [workflow 38025874771](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38025874771) reported `gate_without_password=401`, `site_with_password=200`, both original and optimized hero assets 200, `checkout_sync=ok`, and identical `checkoutSha=deployedSha=eec1a5335f636dc568a861a7bef02219bfc992ad`, followed by `STAGING DEPLOY SUCCESS`. Corrected deploy proof: confirmed by [successful protected Staging workflow 38026834617](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026834617) with unauthenticated HTTP 401, authenticated HTTP 200, original and optimized hero images HTTP 200, `checkout_sync=ok`, matching `checkoutSha=deployedSha=5c04e4092b7ed5d757ef058ceb46588dfaf5a2fd`, and `STAGING DEPLOY SUCCESS`.
8. First `cx83-home-hero` section, original banner `/brand/cx83-labs-hero.avif`, authentic CX83 logos and original styling stayed untouched; AVIF Git blob `3afb58548ceed0dab3c814991d5894ce09c16d5a`.

BLOCKED:
* **Website email notification is not live**. The connected CX83 Workspace Gmail account's synthetic self-message is confirmed as SENT and INBOX, but the website runtime has not been granted its own scoped OAuth credential, so `form-submissions` currently save with a distinct `needs-configuration` notification state. Setting up and verifying the exact send-only server authorization is a separate owner/administrator action. No guessed alias or personal destination was published.
* New public multi-replica or high-volume intake needs shared rate limiting, a database uniqueness constraint and a provider-backed delivery reconciliation scheme. Current implementation is explicitly bounded to the protected single-replica staging.
* Original showcase v2 video/poster/captions unavailable as verified playable sources. Studio 0.8.4 remains in development without customer release, license, checkout or download approval. A live third-party CAT model response was not independently established by these tests.

NEXT:
1. Set up only the dedicated server OAuth client, secret and refresh grant for Gmail send on verified `mike@cx83labs.com`; preserve credentials in `/opt/cx83-webapp/.env` mode 600, not Git. See `docs/CX83_RUN3_MAIL_DELIVERY.md`.
2. Submit one clearly synthetic inquiry through the **actual staging contact endpoint**, verify stored form-submission status and Gmail provider ID and the actual message in the exact authorized inbox. Reconcile uncertain sends against Sent before manual retry.
3. Keep public production, payment activation, customer installer, licenses and media publication behind separate owner approval.

ARTIFACTS: PR #29, PR #30, full CI [workflow 38026253840](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026253840), first Staging [workflow 38025874771](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38025874771), final corrected staging [workflow 38026834617](https://github.com/Mike-CX83/cx83_webapp/actions/runs/38026834617), `docs/CX83_CAT_WEBSITE_BUILD_BLUEPRINT_2026_10_09.md`, `docs/CX83_RUN3_VISUAL_EVIDENCE_MANIFEST.md`, `docs/CX83_RUN3_MAIL_DELIVERY.md`, `tests/e2e/catRun3.e2e.spec.ts`, `tests/e2e/contact.e2e.spec.ts`, `tests/int/inquiryMailer.int.spec.ts`, and preserved `tests/e2e/homeBanner.e2e.spec.ts`.

**Source and deployment truth:** The corrected application and protected staging source are verified at the exact same commit `5c04e4092b7ed5d757ef058ceb46588dfaf5a2fd`. This final handoff is documentation, not evidence that Google Workspace server OAuth is configured or that a website-originated email was delivered. A later documentation-only commit will advance GitHub HEAD and must itself pass its separate staging workflow before that newer SHA is described as deployed.
