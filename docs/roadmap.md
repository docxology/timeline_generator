# Roadmap

## Phase 0 — Foundation ✅

- [x] Monorepo scaffolding (pnpm workspaces)
- [x] Shared data model (TypeScript + Zod)
- [x] Fuller seed network (20 persons, 42 edges, 46 events)
- [x] Fastify REST API
- [x] D3 force-directed graph visualization
- [x] SVG timeline with brush filtering
- [x] Three-panel UI with layer toggles
- [x] Person detail & edge inspector panels
- [x] Documentation suite (15 files)

## Phase 1 — Neo4j & Research ✅

- [x] **Neo4j graph database** — persistent Cypher-backed storage via Docker
- [x] **IGraphStore interface** — strict async contract for all store operations
- [x] **Neo4jStore implementation** — 600+ lines of optimized Cypher queries
- [x] **Seed data hydration** — automatic constraint + data insertion on first boot
- [x] **Perplexity search** — LLM-powered person research and auto-add to graph
- [x] **Perplexity enrichment** — enrich existing persons with additional AI research
- [x] **Graceful shutdown** — clean Neo4j driver teardown on SIGINT/SIGTERM
- [x] **204-test suite** — passing under async interface (MemoryStore for speed)
- [x] **`run.sh` orchestrator** — all-in-one script for preflight, tests, and launch

## Phase 1.5 — UI Polish ✅

- [x] **Edge type labels** — relationship types displayed at edge midpoints, rotated to follow angle
- [x] **Edge hover effects** — stroke thickens and opacity increases on mouseenter
- [x] **Smart date display** — same-year birth/death collapses to single year (no "1941–1941")
- [x] **Enrich Existing tab** — searchable dropdown of all graph persons in Research modal
- [x] **Enrich on duplicate** — "Enrich Their Profile" button when research finds existing person
- [x] **Documentation screenshots** — 5 screenshots + 3 demo videos embedded in README
- [x] **Gold glow selection** — selected node gets gold (#FFD700) SVG glow ring with pulse animation
- [x] **RightPanel Enrich button** — one-click `✨ Enrich Profile` in the right detail pane
- [x] **Edge integration** — Perplexity prompt receives existing node names for precise edge matching
- [x] **Enrich loading UX** — modal correctly shows `Enriching [Name]…` instead of empty query

## Phase 2 — Advanced Visualization

- [ ] **WebGL renderer** — Canvas/WebGL for 1000+ node graphs
- [ ] **Hierarchical layout** — tree and radial graph modes
- [ ] **Timeline integration** — edges rendered on timeline as arcs
- [ ] **Clustering** — automatic community detection (Louvain via APOC)
- [ ] **Path highlighting** — visual shortest path animation
- [ ] **Minimap** — overview navigator for large graphs
- [ ] **Auto-population** — suggest edges and events from LLM analysis
- [ ] **Source management** — citation chain tracking and verification
- [ ] **Import/Export** — JSON, CSV, and GraphML format support
- [ ] **Undo/Redo** — command-pattern state management

## Phase 3 — Multi-User & Scale

- [ ] **Authentication** — user accounts, sessions
- [ ] **Collaboration** — shared graphs, real-time editing
- [ ] **Version history** — graph change tracking
- [ ] **Public sharing** — embed-ready graph widgets
- [ ] **Multiple seed networks** — beyond Fuller
- [ ] **Plugin system** — custom edge types, event types, domains
- [ ] **API rate limiting** — production hardening
- [ ] **CI/CD** — automated testing and deployment pipeline
