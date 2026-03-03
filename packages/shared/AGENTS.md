# AGENTS.md — shared

Zero-dependency shared package. All other packages depend on it.

## Key Patterns

- Enums use UPPER_SNAKE_CASE values matching the enum member name
- Zod schemas provide runtime validation; TS types provide compile-time safety
- All color values are hex strings from the Black/Gray/White/Red palette — no blue
- `EDGE_TYPE_TO_CATEGORY` maps all 24 EdgeTypes to 10 categories exhaustively
- `Create*Schema` and `Update*Schema` variants omit `id` for use in POST/PATCH

## Build

```bash
pnpm --filter shared build     # tsc → dist/
```

## File Map

```
src/
├── types.ts       # TypeScript interfaces
├── schemas.ts     # Zod validation schemas
├── constants.ts   # Enums, color maps, presets
├── index.ts       # Barrel export
└── __tests__/     # 72 tests (3 files)
```
