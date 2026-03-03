# backend/src/routes/

REST API route modules. Each file exports an async registration function for Fastify.

| File | Endpoints | Description |
|------|-----------|-------------|
| `persons.ts` | 8 | Person CRUD, events, ego network |
| `edges.ts` | 5 | Edge CRUD |
| `graph.ts` | 3 | Timeline, shortest path, full graph |
| `research.ts` | 2 | Perplexity AI research + graph enrichment |
