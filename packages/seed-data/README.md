# @timeline-generator/seed-data

Buckminster Fuller intellectual network dataset: 20 persons, 42 edges, 46 temporal events.

## Contents

| File | Records | Description |
|------|---------|-------------|
| `src/persons.ts` | 20 | Fuller, Noguchi, McLuhan, Cage, Cunningham, etc. |
| `src/edges.ts` | 42 | Typed relationships across 10 categories |
| `src/events.ts` | 46 | Births, deaths, publications, inventions, awards |
| `src/index.ts` | — | Barrel export |

## Usage

```typescript
import { PERSONS, EDGES, EVENTS } from 'seed-data';
```

## Tests

28 tests in `src/__tests__/data-integrity.test.ts`:

- All edge source/target IDs reference valid persons
- All event person IDs reference valid persons
- Required fields present and valid
- Confidence values in [0, 1]
