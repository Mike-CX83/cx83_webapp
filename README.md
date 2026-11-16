# CX83 Labs Website

## Project Description

The CX83 Labs website presents the company's work in AI systems, automation, and software integration. It combines a public website, an editable content system, a contact form, and a visitor assistant in one application.

The project gives the owner a way to maintain service descriptions, projects, articles, and case studies without rewriting page components for each content change.

[Company website](https://cx83labs.com)

This README describes the code on the repository's `main` branch. A hosted environment or another branch may contain later changes; a website link alone does not establish which commit is deployed.

## Contents

* [Usage](#usage)
* [Installation](#installation)
* [Tech Stack](#tech-stack)
* [How It Works](#how-it-works)
* [Checks](#checks)
* [Limitations and Development](#limitations-and-development)
* [Author](#author)

## Usage

Visitors can explore the home, about, services, work, contact, posts, and search pages. Published projects and case studies have their own detail pages.

The contact form collects a name, email, optional organization, inquiry type, and message. With a working database connection, valid submissions are saved for the owner to read in Payload.

The visitor assistant answers questions using site information and the conversation. It needs a configured model provider. The website remains useful with the assistant disabled.

The owner signs in at `/admin` to manage content, media, navigation, site settings, and assistant settings.

## Installation

### Prerequisites

* Git and Node.js compatible with the package requirement `>=20.18.1`.
* pnpm 9, 10, or 11, as declared in `package.json`.
* A separate PostgreSQL development database. The CI configuration uses PostgreSQL 17.
* An optional API key and available model for the selected assistant provider.

### Local setup

```bash
git clone https://github.com/Mike-CX83/cx83_webapp.git
cd cx83_webapp
pnpm install --frozen-lockfile
cp .env.example .env
```

Edit `.env` before starting:

* Set `DATABASE_URL` to your development PostgreSQL connection string.
* Set `PAYLOAD_SECRET` to a long random secret.
* Keep `NEXT_PUBLIC_SERVER_URL=http://localhost:3000` for local development.
* Set `CHATBOT_ENABLED=false` if you want to start without an AI provider.

Keep real credentials out of source control.

```bash
pnpm dev
```

Open `http://localhost:3000`. On a new database, open `http://localhost:3000/admin` and create the initial owner account. Add content through the admin interface.

Some public pages display development fallback content when the database is unavailable. This is not a substitute for configuring PostgreSQL: admin features, saved inquiries, and published content require it.

### Optional assistant configuration

Set `AI_PROVIDER` to `openrouter`, `google`, or `openai`. Supply that provider's key and model variables from `.env.example`, then enable the assistant. Model availability and account access are external prerequisites.

The selected provider is the only one called. A missing key produces a configuration error instead of silently switching providers. Keys are read on the server, not sent to browser components.

## Tech Stack

* Next.js 16, React 19, and TypeScript.
* Payload CMS 3 with PostgreSQL.
* Tailwind CSS and Radix UI components.
* assistant-ui and the Vercel AI SDK.
* Vitest for integration tests and Playwright for browser tests.

Exact dependency versions are recorded in `package.json` and `pnpm-lock.yaml`.

## How It Works

Page components load site content through `src/content/load.ts`. Payload collections hold services, projects, case studies, pages, posts, and media. Globals hold shared settings and navigation.

`POST /api/inquiries` validates submitted fields and writes a Payload form submission. In this branch, it does not send email or create CRM records.

`POST /api/chat` assembles approved site knowledge, retains up to the latest 12 conversation messages, and streams a response from the selected provider. Form submissions are not included in that knowledge.

The Payload MCP plugin supplies authenticated content management capabilities. Its production activation is controlled by `PAYLOAD_MCP_ENABLED`; local plugin configuration is not proof of an external ChatGPT connection.

## Checks

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test:int
pnpm exec playwright install chromium
pnpm test:e2e
pnpm build
```

Browser tests start the development server through `playwright.config.ts`. Admin tests create and delete a development user, so use a separate test database, never a live database. The integration API test is skipped when `DATABASE_URL` is missing.

For a local production build:

```bash
pnpm build
pnpm start
```

These are reproducible commands, not a claim that the application suite was rerun during this documentation update.

## Limitations and Development

This branch does not implement checkout, subscriptions, client accounts, CRM delivery, or vector search. Uploaded media needs persistent storage in a hosted deployment.

The architecture keeps content management, visitor interaction, and provider selection separate so each can evolve independently.

* [Architecture notes](docs/ARCHITECTURE.md)
* [Branding notes](docs/BRANDING.md)
* [Historical setup checkpoint](docs/README_CHECKPOINT_2026_11_16.md)

## Author

**Mike Hankins**, founder of CX83 Labs and software engineering student with a background in nursing and systems design.

[GitHub](https://github.com/Mike-CX83) · [CX83 Labs](https://cx83labs.com)

Built on the Payload website template and the open source packages listed in the project manifest.
