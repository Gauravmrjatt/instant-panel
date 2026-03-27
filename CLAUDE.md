# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Instant Panel is an affiliate/campaign management dashboard with a separate client and server. The server is an Express.js API (plain JS, CommonJS) backed by MongoDB, Redis, and RabbitMQ. The client is a Next.js 16 app (TypeScript, App Router) using shadcn/ui components with Tailwind CSS v4.

## Development Commands

### Client (`client/`)
```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check (tsc --noEmit)
pnpm format       # Prettier (ts, tsx files)
```

### Server (`server/`)
```bash
node server/index.js       # Start server directly
nodemon server/index.js    # Start with auto-reload (use `pnpm all` from server/)
```

### Infrastructure (Docker Compose)
```bash
docker compose up          # Start MongoDB + Redis (dev services)
docker compose -f docker-compose.override.yml up  # Full stack with frontend/backend images, RabbitMQ, Prometheus, mongo-express
```

## Architecture

### Two independent apps, one repo
- **`client/`** — Next.js 16 frontend (pnpm, TypeScript, runs on port 3001 in dev)
- **`server/`** — Express API backend (pnpm, plain JS, runs on port 3000/5000)
- Each has its own `package.json`, `pnpm-lock.yaml`, `Dockerfile`, and `node_modules`
- No shared workspace — install dependencies separately in each directory

### Server structure
- **Entry:** `server/index.js` — Express app with MongoDB (Mongoose), CORS, Prometheus metrics
- **Route registration:** `server/middlewares/routes.js` — flat route table mapping URL paths to handler files
- **Auth:** `server/middlewares/auth.js` — JWT auth via `authValid` (token verify) and `authValidWithDb` (+ DB session check). Token read from cookie, Authorization header, x-access-token header, body, or query
- **JWT secret:** stored in `server/myDetails.json` (`enc_secret` field)
- **Models:** `server/models/` — Mongoose schemas (Users, Campaigns, Leads, Clicks, Payments, etc.)
- **Business logic:** `server/lib/` — payment handling, Redis client, RabbitMQ, lead saving, notifications
- **Routes:** `server/routes/auth/` for auth flows, `server/routes/api/` for all API endpoints organized by domain (leads, campaigns, payments, postback, etc.)

### Client structure
- **App Router:** `client/app/` with `auth/` (login, register, forget) and `dashboard/` route groups
- **Dashboard layout:** `client/app/dashboard/layout.tsx` — authenticated wrapper with collapsible sidebar + sub-nav
- **Auth:** `client/context/AuthContext.tsx` — React context storing JWT in localStorage, provides `useAuth()` hook
- **API calls:** `client/lib/config.ts` — `authFetch()` helper that attaches Bearer token from localStorage. Base URL from `NEXT_PUBLIC_API_URL` env var
- **Data fetching:** TanStack React Query hooks in `client/hooks/` (useLeads, useCampaigns, usePayments, useClicks, etc.)
- **UI:** shadcn/ui components in `client/components/ui/`, configured via `components.json`. TanStack Table for data tables
- **Providers:** `client/app/providers.tsx` — wraps app in QueryClientProvider, AuthProvider, TooltipProvider, toast providers

### Environment
- Copy `.env.example` to `.env` for server config
- Client needs `NEXT_PUBLIC_API_URL` (set in `client/.env.local`)
- Key server env vars: `DB_URL` (MongoDB), `REDIS_URL`, `RABBITMQ_URL`, `CORS_ORIGIN`, `PORT`

### CI/CD
- GitHub Actions on push to `main` or version tags: builds Docker images and pushes to GHCR
- Separate workflows for frontend (`client/Dockerfile`) and backend (`server/Dockerfile`)
- Images: `ghcr.io/<owner>/instant-frontend`, `ghcr.io/<owner>/instant-backend`
