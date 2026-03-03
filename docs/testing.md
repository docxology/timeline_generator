# Testing

## Test Framework

The project uses [Vitest](https://vitest.dev/) for unit and integration testing across all packages.

## Running Tests

```bash
# All packages (204 tests)
pnpm test

# Specific package
pnpm --filter shared test
pnpm --filter seed-data test
pnpm --filter backend test

# Watch mode
pnpm --filter shared test -- --watch

# With coverage
pnpm --filter shared test -- --coverage
```

## Test Structure

```
packages/
├── shared/
│   └── src/__tests__/
│       ├── constants.test.ts     # Enum completeness, color map coverage (25 tests)
│       ├── schemas.test.ts       # Zod validation pass/fail cases (30 tests)
│       └── exports.test.ts       # Barrel export completeness (17 tests)
├── backend/
│   └── src/__tests__/
│       ├── store.test.ts         # IGraphStore CRUD, network queries, edge update, graph assembly (51 tests)
│       ├── routes.test.ts        # Store-level route logic + normalizations (45 tests)
│       └── research-routes.test.ts # Fastify HTTP integration for Add/Enrich endpoints (8 tests)
└── seed-data/
    └── src/__tests__/
        └── data-integrity.test.ts  # Referential integrity, schema validation, edge type consistency (28 tests)
```

## Test Summary

| Package | Files | Tests | Coverage |
|---|---|---|---|
| `shared` | 3 | 72 | Schemas, constants, barrel exports |
| `seed-data` | 1 | 28 | Data integrity, referential checks, edge type consistency |
| `backend` | 3 | 104 | Store methods, edge update, graph assembly, HTTP route handler logic, research/enrichment |
| **Total** | **7** | **204** | |

## Test Categories

### Unit Tests (`shared`)

1. **Schema validation** — valid data passes, invalid data fails with correct error messages
2. **Constants completeness** — every `EdgeType` has a category mapping, every `EdgeCategory` has a color
3. **Confidence tiers** — tiers cover 0.0–1.0 without gaps
4. **Barrel exports** — all types, schemas, enums, constants accessible through package index

### Data Integrity Tests (`seed-data`)

1. **Referential integrity** — all edge `sourceId`/`targetId` reference existing persons
2. **All event `personId`** values reference existing persons
3. **Schema validation** — all seed entities pass their Zod schemas
4. **Unique IDs** — no duplicate IDs across entities
5. **Date consistency** — birth dates precede death dates
6. **Edge type validity** — all seed edge types are valid `EdgeType` enum values
7. **Category mapping** — all seed edge types have a valid `EDGE_TYPE_TO_CATEGORY` mapping
8. **No duplicate edges** — no two edges share the same source, target, and type
9. **Strength bounds** — all edge strengths in `[0, 1]` when present
10. **Event quality** — all events have non-empty titles

### Store Tests (`backend`)

1. **CRUD operations** — create, read, update, delete for persons, edges, events
2. **Search filtering** — text search matches name, alternateNames, and tags
3. **Ego network** — BFS traversal returns correct neighbors and edges at configured depth
4. **Shortest path** — finds correct paths, returns null for disconnected nodes
5. **Timeline data** — correct year calculations, time range computation, living persons
6. **Degree computation** — correct degree counts for all nodes
7. **Edge update** — partial updates preserve unmodified fields, returns undefined for nonexistent
8. **Full graph assembly** — assembled graph has valid node-edge referential integrity

### Route Integration Tests (`backend`)

1. **Person routes** — CRUD, search filters, events, ego network (16 tests)
2. **Edge routes** — CRUD, error handling (10 tests)
3. **Graph routes** — timeline data, shortest path, full graph payload, counts (8 tests)

### Research & Enrichment Tests (`backend`)

1. **normalizePersonData** — field defaults, confidence clamping, string occupation conversion, date preservation (7 tests)
2. **Enrichment merge logic** — occupation dedup, tag dedup, birthDate update (4 tests)

## Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PersonSchema } from 'shared';

describe('PersonSchema', () => {
  it('validates a complete person record', () => {
    const result = PersonSchema.safeParse({
      id: 'test-person',
      canonicalName: 'Test Person',
      occupations: [{ name: 'Engineer' }],
      confidence: 0.85,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = PersonSchema.safeParse({ id: 'missing-name' });
    expect(result.success).toBe(false);
  });
});
```

## Coverage Targets

| Package | Target | Notes |
|---|---|---|
| `shared` | 95%+ | All schemas, constants, and exports |
| `backend/store` | 90%+ | All methods exercised |
| `backend/routes` | 85%+ | Route handler logic |
| `seed-data` | 100% | Full referential integrity |
