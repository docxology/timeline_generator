# Contributing

## Development Workflow

1. Create a feature branch from `main`
2. Make changes in the relevant package(s)
3. Run tests: `pnpm test`
4. Start dev servers to verify: `pnpm dev`
5. Submit a pull request

## Code Style

### TypeScript

- **Strict mode** enabled (`"strict": true`)
- Use `interface` for data shapes, `type` for unions/intersections
- Use `enum` for finite value sets (edge types, event types)
- All functions should have JSDoc documentation
- Prefer `const` over `let`; avoid `var`

### React

- Function components only (no class components)
- Hooks for all state and side effects
- Zustand selectors should access primitive/stable values (no `.filter()` in selectors)
- Use `useMemo` for derived data to avoid infinite render loops

### File Organization

- One component per file
- Barrel exports (`index.ts`) for packages
- Tests in `__tests__/` directories adjacent to source

### Naming

- **Files:** kebab-case for docs, PascalCase for React components, camelCase for utilities
- **Interfaces:** PascalCase (`Person`, `EdgeType`)
- **Constants:** UPPER_SNAKE_CASE (`DOMAIN_COLORS`, `EDGE_TYPE_TO_CATEGORY`)
- **Functions:** camelCase (`getPersonById`, `findShortestPath`)

## Adding a New Person

1. Add to `packages/seed-data/src/persons.ts`
2. Add edges in `packages/seed-data/src/edges.ts`
3. Add events in `packages/seed-data/src/events.ts`
4. Run data integrity tests: `pnpm --filter seed-data test`
5. Restart backend to load new data

## Adding a New Edge Type

1. Add to `EdgeType` enum in `packages/shared/src/constants.ts`
2. Add category mapping in `EDGE_TYPE_TO_CATEGORY`
3. Update `EdgeSchema` if needed in `packages/shared/src/schemas.ts`
4. Run shared tests: `pnpm --filter shared test`
5. Update docs: `docs/data-model.md`

## Adding a New API Endpoint

1. Create or modify route file in `packages/backend/src/routes/`
2. Add `IGraphStore` method in `packages/backend/src/store.ts` and implement in `neo4jStore.ts`
3. Register route in `packages/backend/src/server.ts`
4. Add API client method in `packages/frontend/src/api/client.ts`
5. Write tests
6. Update docs: `docs/api-reference.md`

## Package Dependencies

- Workspace packages reference each other via `"workspace:*"` in `package.json`
- All packages use `"type": "module"` for ESM
- After changing any `package.json`, run `pnpm install` from root
