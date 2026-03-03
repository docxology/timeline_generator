# Getting Started

## Prerequisites

- **Node.js** ≥ 20.x
- **pnpm** ≥ 9.x (`npm install -g pnpm` or `corepack enable pnpm`)
- **Docker** — for running the Neo4j database (`docker compose up -d`)

## Installation

```bash
git clone https://github.com/docxology/timeline_generator.git
cd timeline_generator
pnpm install
```

## Starting Neo4j

```bash
docker compose up -d
```

This starts a Neo4j graph database on ports `7474` (browser) and `7687` (Bolt). On first backend boot, the database is automatically hydrated with seed data.

## Running the Development Servers

### Option 1: All-in-One Orchestrator (Recommended)

```bash
./run.sh
```

The `run.sh` script handles everything:

1. **Preflight checks** — Node.js, pnpm, Docker availability
2. **Dependency installation** — `pnpm install`
3. **Neo4j startup** — `docker compose up -d`
4. **TypeScript validation** — `npx tsc --noEmit`
5. **Test execution** — `pnpm test` (204 tests)
6. **Server launch** — backend + frontend concurrently
7. **Auto-open browser** — opens `http://localhost:5173`

Flags:

- `./run.sh --skip-tests` — skip the test suite
- `./run.sh --test-only` — run tests and exit

### Option 2: Manual Startup

#### Backend (port 3001)

```bash
pnpm --filter backend dev
```

Expected output:

```
[Server] Neo4j driver initialized
[Server] Neo4j constraints applied
[Hydrate] Inserted 20 persons, 42 edges, 46 events
[Server] Store switched to Neo4jStore (persistent)
🌐 Timeline Generator API running at http://localhost:3001
   Engine: Neo4j Graph Database
   Health: http://localhost:3001/api/health
   Persons: http://localhost:3001/api/persons
   Graph: http://localhost:3001/api/graph/full
```

#### Frontend (port 5173)

```bash
pnpm --filter frontend dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

#### Both at Once (parallel)

```bash
pnpm dev
```

## Running Tests

```bash
# All tests (204 across 4 packages, 7 test files)
pnpm test

# Specific package
pnpm --filter shared test
pnpm --filter seed-data test
pnpm --filter backend test
```

Tests use an in-memory MemoryStore for speed and do not require a running Neo4j instance.

## Perplexity API (Optional)

To enable the AI-powered research feature:

```bash
# Create packages/backend/.env
echo "PERPLEXITY_API_KEY=pplx-your-key-here" > packages/backend/.env
```

Without this key, the application works normally but the Research feature returns a setup prompt instead of results.

## Project Structure

```
timeline_generator/
├── docs/                    # This documentation (15 files + assets)
├── docker-compose.yml       # Neo4j service definition
├── run.sh                   # All-in-one orchestrator script
├── packages/
│   ├── shared/              # Types, schemas, constants
│   │   └── src/
│   │       ├── types.ts     # TypeScript interfaces
│   │       ├── schemas.ts   # Zod validation schemas
│   │       ├── constants.ts # Enums, colors, tiers
│   │       └── index.ts     # Barrel export
│   ├── seed-data/           # Initial dataset
│   │   └── src/
│   │       ├── persons.ts   # 20 persons
│   │       ├── edges.ts     # 42 edges
│   │       ├── events.ts    # 46 events
│   │       └── index.ts     # Barrel export
│   ├── backend/             # Fastify API + Neo4j
│   │   └── src/
│   │       ├── server.ts    # Entry point (Neo4j init)
│   │       ├── store.ts     # IGraphStore interface
│   │       ├── neo4jStore.ts# Neo4j Cypher implementation
│   │       ├── neo4j.ts     # Driver connection manager
│   │       ├── hydrate.ts   # Seed data hydration
│   │       └── routes/      # REST endpoints
│   └── frontend/            # React + D3 UI
│       └── src/
│           ├── App.tsx      # Main layout
│           ├── graph/       # D3 graph canvas
│           ├── timeline/    # SVG timeline
│           ├── components/  # Panels, controls, research
│           ├── store/       # Zustand stores
│           └── api/         # API client
├── package.json             # Root monorepo config
├── pnpm-workspace.yaml      # Workspace definition
└── tsconfig.base.json       # Shared TS config
```

## First Steps

1. **Explore the graph** — pan with mouse drag, zoom with scroll wheel
2. **Click a person** — opens the detail panel on the right
3. **Hover an edge** — see the edge type label and highlight effect
4. **Click an edge** — click a relationship line to see edge details
5. **Use layer presets** — toggle between Intellectual, Social, Family views
6. **Brush the timeline** — drag across the bottom timeline to filter by date range
7. **Search** — type in the search box to filter the person list
8. **Research new people** — click Research → search for any historical figure
9. **Enrich existing people** — click Research → Enrich Existing tab → select a person
