# backend/src/

Backend source code. Entry point: `index.ts`.

| File/Dir | Description |
|----------|-------------|
| `index.ts` | Fastify server bootstrap (port 3001, CORS, route registration) |
| `store.ts` | `IGraphStore` interface + lazy proxy singleton |
| `routes/` | 4 route modules (persons, edges, graph, research) |
| `__tests__/` | 104 tests (51 store + 45 routes + 8 research-routes) |
