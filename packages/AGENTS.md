# AGENTS.md — packages/

Monorepo workspace root. Contains 4 TypeScript packages with strict dependency ordering.

## Package Graph

```
shared (no deps)
  └── seed-data (depends on shared)
        ├── backend (depends on shared + seed-data)
        └── frontend (depends on shared)
```

## Build Order

Sequential: shared → seed-data → backend → frontend (enforced by root `pnpm build`).
