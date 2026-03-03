# AGENTS.md — backend

Fastify-based REST API. Depends on `shared` (types/schemas) and `seed-data` (initial graph data).

## Conventions

- All routes are async functions registered via `app.register()`
- Every route handler has JSDoc with `@query`, `@body`, `@returns` annotations
- The `store` is a lazy proxy singleton implementing `IGraphStore`, backed by `Neo4jStore` in production
- 404 errors return `{ error: "... not found" }` with status code 404
- 400 errors return `{ error: "..." }` with status code 400
- Created resources return status 201
- The store is injected at boot via `setGraphStore()` — `Neo4jStore` is the active implementation

## API Endpoint Summary

| Route Module | Endpoints | Methods |
|-------------|-----------|---------|
| `persons.ts` | 8 | GET, POST, PATCH, DELETE |
| `edges.ts` | 5 | GET, POST, PATCH, DELETE |
| `graph.ts` | 3 | GET |
| `research.ts` | 2 | POST |
| health | 1 | GET |

## Tests

104 tests across 3 files:

- `store.test.ts` — 51 unit tests (CRUD, filters, BFS, paths, timeline, degrees, edge update, graph assembly)
- `routes.test.ts` — 45 integration tests (all endpoints, normalizePersonData, enrichment merge logic)
- `research-routes.test.ts` — 8 HTTP integration tests (Fastify add/enrich endpoints)
