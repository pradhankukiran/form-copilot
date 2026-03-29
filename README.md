<div align="center">

# Form Copilot

**AI-powered assistant that helps users understand and fill out complex online forms**

[![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?logo=vercel&logoColor=white)](https://form-copilot.vercel.app)
[![PrimeNG](https://img.shields.io/badge/PrimeNG-21-4d7c0f?logo=prime&logoColor=white)](https://primeng.org)
[![pnpm](https://img.shields.io/badge/pnpm-10-f69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-2ead33?logo=playwright&logoColor=white)](https://playwright.dev)

[Live Demo](https://form-copilot.vercel.app) &bull; [Report Bug](https://github.com/pradhankukiran/form-copilot/issues) &bull; [Request Feature](https://github.com/pradhankukiran/form-copilot/issues)

</div>

---

## Overview

Form Copilot is a prototype AI assistant that provides real-time, field-level guidance for complex forms like permit applications. Click any form field to get an instant, structured explanation -- what it means, why it's asked, what to enter, common mistakes, and examples -- then ask follow-up questions in a scoped chat.

## Features

- **Field-Level AI Assistance** -- click any field to get structured, contextual help
- **Structured Explanations** -- organized into what it means, why it's asked, what to enter, examples, and common mistakes
- **Follow-Up Chat** -- ask scoped follow-up questions about any field
- **Multi-Language Support** -- get explanations in multiple languages
- **Responsive Drawer UI** -- assistant slides in from the right, matching the design mockup
- **Serverless Backend** -- Vercel Functions with Groq-powered inference

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Angular 21, PrimeNG 21, RxJS, SCSS |
| **Backend** | Vercel Node Functions |
| **AI** | Groq SDK (LLM inference) |
| **Validation** | Zod 4 |
| **Testing** | Playwright (E2E), Vitest (unit) |
| **Language** | TypeScript 5.9 |
| **Package Manager** | pnpm 10 |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 10
- [Vercel CLI](https://vercel.com/cli) (for local API development)
- A [Groq API key](https://console.groq.com)

### Installation

```bash
git clone https://github.com/pradhankukiran/form-copilot.git
cd form-copilot
pnpm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

Add your credentials to `.env.local`:

```
GROQ_API_KEY=your_key_here
GROQ_MODEL=gpt-oss-120b
```

### Development

Run the frontend and API in separate terminals:

```bash
pnpm dev:web   # Angular on http://localhost:4200 (proxies /api/* to :3000)
pnpm dev:api   # Vercel functions on http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check -- returns provider, model, timestamp |
| `POST` | `/api/assistant/explain` | Get a structured explanation for a form field |
| `POST` | `/api/assistant/chat` | Send a follow-up message with conversation context |

## Project Structure

```
form-copilot/
├── src/
│   ├── app/
│   │   ├── components/     # UI components
│   │   ├── services/       # AssistantService, session store
│   │   ├── models/         # TypeScript interfaces
│   │   └── data/           # Sample permit field definitions
│   └── shared/             # Shared contracts between frontend & API
├── api/
│   ├── health.ts           # Health check endpoint
│   ├── assistant/
│   │   ├── explain.ts      # POST /api/assistant/explain
│   │   └── chat.ts         # POST /api/assistant/chat
│   └── _lib/               # Shared API utilities, prompts, schemas
└── vercel.json             # Vercel deployment config
```

## Testing

```bash
pnpm test        # Unit tests (watch mode)
pnpm test:ci     # Unit tests (single run)
pnpm check:api   # Type-check API layer
```

## Deployment

The project is configured for [Vercel](https://vercel.com) out of the box:

- **Frontend** -- static Angular SPA
- **Backend** -- Vercel Node Functions under `api/`
- **SPA fallback** -- handled via `vercel.json` rewrites

Set these environment variables in your Vercel project:

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Your Groq API key |
| `GROQ_MODEL` | Model identifier (default: `gpt-oss-120b`) |

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
