# AGENTS.md — docs/

Documentation hub with 15 modular Markdown files. See [README.md](./README.md) for the full index.

## Directory Purpose

All user-facing documentation lives here. Each file covers one topic. The `README.md` is the index page with a quick-links table.

## File Inventory

- `README.md` — Index and project overview
- `api-reference.md` — 18 REST endpoints
- `architecture.md` — System design, monorepo, data flow
- `backend-guide.md` — Fastify, Neo4j store, routes
- `configuration.md` — Env vars, Docker, Vite, TS config
- `contributing.md` — Code style, PR process
- `data-model.md` — Person, Edge, Event schemas
- `frontend-guide.md` — React, D3, Zustand, components
- `getting-started.md` — Install, setup, first run
- `glossary.md` — Domain terminology
- `research.md` — Perplexity AI research & enrichment
- `roadmap.md` — Phase 0–3 plans
- `seed-data.md` — Fuller network dataset
- `testing.md` — 204-test suite across 7 files

## Assets

The `assets/` directory contains screenshots and demo recordings:

- `screenshot_graph.png` — Main graph view with edge type labels
- `screenshot_person_detail.png` — Person detail panel
- `screenshot_research_new.png` — Research modal (New Person tab)
- `screenshot_research_enrich.png` — Research modal (Enrich Existing tab)
- `screenshot_edge_inspector.png` — Edge inspector panel
- `demo_ui_improvements.webp` — UI improvements walkthrough video
- `demo_walkthrough.webp` — Feature walkthrough video
- `timeline_demo.webp` — Full application demo

## Conventions

- Use relative links between docs (e.g., `[API](./api-reference.md)`)
- Keep code examples short and runnable
- Update test counts when adding new tests
- Screenshots live in `assets/` and are referenced with relative paths
