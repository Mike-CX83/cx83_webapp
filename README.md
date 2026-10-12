# CX83 Labs website

The public website and future digital platform for CX83 Labs. This repository is the application root. It is a Next.js application with Payload CMS, PostgreSQL, and a visitor assistant.

CX83 Labs focuses on AI systems, automation, software, and business integration. This version is the professional site foundation. Ecommerce, client accounts, SaaS, and advanced retrieval are intentionally not built yet.

## Architecture

| Layer | Choice |
| --- | --- |
| Application | Next.js 16.3.3, React 19.2.6, TypeScript 5.7.3 |
| CMS | Payload 3.90.2 |
| Database | PostgreSQL through `@payloadcms/db-postgres` 3.90.2 |
| UI | Tailwind CSS 4.3.3 and the template's shadcn/ui components |
| Assistant interface | assistant-ui `@assistant-ui/react` 0.15.23 |
| AI boundary | Vercel AI SDK `ai` 7.0.128, `@ai-sdk/google` 4.0.90, and `@ai-sdk/openai` 4.0.84 |
| OpenAI SDK | `openai` 7.28.0, used for a direct API check, not from browser components |
| Package manager | pnpm 11.28.5 |
| Node | 26.5.0 on this Mac. The project accepts Node `>=20.18.1` |

The official installer was:

```bash
npx create-payload-app@latest . -t website --use-pnpm -a cursor --db postgres --db-accept-recommended
```

Payload's website template still documents MongoDB as its default. This project passed `--db postgres` to the official CLI so the PostgreSQL adapter replaced MongoDB during scaffolding. No other CMS was substituted.

See `docs/ARCHITECTURE.md` for the extension path and `docs/BRANDING.md` for where approved brand values go.

## Local development

```bash
pnpm install
pnpm dev
```

- Website: http://localhost:3000
- Payload admin: http://localhost:3000/admin
- Inquiry endpoint: `POST /api/inquiries`
- Assistant endpoint: `POST /api/chat`
- Assistant status: `GET /api/assistant-status`

The first visit to `/admin` creates the owner user when PostgreSQL is connected. That user can create, edit, delete, and publish content directly. There is no approval workflow.

## Environment

Copy `.env.example` to `.env`. Do not commit `.env`.

The OpenAI API key is `OPENAI_API_KEY` in that ignored `.env`. Agents retrieve it from the file and do not print it.

Required before admin, publishing, media, and saved forms will work:

- `DATABASE_URL`: a development PostgreSQL connection string. Do not use a production database.
- `PAYLOAD_SECRET`: a long random string.

The website pages still render without `DATABASE_URL`. They show a labeled development fallback instead of published content.

The active development provider is OpenRouter. `CHATBOT_ENABLED=false` hides the launcher. A missing key for the selected provider returns a configuration error and does not switch providers.

## Database

PostgreSQL is the only database adapter configured. Local development uses PostgreSQL 17 from Homebrew, database `cx83_webapp_dev`, started with `brew services`. `DATABASE_URL` in the ignored `.env` points at that database on this Mac. It is not a hosted or paid database. Development schema push is off because this database also holds the studio download tables. Do not turn push back on against this database.

Payload stores uploads in `public/media` during development. Production hosting needs persistent disk or object storage. No external media service was purchased.

## Project structure

- `src/payload.config.ts` registers collections, globals, and endpoints
- `src/collections` holds pages, posts, services, projects, case studies, media, and users
- `src/globals` holds header, footer, site settings, and assistant settings
- `src/app/(frontend)` is the public site
- `src/components/site` holds the shared public layout
- `src/components/assistant` holds the chat panel
- `src/ai` holds provider selection, knowledge, and the system prompt
- `src/app/(frontend)/globals.css` holds the design tokens
- `public/brand` is the drop-in location for approved logos and images

## Branding

CX83's dark-first brand system and shared surfaces live in `src/app/(frontend)/cx83-brand.css` and related site CSS. Genuine logo SVGs originate from the owner's draft Studio assets and are documented in `public/brand/PROVENANCE.md`. The existing illuminated homepage AVIF and first hero section remain protected and unchanged. See `docs/BRANDING.md`.

## Forms

The contact page posts to `/api/inquiries`. It validates fields and, when PostgreSQL is connected, stores an inquiry in Payload's `CX83 inquiry` form submissions. A saved record includes a request ID and durable notification state. A separately authorized Google Workspace Gmail adapter can notify the verified CX83 Labs public contact alias `hello@cx83labs.com`, using the existing Google Workspace OAuth principal (`users/me`); it remains disabled until website-owned OAuth credentials are deliberately configured. The form confirms **saved**, never claims inbox delivery. An owner-only manual dispatch route supports recovery; a dedicated bearer secret is required. Abuse and duplicate protections are designed for single-replica protected staging, not a public multi-replica guarantee. See `docs/CX83_RUN3_MAIL_DELIVERY.md`.

## Assistant

The browser talks to assistant-ui. assistant-ui posts to `/api/chat`. That endpoint uses the Vercel AI SDK on the server. The browser never receives `OPENROUTER_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, or `OPENAI_API_KEY`.

The active provider is selected with `AI_PROVIDER`. The chat panel does not change between providers.

| `AI_PROVIDER` | Model variable | Key variable | Default model |
| --- | --- | --- | --- |
| `openrouter` | `OPENROUTER_MODEL` | `OPENROUTER_API_KEY` | `openrouter/free` |
| `google` | `GOOGLE_MODEL` | `GOOGLE_GENERATIVE_AI_API_KEY` | `gemini-3.5-flash-lite` |
| `openai` | `OPENAI_MODEL` | `OPENAI_API_KEY` | `gpt-6-luna` |

Current development setting: `AI_PROVIDER=openrouter` and `OPENROUTER_MODEL=openrouter/free`. Gemini and OpenAI stay configured and are selected only by changing `AI_PROVIDER`. Provider keys stay in the ignored local `.env` file. They are not in Git.

Gemini API pricing on October 6, 2026 still lists `gemini-2.5-flash-lite` with free standard-tier input and output. A live request that night reached `generativelanguage.googleapis.com` and Google returned that `gemini-2.5-flash-lite` is no longer available to new users. The same response named `gemini-3.5-flash-lite`, which is also free of charge for standard input and output. A second live request with that model reached Gemini and returned HTTP 403, `Your project has been denied access`. In AI Studio, `CX83 Labs Website`, `Default Gemini Project`, and `cx83-labs-pilot` are all marked Restricted, and the billing page says there is no billing account. The restriction text says to set up billing to continue. Paid billing was not enabled. Free-tier content is used to improve Google products. OpenAI was not called.

Because the free tier can use prompts to improve Google products, this provider currently receives public CX83 site knowledge and ordinary visitor chat messages. Do not send private form submissions, credentials, confidential client information, or patient information to it. The chat route does not read form submissions.

Switch providers by setting `AI_PROVIDER` to `openrouter`, `google`, or `openai`, plus that provider's key and model variables. No frontend change is required. Leave the unused providers' keys in place. The selected provider is the only one called. A missing key returns HTTP 503 with the missing variable name. A live request on October 7, 2026 with `openrouter/free` streamed an answer through the existing chat panel. Gemini and OpenAI were not called.

The OpenAI model `gpt-6-luna` remains available for that switch. OpenAI's model documentation on October 6, 2026 lists it at $0.10 per million input tokens and $0.50 per million output tokens. When `AI_PROVIDER=openai` and `OPENAI_MODEL` is empty, the Assistant settings global can still set the OpenAI model. Output is capped, and only the latest 12 messages are sent.

A local OpenAI request on October 6, 2026 reached OpenAI and the account returned `credit_balance_exhausted`. A completed live OpenAI answer has not been observed. The Gemini key stays in the ignored `.env` file.

Approved knowledge comes from published Payload content when the database is connected, and from the labeled development fallback when it is not. There is no vector database. A later retrieval step can read the same Payload content, create embeddings, and pass retrieved excerpts into `buildSystemPrompt` in `src/ai/assistant.ts`.

## Payload MCP

`@payloadcms/plugin-mcp` 3.90.2 is installed and registered. It is enabled during local development and disabled in production unless `PAYLOAD_MCP_ENABLED=true`. The local endpoint is `POST http://127.0.0.1:3000/api/mcp`. It expects `Authorization: Bearer` with an API key from the MCP API keys collection. That key is tied to the owner user, and the plugin calls Payload with `overrideAccess: false`, so the owner keeps full authenticated access. Do not expose this port with a public tunnel.

The same server exposes repository tools for code repair: `readRepositoryFile`, `searchRepository`, `readDevelopmentErrors`, `applyRepositoryEdit`, `runRepositoryCheck` (`typecheck`, `lint`, `test:int`), `getRepositoryStatus`, and `syncRepositoryCheckout`. Those tools stay inside this repository and refuse credential files. The owner key is stored only in the ignored `.env` as `PAYLOAD_MCP_API_KEY`. `getRepositoryStatus` is read-only. `syncRepositoryCheckout` fast-forwards the staging checkout to the deployed commit only when that is safe. The public visitor assistant does not receive these tools.

`runRepositoryCheck` starts the existing command and returns an id immediately. Call the same tool again with that id to retrieve the exit code and output.

Personal ChatGPT reaches this private endpoint through the existing OpenAI tunnel. The tunnel client adds the owner key locally. The key is not entered in ChatGPT. On staging, that client runs beside the website so ChatGPT does not need this Mac. See `docs/STAGING.md`.

## Checks

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm build
```

`pnpm test:int` covers inquiry validation and skips the Payload API test when `DATABASE_URL` is missing. `pnpm test:e2e` needs a running site and, for the admin spec, a database. Playwright was not run in the initial setup without PostgreSQL.

## Production build

```bash
pnpm build
pnpm start
```

`pnpm build` completes without a database. Admin, forms, and published content still need PostgreSQL at runtime.

## Costs

The application code uses open source licenses for the major packages: Payload MIT, Next.js MIT, React MIT, TypeScript Apache-2.0, Tailwind MIT, the AI SDK Apache-2.0, `@ai-sdk/google` Apache-2.0, `@ai-sdk/openai` Apache-2.0, the OpenAI SDK Apache-2.0, and assistant-ui MIT. License cost is separate from operating cost.

Possible later operating costs, none of which were purchased here: domain, hosting, database hosting, media storage, email delivery, Gemini API usage above the free tier, and OpenAI API usage.

## Deferred

Lead workflows, scheduling, email, CRM, ecommerce, Stripe, downloads, client accounts, subscriptions, SaaS, vector search, local models, and public autonomous agents. The Payload collections, server AI boundary, and Next.js application are the place those features attach later.
