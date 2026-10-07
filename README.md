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
| AI boundary | Vercel AI SDK `ai` 7.0.128 and `@ai-sdk/openai` 4.0.84 |
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

Required before admin, publishing, media, and saved forms will work:

- `DATABASE_URL`: a development PostgreSQL connection string. Do not use a production database.
- `PAYLOAD_SECRET`: a long random string.

The website pages still render without `DATABASE_URL`. They show a labeled development fallback instead of published content.

OpenAI is optional. Leave `OPENAI_API_KEY` empty and the assistant stays in a labeled mock mode. `CHATBOT_ENABLED=false` hides the launcher.

## Database

PostgreSQL is the only database adapter configured. This Mac does not have PostgreSQL or Docker installed, and neither was added. Until `DATABASE_URL` points at a development database, these checks stay blocked:

- Payload admin login
- Owner publishing
- Media upload
- Form submission persistence
- Payload MCP create, read, update, delete, and publish

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

Temporary tokens live in `:root` inside `src/app/(frontend)/globals.css`. The only supplied brand color is `#101216`. Typography is Geist until a typeface is approved. The header uses a text wordmark. See `docs/BRANDING.md`.

## Forms

The contact page posts to `/api/inquiries`. The server validates the fields and, when PostgreSQL is connected, stores the submission in Payload's form submissions collection under the form titled `CX83 inquiry`. The owner reads submissions in the admin panel. Email, CRM, and scheduling delivery are not connected.

## Assistant

The browser talks to assistant-ui. assistant-ui posts to `/api/chat`. That endpoint uses the Vercel AI SDK, which calls OpenAI on the server. The browser never receives `OPENAI_API_KEY`.

The default model is `gpt-6-luna`. OpenAI's model documentation on October 6, 2026 lists it at $0.10 per million input tokens and $0.50 per million output tokens. Override it with `OPENAI_MODEL` or the Assistant settings global. Output is capped, and only the latest 12 messages are sent.

A local request on October 6, 2026 reached OpenAI and the account returned `credit_balance_exhausted`. The chat showed an error instead of a reply. A completed live answer has not been observed. The labeled mock path is used when the key is missing, the provider is not OpenAI, or the request fails before a stream starts.

Approved knowledge comes from published Payload content when the database is connected, and from the labeled development fallback when it is not. There is no vector database. A later retrieval step can read the same Payload content, create embeddings, and pass retrieved excerpts into `buildSystemPrompt` in `src/ai/assistant.ts`.

Another provider belongs in `src/ai/model.ts`. The chat panel does not need to change.

## Payload MCP

`@payloadcms/plugin-mcp` 3.90.2 is installed and registered. It is enabled during local development and disabled in production unless `PAYLOAD_MCP_ENABLED=true`. The local endpoint is `POST http://127.0.0.1:3000/api/mcp`. It expects a bearer API key created in the admin panel's MCP API keys collection and tied to the owner user. Enable find, create, update, and delete on that key for full content control. Do not expose this port with a public tunnel.

The installed plugin does not use the newer documentation's `overrideAccess=true` development URL. Follow the installed package: API key plus the owner's Payload access. CRUD through MCP was not tested because PostgreSQL is not connected. A local MCP process is not a connection to remote ChatGPT.

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

The application code uses open source licenses for the major packages: Payload MIT, Next.js MIT, React MIT, TypeScript Apache-2.0, Tailwind MIT, the AI SDK Apache-2.0, `@ai-sdk/openai` Apache-2.0, the OpenAI SDK Apache-2.0, and assistant-ui MIT. License cost is separate from operating cost.

Possible later operating costs, none of which were purchased here: domain, hosting, database hosting, media storage, email delivery, and OpenAI API usage.

## Deferred

Lead workflows, scheduling, email, CRM, ecommerce, Stripe, downloads, client accounts, subscriptions, SaaS, vector search, local models, and public autonomous agents. The Payload collections, server AI boundary, and Next.js application are the place those features attach later.
