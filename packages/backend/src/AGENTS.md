# AGENTS.md — backend/src/

The server bootstraps in `index.ts`: creates Fastify with CORS, registers routes, starts listening.
`store.ts` exports the `IGraphStore` interface (19 async methods) and a lazy proxy singleton. `neo4jStore.ts` implements the interface with Cypher queries.
`hydrate.ts` seeds the Neo4j database on first boot from the seed-data package.
`routes/research.ts` contains `normalizePersonData()` (field defaults, confidence clamping, occupation conversion) and `callPerplexityAPI()` (structured Perplexity Sonar queries with existing-name injection for edge matching).
All route files are in `routes/` and are registered via `app.register()` in `index.ts`.
