# @timeline-generator/shared

Shared TypeScript types, Zod schemas, enums, and constants used across all packages.

## Exports

| Module | Contents |
|--------|----------|
| `types.ts` | Person, Edge, TemporalEvent, Place, Source, FocalGraph interfaces |
| `schemas.ts` | Zod schemas + Create/Update variants for all entities |
| `constants.ts` | EdgeType (24), EdgeCategory (10), EventType (12), DatePrecision, EdgeDirection, DOMAIN_COLORS, EDGE_CATEGORY_COLORS, CONFIDENCE_TIERS, LAYER_PRESETS |
| `index.ts` | Barrel re-export of all modules |

## Usage

```typescript
import { PersonSchema, EdgeType, DOMAIN_COLORS } from 'shared';
```

## Tests

72 tests in `src/__tests__/`:

- `constants.test.ts` — Enum completeness, color map coverage
- `schemas.test.ts` — Parse/reject validation
- `exports.test.ts` — Barrel export completeness (140 assertions)
