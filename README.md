# Form Copilot

Phase 1 prototype for the AI Online Form Field Assistant described in the project brief. The app uses Angular 21, PrimeNG 21, Vercel Functions, and Cerebras.

## Features

- Sample permit application with 6 representative fields
- Inline field-level AI trigger
- Right-side assistant drawer modeled after the PDF mockup
- Structured explanation sections
- Field-scoped follow-up chat
- Assistant-only language switching
- Vercel-ready `/api/*` backend surface

## Local development

Install dependencies:

```bash
pnpm install
```

Copy the example env file and fill in your Cerebras credentials:

```bash
cp .env.example .env.local
```

Run the frontend and API in separate terminals:

```bash
pnpm dev:web
pnpm dev:api
```

`dev:web` runs Angular on `http://localhost:4200` and proxies `/api/*` to `http://localhost:3000`.

`dev:api` runs the Vercel function layer locally on `http://localhost:3000`.

## Build

```bash
pnpm build
```

The production SPA output is written to `dist/form-copilot`.

## Deploy to Vercel

The repo is configured for:

- frontend: static Angular SPA
- backend: Vercel Node Functions under `api/`
- SPA fallback: handled through `vercel.json` rewrites
- Cerebras integration: official `@cerebras/cerebras_cloud_sdk`

Set these environment variables in Vercel:

- `CEREBRAS_API_KEY`
- `CEREBRAS_BASE_URL`
- `CEREBRAS_MODEL`

Current default model in the repo is `gpt-oss-120b`.
Use the base API host for `CEREBRAS_BASE_URL`, for example `https://api.cerebras.ai`.

## Tests

```bash
pnpm test
pnpm test:ci
pnpm check:api
```
