# AGENTS.md — Timeline Generator

## Project Identity

- **Name**: Timeline Generator
- **Version**: 1.0.0
- **Stack**: React/D3 frontend · Fastify/Neo4j backend · Zod schemas · Vitest
- **Theme**: Black, Gray, White, Red — no blue

## Repo Structure

Monorepo managed by pnpm workspaces with 4 packages:

- `packages/shared` — Types, Zod schemas, enums, constants
- `packages/seed-data` — 20-person Fuller network dataset
- `packages/backend` — Fastify REST API + Neo4j graph database
- `packages/frontend` — React SPA with D3 force graph and SVG timeline

## Conventions

- All source code is TypeScript (strict mode via `tsconfig.base.json`)
- Every module has `@module` JSDoc with `@description`
- Every public method has JSDoc with `@param` / `@returns`
- Tests use Vitest and live in `src/__tests__/` within each package
- API routes follow RESTful conventions: GET/POST/PATCH/DELETE
- All interactive elements have `aria-label` or equivalent accessibility attributes
- Inline styles are used only for dynamic data-driven values (domain colors, edge colors)

## Key Commands

```bash
pnpm dev          # concurrent backend + frontend
pnpm build        # sequential: shared → seed-data → backend → frontend
pnpm test         # 204 tests across shared, seed-data, backend
./run.sh          # all-in-one: preflight, install, test, launch
./run.sh --skip-tests   # skip test suite
./run.sh --test-only    # run tests only, no servers
```

## Data Model

- **Person**: canonical name, dates, occupations, affiliations, confidence, provenance
- **Edge**: typed relationship (24 EdgeTypes → 10 categories), direction, confidence
- **TemporalEvent**: dated event attached to a person (12 EventTypes)
- **FocalGraph**: saved graph view configuration

## API Overview

19 REST endpoints under `/api/`:

- `/api/persons` — CRUD + events + ego network (8 routes)
- `/api/edges` — CRUD (5 routes)
- `/api/graph/full`, `/api/timeline`, `/api/paths` — graph queries (3 routes)
- `/api/research` — Perplexity AI research & enrichment (2 routes)
- `/api/health` — health check (1 route)

## External Dependencies

- `PERPLEXITY_API_KEY` env var required for research feature (graceful fallback if missing)
