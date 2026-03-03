# packages/

pnpm workspace containing the four Timeline Generator packages:

| Package | Description | Key Files |
|---------|-------------|-----------|
| [shared/](./shared/) | Types, Zod schemas, enums, constants | `src/types.ts`, `src/schemas.ts`, `src/constants.ts` |
| [seed-data/](./seed-data/) | Buckminster Fuller network dataset | `src/persons.ts`, `src/edges.ts`, `src/events.ts` |
| [backend/](./backend/) | Fastify REST API + Neo4j graph database | `src/store.ts`, `src/routes/` |
| [frontend/](./frontend/) | React + D3 force graph + SVG timeline | `src/App.tsx`, `src/graph/`, `src/timeline/` |

Dependency order: `shared` → `seed-data` → `backend` / `frontend`
