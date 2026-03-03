# @timeline-generator/backend

Fastify REST API backed by Neo4j graph database, 18 endpoints, and Perplexity AI integration.

## Architecture

```
src/
├── index.ts           # Fastify server bootstrap (port 3001)
├── store.ts           # IGraphStore interface + singleton
├── routes/
│   ├── persons.ts     # 8 person CRUD + events + network routes
│   ├── edges.ts       # 5 edge CRUD routes
│   ├── graph.ts       # 3 graph query routes (timeline, paths, full)
│   └── research.ts    # 2 Perplexity research routes
└── __tests__/
    ├── store.test.ts           # 51 unit tests for IGraphStore
    ├── routes.test.ts          # 45 integration tests for all endpoints + normalizePersonData
    └── research-routes.test.ts # 8 HTTP integration tests for add/enrich
```

## Key Components

### IGraphStore (`store.ts`)

Async graph store interface implemented by Neo4jStore (Cypher queries) in production. 19 interface methods covering:

- Person CRUD + filtered queries (search, domain, year range)
- Edge CRUD + person-scoped queries
- Event CRUD + chronological retrieval
- BFS ego network traversal
- Shortest path finding
- Timeline data aggregation
- Degree computation

### Routes

18 REST endpoints under `/api/`. See [docs/api-reference.md](../../docs/api-reference.md) for full documentation.

## Running

```bash
pnpm --filter backend dev      # Start on port 3001
pnpm --filter backend test     # 104 tests
pnpm --filter backend build    # tsc → dist/
```

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `PERPLEXITY_API_KEY` | No | Enables AI research; graceful fallback if missing |
| `PORT` | No | Server port (default: 3001) |
