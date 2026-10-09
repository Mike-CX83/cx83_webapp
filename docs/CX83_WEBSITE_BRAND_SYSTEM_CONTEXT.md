# CX83 Labs Website
## Brand System, Content Context, and Product Roadmap

**Document:** CX83_WEBSITE_BRAND_SYSTEM_CONTEXT.md  
**Version:** 1.0, October 9, 2026  
**Project:** CX83 Labs public website and future software storefront  
**Owner:** Mike  
**Status:** Planning reference for review. The website is not authorized for a public launch by this document.  
**Working codebase:** [Mike-CX83/cx83_webapp](https://github.com/Mike-CX83/cx83_webapp)  
**Planning base:** `staging-host`, October 9, 2026  
**Other owners:** Client Brand Studio owns brand package generation; the CX83 business plan lives in `Mike-CX83/ai-agent-delivery`.

> **North star:** The website must look, feel, and behave like one CX83 product across every route. Its design should make complex software understandable to an ordinary business owner. More importantly, the website itself should provide verifiable evidence of the software CX83 is building.

### How to use this document

This is the durable brief for ChatGPT, Cursor, and other authorized CX83 website agents. Read it before editing the site. Preserve completed work and amend this file when a decision or capability actually changes. Its purpose is not to re-create the business plan, duplicate the Brand Studio engine, or claim unfinished software is for sale.

**Status vocabulary:** `CONFIRMED` means observed from current source code, connected CMS, or authentic existing assets. `OWNER SELECTED` is a stated preference or chosen visual direction, not necessarily completed customer acceptance. `DRAFT` is a proposal or working product. `PLANNED` is not implemented. `NEEDS VERIFICATION` requires a current functional check or proof. `APPROVED` requires an explicit recorded owner decision. `LIVE` requires observed deployment and tested behavior, not merely a Git commit or passing build.

Do not convert a draft, preference, screenshot, prototype, or passing test into a product release or a performance claim.

## 1. What CX83 Labs is

**Brand name:** CX83 Labs  
**Current short descriptor:** AI Systems, Automation, and Business Integration.

**Plain English explanation for customers:**

CX83 Labs helps businesses make their software work together, reduce repetitive tasks, and build better websites and business tools. Instead of requiring a developer for every routine change, CX83 can connect supported AI tools to the business's software so authorized owners can describe what they need in a conversation. The connected system can make, test, and prepare actual software changes, subject to the workflow and publishing controls configured for that customer.

A visitor should understand the business without knowing what GitHub, MCP, Payload, Docker, PostgreSQL, or an API is. Technical detail belongs on secondary pages, diagrams, or product documentation.

### Three connected offers, not three competing identities

1. **Services:** Workflow and Systems Assessment, scoped AI or automation implementation, and optional ongoing support. These are engagements with a defined scope and handoff.
2. **Software:** Reusable software that CX83 is developing, including a connected website or web application platform and Client Brand Studio. Product availability, self-hosting, pricing, and licensing must be established per actual release.
3. **Demonstrations and proof:** Real CX83 owned applications and recorded workflows showing what has actually been built, changed, tested, and deployed.

Present only one CX83 visual identity throughout these areas. A downloadable product receives a distinct product name and explanation, but it does not invent a new parent-company brand.

### Commercial path already established in the CX83 business plan

Introductory conversation, then assessment where useful, then scoped proposal, implementation and acceptance, training and handoff, with optional managed operations afterward. Do not require a paid assessment for a trivially scoped request. Do not publish prices, promises of savings, response times, or unsupported 24/7 operations until approved.

Canonical business references:

* [CX83 canonical plan](https://github.com/Mike-CX83/ai-agent-delivery/blob/main/docs/CANONICAL-PLAN.md)
* [CX83 services and offers](https://github.com/Mike-CX83/ai-agent-delivery/blob/main/docs/SERVICES.md)
* [Website and brand requirements](https://github.com/Mike-CX83/ai-agent-delivery/blob/main/docs/WEBSITE-AND-BRAND.md)

These business records govern commercial positioning. The dedicated `cx83_webapp` repository governs the website implementation and current route structure. Older suggestions that the website should live inside `ai-agent-delivery/apps/website` are superseded by the existing dedicated application.

## 2. Current website, verified October 9

**Repository:** `Mike-CX83/cx83_webapp`, private.  
**Current development integration:** connected `CX83 Website` owner tools successfully read Payload collections and website repository files during this audit.  
**Protected staging address:** [staging.cx83labs.com](https://staging.cx83labs.com). It is password gated and is not the public launch.  
**Stack:** Next.js, React, TypeScript, Tailwind, shadcn/ui components, Payload 3, PostgreSQL, assistant-ui, server-side AI provider boundary.  
**Existing staging process:** GitHub Actions builds and checks; the documented staging branch deployment flow includes health checks and rollback. Never infer a deployed version merely because CI passed.

### Inventory of what exists

| Area | Observed state | Next design or functional work |
| :--- | :--- | :--- |
| Homepage | Midnight hero, selected blue and violet banner, service cards, three-step process, inquiry CTA, responsive design on `staging-host` | Shared identity treatment, featured proof video, clear product story |
| About | Working Next.js route; reads CMS site settings | Founder, mission, and approach are empty in settings; finish accurate copy and give it the unified design |
| Services | Three published CMS service records with details and links | Harmonize cards and service pages; strengthen distinctions between consulting and products |
| Work | Route and project or case-study templates exist | No published projects or case studies; use genuine internal demos only when ready |
| Contact | Branded contact screen and existing inquiry flow | Verify complete submission path, routing, confirmation, spam controls, and future CX83 mailbox alias |
| Header | Shared component; CMS nav collection currently empty; code uses fallback About, Services, Work, Contact | Real approved logo link to Home, active route styling, consistent hover and keyboard behavior |
| Footer | Shared component; CMS footer nav currently empty | Consistent logo, navigation, legal links when real, product and contact sections |
| Media | CMS has a staging pixel; selected hero image exists as a static asset outside CMS | Import approved website assets and content photography with provenance and alt text |
| Visitor AI | Separate assistant interface and settings exist; enabled in CMS | Check actual current staging behavior before making a live capability claim |
| Products and checkout | No production product catalog, paid checkout, customer entitlement, or software delivery flow | Future schema and implementation stages defined below |

**Content counts observed:** Three published services, zero projects, zero case studies. The CMS Pages collection had a published `staging-check` entry and one empty draft, while the actual Home, About, Services, Work, and Contact routes are implemented directly in Next.js. Do not assume every route is an editable CMS Page record.

**Forms:** The `CX83 inquiry` form exists with name, email, organization, inquiry type, and message. Its CMS email-recipient configuration was empty during the audit. The current repository says submissions are stored, but outbound notifications and CRM routing are not connected. Display form success only when the server reports successful storage.

**Site settings:** `siteName`, `tagline`, `overview`, three capabilities, and `contactEmail=mike@cx83labs.com` were populated. `founder`, `mission`, `approach`, and scheduling URL were empty.

**Important continuity:** October 9 homepage and contact page work already exists. Preserve the banner, configured services, contact form, visitor assistant, owner authentication, PostgreSQL, and staging pipeline. Do not replace the application, bootstrap a second site, or undo recent CSS work to implement this brief.

### Owner requirement: do not change the existing homepage banner

**Confirmed October 9, 2026:** The original home banner was never authorized to be resized, moved into a side column, replaced, cropped or redesigned. Phase 2 mistakenly shrank it and moved it. PR #17 restores the **complete original hero JSX verbatim** from Phase 1 commit `3dd8bf219089ccbf9a300918d7f9c6cc6d8ec381`.

Keep `src/app/(frontend)/page.tsx` section `cx83-home-hero` as the **first section**, with `cx83-home-banner` full width, the existing static asset `/brand/cx83-labs-hero.avif`, original alt text, intrinsic 960 × 319 aspect ratio and responsive `sizes="(min-width: 1024px) 1024px, 100vw"`. Keep the selected original hero headline and its CTA buttons. This is a fixed owner selection, not a suggested template.

Place demonstrations, videos, software announcements and future homepage content in separate sections **after** this original hero. Do not move the original banner to fit a new feature. Do not change the banner asset, displayed size, original position, image treatment or hero composition unless the owner specifically authorizes that exact alteration.

`tests/e2e/homeBanner.e2e.spec.ts` checks banner identity, placement, sizing, ratio and original hero text at 320, 390, 768 and 1440 pixels. Do not remove or weaken these regression tests in future phases.

## 3. The real CX83 brand identity

### Source of truth and approval state

Mike chose the CX83 geometric frame, custom `CX83 LABS` lettering, and everyday light, everyday dark, and showcase treatments. These existing designs are not to be reinterpreted with generated logo text, a substitute symbol, or a new unrelated visual identity.

The **Client Brand Studio 0.8.2 draft archive** has been located in the ChatGPT Library and its 141 ZIP members inspected in this audit. It is suitable as source material for an owner-reviewed website draft, **not** evidence that the complete Studio package has passed final human acceptance. The separate Studio repository `plugins/client-brand-studio/STATUS.md` now describes a 0.8.3 draft; neither customer package approval nor official release has been established. A future Studio release may supersede the 0.8.2 draft only after its exact assets and decisions are verified.

**Authentic source locations:**

* Library folder: `/CX83 Labs/`.
* Library reference: `CX83_Website_Brand_START_HERE.md`.
* Library archive: `CX83_Studio_082_Brand_Assets_DRAFT.zip`.
* Mac project, historical 0.8.2 output: `/Users/mike/Desktop/cx83_labs/brand_studio/projects/cx83-acceptance-082-20261008/work/draft/package`.
* Latest Studio source and status: [Client Brand Studio STATUS](https://github.com/Mike-CX83/skills-plugins-agents/blob/client-brand-studio-completion/plugins/client-brand-studio/STATUS.md).
* Brand integration contract in website: [docs/BRANDING.md](https://github.com/Mike-CX83/cx83_webapp/blob/staging-host/docs/BRANDING.md).
* Current site styles: `src/app/(frontend)/cx83-brand.css`, imported after `globals.css`.

The website should maintain a **copy** of verified web-ready assets inside `public/brand/` with the source archive, version, file checksum, and rights or acceptance status documented. Do not edit Studio source masters from the website codebase.

### Color system

| Named identity color | Exact source hex | Intended use |
| :--- | :--- | :--- |
| Midnight | `#080E22` | Premium dark hero, footer, showcase background |
| Electric Blue | `#246BFF` | Brand action, emphasis, selected interface details |
| Violet | `#8247F5` | Secondary accent, showcase detail, restrained gradients |
| Silver | `#E6EBF5` | Light ink on Midnight, premium metallic identity artwork |
| White | `#FFFFFF` | Light surfaces and high-contrast on-dark text |
| Supporting pale surface | `#F5F7FF` | Light sections |
| Supporting muted ink | `#A4B6D3` | Copy on dark surfaces |
| Supporting luminous accent | `#B6EAFF` | On-dark detail and focus treatments |

The source logo's showcase gradients also contain color stops such as `#00C9FF`, `#0073FF`, `#4247FF`, and `#A846F8`. Keep the master SVG gradient and its stop order unchanged; interface gradients can be subtle and are not permission to recolor the actual logo.

**Current website semantic choices** include `#174ED4` for accessible light-background links and hover actions, and `#515D76` for muted copy. These are derived interface colors, not claims about changed source artwork. Use the current shared tokens rather than introducing a new raw hex on each page. Support existing light and dark modes.

**Visual balance:** Midnight establishes the identity, Electric Blue signals action, Violet adds depth, and Silver provides contrast. Do not cover every section with competing gradients or make text unreadable for a neon effect. The polished showcase treatment is an intentional highlight, not a replacement for legibility.

### Exact logo asset mapping

The following paths are relative to the native Studio 0.8.2 archive.

| Context | Composition | Exact source file |
| :--- | :--- | :--- |
| General light page, full logo | Everyday light | `assets/logo/master/primary.svg` |
| Dark header or dark page | Everyday dark | `assets/logo/master/full-dark.svg` |
| Signature dark hero or product showcase | Showcase full logo | `assets/logo/master/full-showcase.svg` |
| Small dark interface placement | Showcase frame | `assets/logo/master/symbol-showcase.svg` |
| Light interface icon | Everyday light frame | `assets/logo/master/symbol-light.svg` |
| Dark interface icon | Everyday dark frame | `assets/logo/master/symbol-dark.svg` |
| Lettering where frame is deliberately absent | Treatment-matching lettering | `assets/logo/master/wordmark-light.svg`, `wordmark-dark.svg`, or `wordmark-showcase.svg` |
| Flat one-color application | White or black companion | `assets/logo/master/full-white.svg` or `full-black.svg` |

Actual transparent PNG copies exist in `assets/logo/digital/` at 512, 1024, and 2048 sizes. SVG is preferred for site chrome. Preserve aspect ratio and clear space. Do not crop full artwork to simulate a symbol, edit the custom lettering, flatten transparent marks into opaque rectangles, stretch the logo, or render pale showcase lettering on white.

**Site standard:** The linked logo appears consistently in the global header and returns to `/`. Use the treatment appropriate to its background. Use a reviewed standalone frame for favicon or compact mobile layouts; do not substitute the template favicon without inspecting it. Retain the selected existing `public/brand/cx83-labs-hero.avif` banner and its aspect ratio until a deliberate replacement is approved.

### Typography and image treatment

The logo lettering is custom outlined artwork, not an installable font family. Its recorded `LABS` outline provenance mentions Bitstream Vera Sans. Do not ship an unverified or unlicensed font file or rebuild that logo with typed text.

The site currently uses Geist for supporting content. Treat Geist as the working interface font pending a reviewed website type hierarchy. Favor clean, high-contrast, readable type, generous spacing, a clear headline scale, and restrained technical mono labels. Do not change font dependencies just to mimic a logo.

Photography, product screenshots, banners, and screen recordings should share one editorial style: sharp subject, clean crop, quiet background, consistent border radius and shadows, no watermarks, no invented customer scenes, and no fake interface results. Use authentic screenshots and brand-safe mockups with documented provenance. Record filename, purpose, creator or owner, rights, alt text, and approval.

## 4. One global design system on every route

**Implementation rule:** Make a shared component once and use it everywhere. Consolidate global tokens and reusable primitives instead of designing a different header, action style, or card for each route.

| Shared component | Required behavior |
| :--- | :--- |
| SiteHeader and SiteLogo | Consistent dimensions, correct contextual SVG, clickable Home link, desktop and mobile navigation |
| Desktop navigation | Clear labels, active-page indication, hover state, visible keyboard focus |
| Mobile navigation | Opens and closes reliably, supports touch and keyboard, closes after navigation, no horizontal overflow |
| SiteFooter | Consistent dark/light treatment, meaningful navigation, contact, copyright and actual policy links |
| PageHero | Shared banner proportions, section heading hierarchy, optional eyebrow and purposeful action |
| CTA buttons | Default, hover, keyboard focus, pressed, disabled, pending/loading, and success/error states |
| Text links | Visibly identifiable as links before interaction, consistent underline or other unambiguous affordance, strong focus state |
| Cards | Shared radius, borders, padding, linked target, modest hover/focus response, no noninteractive fake hover |
| Media blocks | Responsive image/video ratio, poster, caption, accessible name, loading strategy |
| Forms | Visible label, hint text, validation, error message, disabled/submitting states, authentic confirmation |
| Visitor assistant | Uses the same palette and spacing, remains separate from owner administration privileges |

### Interaction contract

1. Hover should cause a meaningful but restrained change in color, underline, border, shadow, or lift. All navigation items, links, and actionable cards need a discoverable reaction.
2. Focus-visible should be equally obvious using the documented semantic tokens. Hover cannot be the only way to discover an action.
3. Mobile interaction should not depend on hover. Provide an adequate touch target and clear active or tap state.
4. Motion should be modest, typically near the current 180 ms token, and should honor `prefers-reduced-motion`. Avoid autoplay motion that obstructs reading.
5. Every CTA must lead to an existing page, validated form, working demo, or truthful `Coming soon` information page. No dead buttons or links masquerading as functional checkout.
6. Visually test 320 px, 390 px, 768 px, and 1440 px viewports; check keyboard navigation, contrast, motion preference, and screen reader semantics.
7. Keep page headers, section widths, spacing, card design, and button positions recognizably related across Home, About, Services, Work, Contact, and future product pages.

Current homepage and Contact already implement some of this. Treat those as material to refine, not as failures to throw away. The first full-page consistency pass should address About, Services and its detail pages, and Work, followed by shared header and footer harmonization.

## 5. Planned site navigation and pages

Each page must have a purpose, a defined primary CTA, appropriate status, and real links. Empty placeholders should not occupy primary navigation.

| Route or section | Purpose | Status and visibility |
| :--- | :--- | :--- |
| `/` | First impression, core value, authentic video demonstration, overview and action | Existing; improve |
| `/about` | Founder, why CX83 exists, practical approach and verified experience | Existing; finish content |
| `/services` and service details | Explain assessments, AI systems, integrations, web apps and support | Existing with three CMS entries |
| `/how-it-works` or homepage anchor | Simple steps for planning, connection, change, testing, and delivery | Planned separate page or reuse current homepage section |
| `/work` or `/demos` | Actual CX83 internal projects and documented demonstrations | Route exists; no case studies or projects published |
| `/contact` | Branded intake and conversation start | Existing; improve delivery routing |
| `/software` | Product catalog with honest availability and edition details | Planned |
| `/software/connected-websites` | CX83 hosted or self-hosted web app platform details | Planned product page, name provisional |
| `/software/client-brand-studio` | Client Brand Studio details, examples, prerequisites and releases | Planned product page |
| `/demo` | Video, screenshots, verification narrative and accessible transcript | Planned; may begin as homepage section |
| `/guides` or `/docs` | Clear install, supported environments, GitHub, setup and help | Planned when real artifacts exist |
| `/checkout` | Purchase with verified provider checkout | Planned, not live |
| `/account` | Customer license, purchases, versions and downloads | Planned, not live |
| `/support`, `/privacy`, `/terms`, `/refund-policy` | Trust, customer assistance and transaction policy | Write and verify before relevant public functions go live |

Proposed top-level desktop navigation once useful sections exist: **Home, What We Do, Software, See It Work, About, Contact**. On small screens, group rather than overcrowd. **Watch the Demo** and **Start a Conversation** are possible prominent actions. Menu labels and route mapping must be verified before adding them to the CMS header.

Product categories should not be mixed with client work: `Software` identifies packaged tools, `Services` identifies human-assisted engagements, and `Demos` shows verified examples. A product in development can have an honest overview, but no functional Download or Buy button until a complete delivery flow exists.

## 6. Homepage: the website as proof

### Primary goal

A visitor should understand within seconds that CX83 helps people build and change real websites and business systems using a connected AI conversation. The visitor should see authentic evidence, not a generic animation pretending to edit code.

### Suggested homepage story

**Brand intro:** The selected authentic CX83 banner, integrated into the existing midnight hero.

**Proposed headline:**  
**Your business software should be easier to change.**

**Proposed supporting explanation:**  
**Tell your connected AI what you need. CX83 helps turn the conversation into real website updates, automation, and business tools.**

**Primary CTA:** Watch the website change.  
**Secondary CTA:** Explore CX83 software.  
**Services CTA:** Tell us what you want to improve.

These are proposed copy, not immutable wording. Keep the professional services story visible for customers who do not want to install their own software.

### Hero video and evidence

Library candidate media, identified October 9, 2026:

* `/CX83 Labs/CX83_Website_Showcase_v2.mp4`
* `/CX83 Labs/CX83_Website_Showcase_v2_Website_Pack.zip`
* `/CX83 Labs/CX83_Website_Showcase_Poster_v2.jpg`
* Earlier alternative: `CX83_Website_Transformation_Demo.mp4`

**Asset audit status:** Filenames and Library records were located. The video contents, final cut, playback metadata, credits, poster and demonstrable before/after claim have not yet been independently verified in this website audit. Select and test the actual published video before embedding.

Recommended composition: high-quality, compact 16:9 inline video in the first screen or immediately below the hero, with a strong poster frame, explicit Play control, captions or transcript, full-screen support, and mobile optimization. Do not autoplay audio. Use an optimized video source and performance budget rather than loading a full-resolution clip on every visit unnecessarily.

### Accurate proposed proof caption

> This website is a working CX83 demonstration. Using ChatGPT on a phone, the owner can request website changes through the connected CX83 tools. The changes are made in the actual application, tested, and published through the site's normal deployment process.

**Do not publish that caption as a completed fact without a traceable demonstration proving each step.** The phone is the conversation interface, not the web host. Avoid saying that downloading the software alone automatically creates and deploys the exact website unless a real installer does that successfully. A download, a request, an edit, a passed test, a merged pull request, and a deployed update are separate events.

Suggested proof sequence: a dated phone request, exact page before state, verified agent code/content action, test result, deployment receipt, same public page after state, and optional short technical explanation. Redact tokens, private links, personal accounts and customer content.

### Additional homepage sections

1. **What CX83 does.** AI setup, useful automation, websites and business tools in plain language.
2. **How it works.** Connect your approved tools, describe the change, validate the result, publish or hand over.
3. **Two AI roles, two different permissions.** The owner-facing operational AI changes authorized software. The separate visitor-facing assistant can answer customers and guide inquiries but does not have access to the owner's admin permissions.
4. **Software in development.** Connected Website Platform and Client Brand Studio with accurate status.
5. **Inside the build.** Screenshots, build journal, responsible demonstrations and product updates.
6. **Founder and trust.** Direct contact, practical experience, honest support boundaries.
7. **Start a conversation.** One short next step, not a dozen competing buttons.

Use photos and real screenshots to clarify the story. Every proof block should have an artifact, date, source, and publication status.

## 7. Product cards and software download preparation

### Product A: Connected Website Platform

**Working label:** CX83 Connected Website Platform. Final public naming needs approval.  
**Owner intent:** A packaged web application that customers may host on their own supported server or deploy through a documented GitHub workflow, connected to their own supported AI tools so they can manage software conversationally.

**State:** The CX83 website itself demonstrates many connected editing foundations, but a documented general customer installer, licensing contract, supported deployment matrix and complete customer acceptance have not been established here. Do not describe a hypothetical one-click download or deployment as tested.

**Required product page fields:** Who it is for; plain-language result; accurate screenshot and video; what it changes; owner versus visitor AI roles; editions; supported hosts, databases, hardware and operating systems; installation method; update path; technical prerequisites; limits; data ownership; security model; support policy; version and release history; price and license; FAQ.

### Product B: Client Brand Studio

**Actual name:** Client Brand Studio.  
**Owner intent:** Software that takes a customer brief and source artwork plus the agent's creative direction, then produces consistent logo derivatives, identity files, guides, and editable branded materials through the Studio generator.

**State:** Version 0.8.3 is documented as a draft on the Studio repository branch. The customer package remains unapproved; no general product release or supported customer distribution has been established. The authenticated current Studio toolset was not available in this website conversation. Use the saved authentic 0.8.2 files for website visual planning until a later explicitly approved package supersedes them.

**Product messaging:** Emphasize useful customer outcomes and editable deliverables, not engine code. Do not use the manually designed reference guide as proof the Studio engine generated it. Do not promise downloads or completed Word/PowerPoint workflows that remain unverified.

### Suggested future product data model

Before checkout, design a Payload collection or equivalent typed records for:

| Record | Core fields |
| :--- | :--- |
| Product | slug, name, category, summary, detailed features, verified demo, current status, support plan |
| Edition or plan | product, license scope, eligibility, included support, allowed environments |
| Version/release | product, semantic version, changelog, supported environments, checksums, signed artifact location, approval state |
| Distribution | installer/package or GitHub release URL, instructions, prerequisites, provenance, archive SHA256 |
| Order | customer reference, provider checkout reference, line items, status, invoice/receipt link |
| Entitlement | customer, purchased edition, license key or secure reference, number of seats/instances, valid downloads |
| Download event | release ID, entitlement ID, generated access token expiry, download result, abuse signal |
| Support request | customer, product, release, issue, attachments, requested help, status |

This is a **future model proposal**, not an instruction to add all collections now.

### Checkout and software delivery flow when approved

1. Buyer reads the product details, license, actual supported systems, and refund terms.
2. Buyer chooses a real edition with an owner-approved price.
3. Website creates a server-side provider checkout session. Prefer a mature hosted checkout such as Stripe Checkout; do not collect raw credit card information in the CX83 application.
4. Provider's verified payment event updates the order idempotently. A redirect to a success page alone is not proof of payment.
5. Server creates or unlocks a customer entitlement and sends a branded receipt or onboarding notice only through a configured and tested delivery service.
6. Authenticated customer sees purchases, license terms, compatible releases, install guides, and approved updates.
7. Each authorized download uses an expiring access mechanism or entitlement check and a real versioned file. Record the checksum and never reveal private binary storage or credentials.
8. Support, cancellations, refunds, subscriptions and updates follow published policy and tested state transitions.

Until this exists, product pages show **In development** or **Join the update list** only when the promised mechanism truly works. Do not put inactive checkout buttons in the UI.

## 8. Contact, intake and customer communications

**Today:** Contact form stores inquiries under Payload. The public site can display `mike@cx83labs.com` and use its mailto URL. That does not mean each form submission emails Mike.

**Desired future:** A branded customer-facing CX83 address, not a personal sender on every page, with inquiries routed to the correct existing CX83 mailbox or CRM. A candidate like `hello@cx83labs.com` is only a proposed address until the owner selects, creates and verifies it.

**Proposed intake journey:** short form, topic selection, optional company name, clear privacy note, actual successful database storage, notification to authorized CX83 recipient, branded customer acknowledgment if enabled, a trackable inquiry status, and appropriate follow-up. Use the existing contact form and endpoint as the core, not a second overlapping system.

Before activation verify: business mailbox ownership and routing, delivery provider, sender authentication records, consent and retention text, spam control, inbox destination, an actual synthetic end-to-end test, duplicate protection and errors. No real client or patient secrets in test submissions.

## 9. Owner AI versus visitor AI

The **owner's connected AI** interacts with authorized website admin and repository tools to make content or code changes and run checks. It follows the user's scope, preserves source history, and uses existing deployment and review mechanisms. Authorization in this conversation does not grant the public chatbot the same access.

The **visitor assistant** reads only intended public site knowledge, helps visitors understand services and software, and directs inquiries to the contact flow. It does not receive owner credentials, repository writing tools, private form submissions, customer accounts, or license entitlements. Its claims must match the actual catalog and implementation state.

This difference is a valuable, easy-to-understand product story. It should also be preserved in code boundaries and tests.

## 10. Evidence, images and release ledger

Every important claim or public demonstration should record the following:

| Field | Meaning |
| :--- | :--- |
| Evidence ID | Stable internal identifier |
| Name and purpose | What the image, video or document demonstrates |
| Source | Library, CMS media ID, repository, verified URL or recording location |
| Date | Capture or test date, in Tulsa time where helpful |
| Product/version | Exact application or product version |
| Observed behavior | What was really done, not merely planned |
| Limits | Mocked data, staging only, incomplete installer, missing deployment or other qualifications |
| Rights/privacy | Ownership, client permissions, personal data removed, accessible alternative text |
| Review state | Draft, reviewed, approved to publish, published |
| Destination | Home, product detail, demo page, documentation or future campaign |

Current preferred video candidate is `CX83_Website_Showcase_v2.mp4`. Brand source remains the authentic Studio asset archive. The current banner is `public/brand/cx83-labs-hero.avif`. Neither a video title nor a saved draft constitutes a verified product claim.

Do not use VaultStorage client-specific artwork, investor content, logos, screenshots, or facts as CX83 marketing assets without separate rights and explicit permission. Reuse a quality benchmark, not another client's material.

## 11. Technical ownership map

| Concern | Real current owner or path |
| :--- | :--- |
| Application and routes | `Mike-CX83/cx83_webapp` |
| Active public brand token layer | `src/app/(frontend)/cx83-brand.css`, after `globals.css` |
| Shared site shell | `src/components/site/SiteHeader.tsx`, `SiteFooter.tsx`, `Section.tsx` |
| Homepage story | `src/app/(frontend)/page.tsx` |
| Other core routes | `src/app/(frontend)/about`, `services`, `work`, `contact` |
| CMS content loading | `src/content/load.ts` |
| CMS collections and site settings | Payload CMS through connected CX83 Website owner tools |
| Existing contact submission | `/api/inquiries` and `CX83 inquiry` form |
| Visitor assistant | `src/components/assistant` and `/api/chat` server boundary |
| Static source copies | `public/brand/` |
| Staging operations | `docs/STAGING.md` and `staging-host` workflow |
| Studio engine and packaging | `Mike-CX83/skills-plugins-agents`, `plugins/client-brand-studio`, separate local project |
| Business strategy and offers | `Mike-CX83/ai-agent-delivery` |
| Human-selected media / source brand files | ChatGPT Library `/CX83 Labs/`, plus the native local Studio folder |

Do not put access keys, payment credentials, client lists, private medical information, internal token files, or secret runtime configuration into this reference, the marketing website, commit history, or the agent mailbox.

## 12. Implementation roadmap and gates

### Phase 0. Preserve and prepare (this document)

**Goal:** One accurate cross-session context and a full asset/feature inventory. No visual website changes.

* Read relevant source repositories, CMS records and assets.
* Maintain a source-of-truth map and accurate status labels.
* Keep existing banner, video candidates, service records, and prior page edits intact.
* Capture baseline screenshots and actual branch HEAD before editing.
* Decide which exact 0.8.2 draft logos are acceptable for staging while the 0.8.3 package is reviewed.
* Do not trigger deployment as a side effect of adding this plan.

**Exit:** Owner can locate the context, sources, active site and open decisions.

### Phase 1. Global CX83 identity and responsive interactions

**Goal:** All existing pages feel like one intentional company website.

1. Import treatment-matching authentic SVG copies into `public/brand/` with provenance.
2. Create a reusable SiteLogo and integrate it into shared header and footer; link it to Home.
3. Make header navigation meaningful, current-page aware, hover and focus responsive, and accessible on mobile.
4. Consolidate visual tokens, reusable page hero, links, buttons, cards and form styles while retaining the existing homepage and Contact work.
5. Bring About, Services, service details, Work and any visible CMS page into the same layout, typography, color and image conventions.
6. Check all links and resolve empty CMS navigation versus fallback behavior.

**Exit:** Page-to-page visual consistency demonstrated by desktop and mobile screenshots plus automated checks.

### Phase 2. Demonstration-led homepage

**Goal:** The site visibly proves what connected AI-assisted software can accomplish.

1. Inspect the final video and poster from the Library, confirm rights and claim accuracy.
2. Add responsive accessible video with optimized loading, captions and transcript.
3. Present a clear two-role AI explanation and real before/after evidence.
4. Add actual screenshots, internal demo cards and the latest selected brand assets.
5. Preserve simple contact access and check real CTA destinations.

**Exit:** Demo can be played and its claims traced to observed implementation, tests and deployment.

### Phase 3. Software catalog before transactions

**Goal:** Clear software product landing pages that can evolve into a store.

1. Define the supported product/version/edition content model.
2. Publish only accurate product descriptions and current release states.
3. Add clear install prerequisites, platform compatibility, ownership and support information.
4. Provide a safe `Coming soon` or working lead capture path.
5. Coordinate Client Brand Studio availability and website distribution separately.

**Exit:** Customer understands each product without encountering a fake download or checkout.

### Phase 4. Payments, accounts and controlled downloads

**Goal:** A tested commercial flow only after products, licenses and policies are approved.

1. Agree on editions, price, licensing, tax treatment, terms and refund policy.
2. Integrate a verified hosted checkout and webhook processing.
3. Implement order records, entitlements, email delivery and secure downloads.
4. Test retries, failed payment, completed payment, refunds and authorized access.
5. Add actual release packages with checksums, version history and install guides.

**Exit:** Successful real or provider test-mode purchases produce exactly the access purchased, with complete audit and recovery behavior.

### Phase 5. Intake and ongoing content

**Goal:** Practical client communication and credible continuing proof.

1. Establish the selected CX83 customer-facing alias and delivery route.
2. Test complete form-to-inbox or CRM flow.
3. Publish genuine internal demonstrations and product changes as they occur.
4. Add monitoring and analytics only with a defined question and matching privacy disclosure.
5. Review navigation and page content as the product catalog grows.

**Exit:** Inquiries reliably reach the correct authorized destination and visitors find current information without manual archaeology.

## 13. Acceptance checklist for every website design change

- [ ] Current repository branch and deployed staging version are identified.
- [ ] The exact source logo is used, with proper light/dark treatment and no substitute lettering.
- [ ] Header and footer stay consistent and the logo returns home.
- [ ] All visible links, buttons, menu states and linked cards work with mouse, keyboard and touch.
- [ ] No hover-only interactions hide essential functionality.
- [ ] All pages use shared tokens, layout widths, spacing and typography decisions.
- [ ] Hero banner and video are responsive with no stretching or horizontal overflow.
- [ ] Video has user-controlled playback, relevant poster, captions or transcript, and acceptable loading performance.
- [ ] All claims, product status labels and screenshots match verified facts.
- [ ] Draft product links do not pretend to sell, download or install something unavailable.
- [ ] Form validation and genuine saved-submission result are tested without exposing private data.
- [ ] The visitor assistant is separate from owner editing and customer account access.
- [ ] Current tests pass: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test:int`, `pnpm build`, plus existing Playwright/mobile checks when the environment permits.
- [ ] Screenshots include at least 320, 390, 768 and 1440 px, and inspect both light and dark theme states where applicable.
- [ ] No secrets, client artwork or patient information leaked.
- [ ] Content changes, commit, merge, actual deploy, and verification are recorded as separate events.
- [ ] Relevant source references and this context file are updated before handoff.

## 14. Editable content record template

For each new page, product or evidence item, keep a compact record with:

`ID`:  
`Status`: DRAFT / NEEDS VERIFICATION / APPROVED / LIVE  
`Route`:  
`Audience and one-sentence purpose`:  
`Headline and supporting plain-language summary`:  
`One primary CTA and exact destination`:  
`Secondary CTA and exact destination`:  
`Sections and CMS owner`:  
`Real logo treatment, imagery and source filenames`:  
`Product version, prerequisites and limits if relevant`:  
`Proof assets and rights`:  
`SEO title and description`:  
`Mobile/keyboard/contrast test`:  
`Last verified date and code HEAD`:  
`Outstanding questions`:

Agents should use this structure to request missing content only when needed rather than interrupting ordinary work for a large speculative questionnaire.

## 15. Decisions still needed

1. Confirm when the Client Brand Studio 0.8.3 output has undergone and passed its separate human visual and package review; until then, stage using explicitly labeled existing source assets.
2. Approve the actual homepage video after viewing the latest `v2` cut and its poster.
3. Approve the customer-facing product name for the connected website platform and define which capabilities are included in its first supported package.
4. Choose actual distribution models per product: downloadable installer, GitHub release, deployment template, managed installation, subscription, or a combination.
5. Approve public pricing, licensing, support boundaries and transaction policies only once the products are release ready.
6. Choose and verify the branded CX83 intake mailbox alias and delivery path.
7. Decide the public launch timing and verify current staging, security and functional launch gates.

None of these unresolved decisions blocks preparing the consistent shared layout and a truthful draft product architecture.

## 16. Continuity and agent handoff

**Before modifying code:** Read this file, `docs/BRANDING.md`, `docs/ARCHITECTURE.md`, the latest relevant site handoff, the current branches, and the source asset inventory. Inspect the active changes before editing so parallel work is not overwritten. For cross-agent coordination use the existing CX83 Agent Mailbox and established project identities and threads. Mailbox messages do not automatically wake another agent and are not the project's canonical storage.

**During work:** Keep changes scoped, prefer the existing website connection for CMS data and repository reads, use a feature branch for significant code changes, and preserve authentic Studio masters. Update this document when a tested feature is added, its release status changes, or a decision is approved.

**After work:** Record `PROJECT`, `HEAD`, `COMPLETED`, `BLOCKED`, `NEXT` and `ARTIFACTS` in the appropriate handoff. Report distinctly what was drafted, committed, merged, tested, deployed and visibly verified.

**Last audit:** October 9, 2026, Tulsa, Oklahoma. This file is a documentation-only planning artifact. It is not an instruction to modify the production website, enable paid services, or mark Studio ready.

### Short startup instruction for a future ChatGPT website thread

> Open `docs/CX83_WEBSITE_BRAND_SYSTEM_CONTEXT.md` in `Mike-CX83/cx83_webapp`, then read the latest branch, `docs/BRANDING.md`, the current CX83 Website content, and the CX83 Library brand START HERE reference. Preserve the real CX83 identity and existing homepage and Contact work. Before changing the site, check the relevant product and brand status, inventory active files, and propose the smallest useful implementation slice. Use authentic assets, shared design tokens, visible hover and focus behavior, truthful product claims, and actual tests. Do not re-create the website, release Client Brand Studio, turn on checkout, or publish unverified claims.


## Implementation note: Phase 1, October 9, 2026

The first website-wide visual implementation is tracked in [PR #7](https://github.com/Mike-CX83/cx83_webapp/pull/7), on the branch `chatgpt/phase1-global-brand-20261009`. Its scope includes the original Studio 0.8.2 SVG logo path geometry, branded and theme-aware shared header, dark footer, consistent shared heroes and cards, visible keyboard focus, active navigation, mobile menu behavior, supported reduced motion, and aligned About, Services, Work, detail, Notes and Search pages. The protected homepage's selected banner and Contact layout are preserved. The site's existing provider boundary, form submission logic, and database collections are unchanged.

This note records implemented source changes, not release acceptance or staging deployment. CI, browser screenshots, staging image build and deployment status must be checked separately. Phase 2 video and software storefront are not included.
