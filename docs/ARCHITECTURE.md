# Architecture

CX83 Labs uses one Next.js application. Payload is the content system, the admin, the media library, and the form store. The public pages are React Server Components that read Payload when PostgreSQL is available.

## Request paths

Public page:

1. A visitor opens a route under `src/app/(frontend)`.
2. The route calls `src/content/load.ts`.
3. That loader uses the Payload local API when `DATABASE_URL` is a real development or deployment database.
4. Otherwise it returns labeled development content, or an empty published list.

Inquiry:

1. The contact form posts JSON to the Next.js route `/api/inquiries`.
2. `src/forms/inquiry.ts` validates it.
3. `src/forms/ensure-inquiry-form.ts` finds or creates the Payload form `CX83 inquiry`.
4. The submission is stored in `form-submissions`.

Assistant:

1. assistant-ui renders the launcher, panel, composer, message list, streaming state, and markdown.
2. It posts UI messages to the Next.js route `/api/chat`. That route does not start Payload when PostgreSQL is not configured.
3. `src/ai/assistant.ts` reads `AI_PROVIDER`. `openrouter` selects OpenRouter through `@openrouter/ai-sdk-provider`. `google` selects Gemini through `@ai-sdk/google`. `openai` selects OpenAI through `@ai-sdk/openai`. A missing key is an error. The other providers are not called.
4. The Vercel AI SDK streams the reply. Provider keys stay on the server. The request contains public site knowledge and the visitor's chat messages.
5. `src/ai/assistant.ts` builds the system prompt from approved site content.

Owner administration:

1. A person signs in at `/admin` with Payload authentication.
2. Authenticated users can manage pages, posts, services, projects, case studies, media, forms, submissions, navigation, site settings, assistant settings, and users.
3. Drafts exist so unpublished work stays off the public site. Publishing is a direct owner action.

## Content model

Reused from the website template: pages, posts, categories, media, users, header, footer, forms, form submissions, redirects, SEO, and search.

Added for CX83: services, projects, case studies, site settings, and assistant settings. Case studies stay separate from projects because their fields are different. They can point at a project.

## Future stages

Stage 2 can add email and scheduling beside the existing inquiry record. Stage 3 can add products and Stripe beside Payload collections. Stage 4 can add a separate customer auth collection when a client portal exists. Stage 5 can add product-specific collections in this same app. Stage 6 can add a provider in `src/ai/model.ts` for CX83-hosted inference. None of those stages are implemented.

## Deviations from the stock template

- PostgreSQL was selected with the official CLI database flag. The template's MongoDB compose file was removed.
- The public header, footer, and main pages are CX83 components. The template's page builder, posts, preview, redirects, and admin remain.
- The template demo seed route returns HTTP 410.
- ESLint uses the Next.js flat config exports because `FlatCompat` crashed while loading `next/core-web-vitals` on ESLint 9.39.5.
- The chat UI uses assistant-ui primitives instead of pasting the full assistant-ui shadcn registry, so the panel follows the CX83 tokens.
