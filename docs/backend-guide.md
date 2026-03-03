# Backend Guide

The backend is a Fastify-based REST API that serves graph data from a Neo4j graph database.

## Entry Point

**File:** `packages/backend/src/server.ts`

Initializes Fastify with:

- **Neo4j Initialization** — connects to Neo4j via Bolt protocol, applies schema constraints, hydrates seed data on first boot
- **Store Injection** — swaps the global store to `Neo4jStore` for persistent graph operations
- **CORS** — allows frontend dev servers (ports 5173, 5174, 3000)
- **Pino logging** — structured JSON logs with pino-pretty for development
- **Route registration** — modular route files for persons, edges, graph queries, and research
- **Health check** — `GET /api/health` returns server status, engine type, and version
- **Graceful shutdown** — closes Fastify and Neo4j driver on SIGINT/SIGTERM

## Neo4j Graph Store

**File:** `packages/backend/src/neo4jStore.ts`

The `Neo4jStore` class implements the `IGraphStore` interface using Cypher queries against the Neo4j database.

### IGraphStore Interface

**File:** `packages/backend/src/store.ts`

Defines the storage contract. All routes import and call methods on a lazy proxy singleton — the implementation is injected at boot.

### Methods

#### Person Operations

| Method | Signature | Description |
|---|---|---|
| `getAllPersons` | `(filters?) → Promise<Person[]>` | Cypher MATCH with WHERE conditions |
| `getPersonById` | `(id) → Promise<Person \| undefined>` | Cypher MATCH by id property |
| `createPerson` | `(data) → Promise<Person>` | Cypher CREATE with serialized props |
| `updatePerson` | `(id, data) → Promise<Person \| undefined>` | Cypher SET += partial update |
| `deletePerson` | `(id) → Promise<boolean>` | Cypher DETACH DELETE |

#### Edge Operations

| Method | Signature | Description |
|---|---|---|
| `getAllEdges` | `() → Promise<Edge[]>` | MATCH directed relationships |
| `getEdgeById` | `(id) → Promise<Edge \| undefined>` | MATCH by relationship property |
| `getEdgesForPerson` | `(personId, edgeTypes?) → Promise<Edge[]>` | Undirected MATCH with deduplication |
| `createEdge` | `(data) → Promise<Edge>` | CREATE with dynamic relationship type |
| `updateEdge` | `(id, data) → Promise<Edge \| undefined>` | SET += on relationship properties |
| `deleteEdge` | `(id) → Promise<boolean>` | DELETE relationship by property |

#### Event Operations

| Method | Signature | Description |
|---|---|---|
| `getEventsForPerson` | `(personId) → Promise<TemporalEvent[]>` | MATCH via HAS_EVENT relationship |
| `createEvent` | `(data) → Promise<TemporalEvent>` | CREATE Event node + HAS_EVENT link |

#### Graph Algorithms

| Method | Signature | Description |
|---|---|---|
| `getEgoNetwork` | `(personId, depth?, edgeTypes?) → Promise<NetworkResponse>` | Variable-length path traversal |
| `findShortestPath` | `(fromId, toId) → Promise<PathResult \| null>` | Native `shortestPath()` Cypher function |
| `getTimelineData` | `(personIds?) → Promise<TimelineData>` | Aggregated timeline with events and edges |
| `getDegreesMap` | `() → Promise<Map<string, number>>` | Degree COUNT aggregation |
| `getCounts` | `() → Promise<{persons, edges, events}>` | Full entity count query |

## Seed Data Hydration

**File:** `packages/backend/src/hydrate.ts`

On first boot, if the Neo4j database is empty:

1. Uniqueness constraints are applied (`Person.id`, `Event.id`)
2. All seed persons (20) are inserted as `:Person` nodes
3. All seed edges (42) are inserted as typed relationships
4. All seed events (46) are inserted as `:Event` nodes linked via `-[:HAS_EVENT]->`

Subsequent boots detect existing data and skip hydration.

## Route Modules

### `routes/persons.ts`

Handles `/api/persons/*` — CRUD, events, and ego network.

### `routes/edges.ts`

Handles `/api/edges/*` — CRUD operations.

### `routes/graph.ts`

Handles `/api/graph/full`, `/api/timeline`, and `/api/paths`.

### `routes/research.ts`

Handles `/api/research` and `/api/research/enrich/:id` for Perplexity AI queries.

**Key functions:**

- `normalizePersonData(data)` — ensures all required Person fields exist with sensible defaults before `createPerson`. Handles string-to-object occupation conversion, confidence clamping to `[0, 1]`, and date preservation.
- `callPerplexityAPI(name, apiKey, existingNames)` — sends a structured prompt to Perplexity Sonar API requesting JSON biographical data. Injects existing graph person names into the prompt so that `suggestedEdges` target names precisely match existing nodes.
- Edge matching uses exact case-insensitive comparison against `canonicalName` and `alternateNames` to prevent false negatives from fuzzy search.

## Development

```bash
# Start Neo4j
docker compose up -d

# Start with hot-reload
pnpm --filter backend dev

# Type-check
pnpm --filter backend build

# Run tests (uses in-memory MemoryStore, no Neo4j required)
pnpm --filter backend test
```

The backend runs via `tsx watch` which provides TypeScript execution without compilation step, file watching with auto-restart, and ESM module support.
